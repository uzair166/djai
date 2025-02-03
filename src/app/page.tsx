"use client";

import { useState, useEffect } from "react";
import { SpotifyTrack, PlaylistHistoryItem } from "@/types/spotify";
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlaylistGeneration } from "@/hooks/usePlaylistGeneration";
import { useSpotify } from "@/hooks/useSpotify";
import { TrackCard } from "@/components/track-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableTrackCard } from "@/components/draggable-track-card";
import { formatTotalDuration } from "@/lib/utils";
import { usePlaylistHistory } from "@/hooks/usePlaylistHistory";
import { PlaylistHistoryPanel } from "@/components/playlist-history-panel";

export default function Home() {
  const [selectedTracks, setSelectedTracks] = useLocalStorage<SpotifyTrack[]>("selectedTracks", []);
  const [prompt, setPrompt] = useLocalStorage<string>("prompt", "");
  const [numberOfTracks, setNumberOfTracks] = useLocalStorage<string>("numberOfTracks", "10");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const { generatePlaylist, isGenerating, error, generatedPlaylist, setGeneratedPlaylist, resetGeneration, removeTrackFromGenerated, reorderTracks } = usePlaylistGeneration();
  const { isAuthenticated, login } = useSpotify();
  const { history, addToHistory, removeFromHistory, clearHistory, restoreFromHistory } = usePlaylistHistory();

  const loadingMessages = [
    "Teaching AI to appreciate lo-fi beats...",
    "Consulting with virtual music snobs...",
    "Calculating the perfect beats per minute...",
    "Arguing with AI about indie bands...",
    "Debating if pineapple belongs on playlists...",
    "Measuring vibes in metric system...",
    "Converting feelings to algorithms...",
    "Asking AI if it prefers vinyl...",
    "Synchronizing with parallel universe DJs...",
    "Translating emotions to frequencies...",
    "Checking if AI has music degree...",
    "Tuning virtual instruments...",
    "Running playlist through quantum computer...",
    "Consulting ancient mixtape prophecies...",
    "Analyzing butterfly effect of bass drops...",
    "Calculating optimal head-bobbing frequency...",
    "Simulating dance moves in 4D space...",
    "Downloading more RAM for better beats...",
    "Teaching AI to appreciate silence between notes...",
    "Consulting with time-traveling musicians...",
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isGenerating, loadingMessages.length]);

  const handleTrackSelect = (track: SpotifyTrack) => {
    setSelectedTracks((prev) => {
      const isSelected = prev.some((t) => t.id === track.id);
      if (isSelected) {
        return prev.filter((t) => t.id !== track.id);
      }
      return [...prev, track];
    });
  };

  const handleGenerate = async () => {
    if (selectedTracks.length === 0) return;
    setShowSuccess(false);

    try {
      const result = await generatePlaylist({
        seedTracks: selectedTracks,
        prompt,
        numberOfTracks: parseInt(numberOfTracks),
        skipSave: true,
      });
      
      // Add to history after successful generation
      addToHistory(selectedTracks, prompt, parseInt(numberOfTracks), result);
    } catch (err) {
      console.error("Generation error:", err);
    }
  };

  const handleSaveToSpotify = async () => {
    if (!generatedPlaylist) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/spotify/create-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generatedPlaylist.playlistName,
          tracks: generatedPlaylist.tracks.map(t => t.track),
          seedTracks: selectedTracks.map((t) => t.name),
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save playlist");
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to save playlist:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedTracks([]);
    setPrompt("");
    setNumberOfTracks("10");
    setShowSuccess(false);
    resetGeneration();
  };

  const handleRestoreFromHistory = (item: PlaylistHistoryItem) => {
    const restored = restoreFromHistory(item);
    setSelectedTracks(restored.seedTracks);
    setPrompt(restored.prompt);
    setNumberOfTracks(restored.numberOfTracks.toString());
    if (restored.generatedPlaylist) {
      resetGeneration();
      setTimeout(() => {
        setGeneratedPlaylist(() => {
          if (!restored.generatedPlaylist) return null;
          return {
            playlist: restored.generatedPlaylist.playlist,
            tracks: restored.generatedPlaylist.tracks,
            playlistName: restored.generatedPlaylist.playlistName,
          };
        });
      }, 0);
    }
    setShowHistory(false);
  };

  if (!isAuthenticated) {
  return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-violet-500/5 via-background to-fuchsia-500/5">
        <div className="text-center space-y-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <svg
              className="w-16 h-16 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              dJai
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Create AI-powered playlists that perfectly match your music taste
          </p>
          <Button
            variant="spotify"
            onClick={login}
            className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-[#1DB954] to-[#1ed760] hover:from-[#1ed760] hover:to-[#1DB954]"
          >
            Connect with Spotify
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-500/5 via-background to-fuchsia-500/5 relative">
      {/* Add History Button in Header */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          History
        </Button>
      </div>

      {/* History Panel */}
      {showHistory && (
        <PlaylistHistoryPanel
          history={history}
          onRestore={handleRestoreFromHistory}
          onRemove={removeFromHistory}
          onClear={clearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}

      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="max-w-md w-full mx-4 text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-fuchsia-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-violet-500 animate-pulse"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
            </div>
            <p className="text-lg font-medium bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Generating Your Playlist
            </p>
            <p className="text-sm text-muted-foreground animate-fade-in">
              {loadingMessages[loadingMessageIndex]}
            </p>
          </div>
        </div>
      )}

      <div className="container max-w-7xl mx-auto p-4 sm:p-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg
              className="w-12 h-12 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              dJai
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Give it a few songs, and it&apos;ll create a playlist of similar tracks. Add an optional prompt to guide the vibe.
          </p>
          <div className="w-full bg-violet-500/5 rounded-lg p-4 border border-violet-500/20">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col items-center text-center p-4">
                  <span className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-500 font-medium flex items-center justify-center mb-3">1</span>
                  <h3 className="font-medium mb-1">Select Tracks</h3>
                  <p className="text-xs text-muted-foreground">Choose up to 5 songs that represent your desired style</p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <span className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-500 font-medium flex items-center justify-center mb-3">2</span>
                  <h3 className="font-medium mb-1">Add Context</h3>
                  <p className="text-xs text-muted-foreground">Optionally describe the vibe you&apos;re looking for</p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <span className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-500 font-medium flex items-center justify-center mb-3">3</span>
                  <h3 className="font-medium mb-1">Generate</h3>
                  <p className="text-xs text-muted-foreground">Our AI creates a personalized playlist that matches your taste</p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <span className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-500 font-medium flex items-center justify-center mb-3">4</span>
                  <h3 className="font-medium mb-1">Save & Enjoy</h3>
                  <p className="text-xs text-muted-foreground">Review and save your curated playlist to Spotify</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-8 min-w-0">
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-500/10 text-violet-500 font-semibold">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Select Your Seed Tracks</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose 1-5 songs to inspire your playlist
                  </p>
                </div>
              </div>
              <Card className="card-hover-effect border-violet-500/20">
                <CardContent className="p-6">
                  <SearchInput
                    onTrackSelect={handleTrackSelect}
                    selectedTracks={selectedTracks}
                  />
                </CardContent>
              </Card>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-fuchsia-500/10 text-fuchsia-500 font-semibold">
                  2
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Configure Generation</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customize your playlist settings
                  </p>
                </div>
              </div>
              <Card className="card-hover-effect border-fuchsia-500/20">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Number of Tracks
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[10, 20, 30].map((num) => (
                          <button
                            key={num}
                            onClick={() => setNumberOfTracks(num.toString())}
                            className={`
                              h-12 rounded-lg border transition-all
                              ${numberOfTracks === num.toString()
                                ? 'border-violet-500 bg-violet-500/10 text-violet-500 font-medium'
                                : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                              }
                            `}
                          >
                            {num} tracks
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Choose how many songs you want in your generated playlist
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Optional Prompt
                      </label>
                      <Input
                        placeholder="e.g., 'upbeat workout mix' or 'chill evening vibes'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-12"
                      />
                      <div className="mt-4 space-y-4">
                        <p className="text-sm font-medium text-muted-foreground">Example prompts:</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-violet-500/5 rounded-lg p-3 border border-violet-500/20">
                            {/* <p className="text-sm font-medium mb-1">Road Trip Vibes</p> */}
                            <p className="text-xs text-muted-foreground">Perfect for a summer road trip with upbeat, singalong tracks</p>
                          </div>
                          <div className="bg-fuchsia-500/5 rounded-lg p-3 border border-fuchsia-500/20">
                            {/* <p className="text-sm font-medium mb-1">Coding Focus</p> */}
                            <p className="text-xs text-muted-foreground">Late night coding session with ambient, instrumental tracks</p>
                          </div>
                          <div className="bg-violet-500/5 rounded-lg p-3 border border-violet-500/20">
                            {/* <p className="text-sm font-medium mb-1">Workout Energy</p> */}
                            <p className="text-xs text-muted-foreground">High-energy gym workout with motivating beats</p>
                          </div>
                          <div className="bg-fuchsia-500/5 rounded-lg p-3 border border-fuchsia-500/20">
                            {/* <p className="text-sm font-medium mb-1">Sunday Morning</p> */}
                            <p className="text-xs text-muted-foreground">UK rap songs from 2019</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  
                    <div className="space-y-6">
                      {generatedPlaylist ? (
                        <Button
                          onClick={handleReset}
                          className="w-full h-12"
                          variant="outline"
                        >
                          Generate New Playlist
                        </Button>
                      ) : (
                        <Button
                          onClick={handleGenerate}
                          disabled={selectedTracks.length === 0 || isGenerating || selectedTracks.length > 5}
                          className="w-full h-12 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                        >
                          {isGenerating ? (
                            <span>Generating...</span>
                          ) : selectedTracks.length > 5 ? (
                            "Please select 5 or fewer tracks"
                          ) : selectedTracks.length === 0 ? (
                            "Select at least one track"
                          ) : (
                            "Generate Playlist"
                          )}
                        </Button>
                      )}
                    </div>
                  

                  {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg">
                      <p className="font-medium">Error</p>
                      <p>{error}</p>
                    </div>
                  )}

                  {showSuccess && (
                    <div className="bg-green-500/10 text-green-500 p-4 rounded-lg text-center playlist-success">
                      <p className="font-medium">
                        ✨ Playlist successfully added to your Spotify library!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="space-y-8 min-w-0">
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <span>Selected Tracks</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    ({selectedTracks.length}/5)
                  </span>
                </h2>
                {selectedTracks.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTracks([])}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {selectedTracks.length === 0 ? (
                  <Card className="card-hover-effect bg-muted/50 border-violet-500/20">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      <p>Search and select tracks to get started</p>
                      <p className="text-sm mt-2">Select up to 5 songs that will inspire your playlist</p>
                    </CardContent>
                  </Card>
                ) : (
                  selectedTracks.map((track) => (
                    <div
                      key={track.id}
                      className="transform transition-all duration-200 hover:scale-[1.02]"
                    >
                      <TrackCard
                        track={track}
                        selected
                        onRemove={() => handleTrackSelect(track)}
                      />
                    </div>
                  ))
                )}
              </div>
            </section>

            {generatedPlaylist && (
              <section className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-2xl font-semibold">Generated Playlist</h2>
                  <Button
                    onClick={handleSaveToSpotify}
                    disabled={isSaving}
                    size="sm"
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : showSuccess ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Saved
                      </span>
                    ) : (
                      "Save to Spotify"
                    )}
                  </Button>
                </div>
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/5">
                    <CardTitle>
                      <div className="flex flex-col gap-1">
                        <span className="text-xl break-words">{generatedPlaylist.playlistName}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                          <span>{generatedPlaylist.tracks.length} tracks</span>
                          <span>•</span>
                          <span>
                            {formatTotalDuration(
                              generatedPlaylist.tracks.reduce(
                                (total, { track }) => total + track.duration_ms,
                                0
                              )
                            )}
                          </span>
                        </div>
                      </div>
                      {showSuccess && (
                        <span className="text-sm text-green-500 flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Saved to Spotify
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 bg-accent/50 p-3 rounded-lg">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p>
                        Drag the handle on the left to reorder tracks, or click the X to remove them. Changes will be reflected when you save to Spotify.
                      </p>
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={({ active, over }) => {
                        if (over && active.id !== over.id) {
                          const oldIndex = generatedPlaylist.tracks.findIndex(
                            ({ track }) => track.id === active.id
                          );
                          const newIndex = generatedPlaylist.tracks.findIndex(
                            ({ track }) => track.id === over.id
                          );
                          reorderTracks(oldIndex, newIndex);
                        }
                      }}
                    >
                      <SortableContext
                        items={generatedPlaylist.tracks.map(({ track }) => track.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {generatedPlaylist.tracks.map(({ track, reason }) => (
                            <DraggableTrackCard
                              key={track.id}
                              id={track.id}
                              track={track}
                              reason={reason}
                              onRemove={() => removeTrackFromGenerated(track.id)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
