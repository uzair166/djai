import { useState, useEffect } from "react";
import { SpotifyTrack } from "@/types/spotify";
import { Input } from "./ui/input";
import { TrackCard } from "./track-card";
import { useDebounce } from "@/hooks/use-debounce";

interface TrackSearchProps {
  onSelect: (track: SpotifyTrack) => void;
}

export function TrackSearch({ onSelect }: TrackSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    async function searchTracks() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/spotify/search?q=${encodeURIComponent(debouncedQuery)}`
        );
        if (!response.ok) throw new Error("Failed to search tracks");
        const tracks: SpotifyTrack[] = await response.json();
        setResults(tracks);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    searchTracks();
  }, [debouncedQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for a song..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pr-10"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      
      <div className="relative min-h-[100px]">
        {!query.trim() && (
          <div className="text-center text-muted-foreground py-8">
            Start typing to search for songs
          </div>
        )}
        
        {query.trim() && !isLoading && results.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No songs found for &ldquo;{query}&rdquo;
          </div>
        )}

        <div className="space-y-2">
          {results.map((track) => (
            <div
              key={track.id}
              className="transform transition-all duration-200 hover:scale-[1.02]"
            >
              <TrackCard
                track={track}
                onClick={() => onSelect(track)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 