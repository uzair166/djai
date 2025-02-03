import { useState } from "react";
import { SpotifyTrack, GenerationResult, SpotifyTrackWithReason } from "@/types/spotify";
import { useLocalStorage } from "./useLocalStorage";

interface GenerationOptions {
  seedTracks: SpotifyTrack[];
  prompt?: string;
  numberOfTracks: number;
  skipSave?: boolean;
}

interface GeneratedTrack {
  name: string;
  artist: string;
  reason: string;
}

interface GeneratedPlaylist {
  playlistName: string;
  recommendations: GeneratedTrack[];
}

export function usePlaylistGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlaylist, setGeneratedPlaylist] = useLocalStorage<GenerationResult | null>("generatedPlaylist", null);

  const resetGeneration = () => {
    setGeneratedPlaylist(null);
    setError(null);
  };

  const removeTrackFromGenerated = (trackId: string) => {
    if (!generatedPlaylist) return;
    
    setGeneratedPlaylist({
      ...generatedPlaylist,
      tracks: generatedPlaylist.tracks.filter(({ track }) => track.id !== trackId),
    });
  };

  const reorderTracks = (oldIndex: number, newIndex: number) => {
    if (!generatedPlaylist) return;

    const tracks = [...generatedPlaylist.tracks];
    const [removed] = tracks.splice(oldIndex, 1);
    tracks.splice(newIndex, 0, removed);

    setGeneratedPlaylist({
      ...generatedPlaylist,
      tracks,
    });
  };

  const generatePlaylist = async ({
    seedTracks,
    prompt,
    numberOfTracks,
    skipSave,
  }: GenerationOptions) => {
    console.log("[Playlist Generation] Starting playlist generation", {
      numberOfTracks,
      prompt,
      seedTracks: seedTracks.map(t => `${t.name} by ${t.artists[0].name}`),
    });
    
    setIsGenerating(true);
    setError(null);
    setGeneratedPlaylist(null);

    try {
      // Get AI recommendations
      console.log("[Playlist Generation] Requesting AI recommendations");
      const aiResponse = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seedTracks, prompt, numberOfTracks }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        console.error("[Playlist Generation] AI recommendation request failed:", errorData);
        throw new Error(errorData.error || "Failed to generate recommendations");
      }

      const generatedData: GeneratedPlaylist = await aiResponse.json();
      console.log("[Playlist Generation] Received AI recommendations:", generatedData);
      
      if (!generatedData.recommendations || !Array.isArray(generatedData.recommendations)) {
        console.error("[Playlist Generation] Invalid recommendations format:", generatedData);
        throw new Error("Invalid recommendations format from server");
      }

      // Search for each recommended track on Spotify
      console.log("[Playlist Generation] Starting Spotify track search");
      const spotifyTracks = (await Promise.all(
        generatedData.recommendations.map(async (rec) => {
          const query = `${rec.name} artist:${rec.artist}`;
          console.log("[Playlist Generation] Searching Spotify for:", query);
          
          try {
            const searchResponse = await fetch(
              `/api/spotify/search?q=${encodeURIComponent(query)}`
            );
            
            if (!searchResponse.ok) {
              console.error("[Playlist Generation] Spotify search failed for:", query);
              return null;
            }

            const tracks: SpotifyTrack[] = await searchResponse.json();
            if (!tracks.length) {
              console.error("[Playlist Generation] No tracks found for:", query);
              return null;
            }
            
            console.log("[Playlist Generation] Found Spotify track:", tracks[0].name);
            return {
              track: tracks[0], // Use the first (best) match
              reason: rec.reason,
            };
          } catch (error) {
            console.error("[Playlist Generation] Error searching for track:", query, error);
            return null;
          }
        })
      )).filter((result): result is SpotifyTrackWithReason => result !== null);

      // Add seed tracks at the beginning with a reason
      const seedTracksWithReason: SpotifyTrackWithReason[] = seedTracks.map(track => ({
        track,
        reason: "One of your selected tracks"
      }));

      // Combine seed tracks with generated tracks
      const allTracks = [...seedTracksWithReason, ...spotifyTracks];

      // Create the playlist
      console.log("[Playlist Generation] Creating Spotify playlist");
      
      let playlist;
      if (!skipSave) {
        const playlistResponse = await fetch("/api/spotify/create-playlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: generatedData.playlistName,
            tracks: allTracks.map((t) => t.track),
            seedTracks: seedTracks.map((t) => t.name),
            prompt,
          }),
        });

        if (!playlistResponse.ok) {
          const errorData = await playlistResponse.json();
          console.error("[Playlist Generation] Failed to create playlist:", errorData);
          throw new Error(errorData.error || "Failed to create playlist");
        }

        playlist = await playlistResponse.json();
      }
      
      console.log("[Playlist Generation] Successfully processed playlist");
      
      const result = {
        playlist,
        tracks: allTracks,
        playlistName: generatedData.playlistName,
      };
      
      setGeneratedPlaylist(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      console.error("[Playlist Generation] Error:", err);
      if (err instanceof Error) {
        console.error("[Playlist Generation] Error stack:", err.stack);
      }
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
      console.log("[Playlist Generation] Generation process completed");
    }
  };

  return {
    generatePlaylist,
    isGenerating,
    error,
    generatedPlaylist,
    setGeneratedPlaylist,
    resetGeneration,
    removeTrackFromGenerated,
    reorderTracks,
  };
} 