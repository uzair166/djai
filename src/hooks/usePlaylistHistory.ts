import { useLocalStorage } from "./useLocalStorage";
import { PlaylistHistoryItem, SpotifyTrack, GenerationResult } from "@/types/spotify";

const MAX_HISTORY_ITEMS = 10;

export function usePlaylistHistory() {
  const [history, setHistory] = useLocalStorage<PlaylistHistoryItem[]>("playlistHistory", []);

  const addToHistory = (
    seedTracks: SpotifyTrack[],
    prompt: string,
    numberOfTracks: number,
    generatedPlaylist: GenerationResult | null
  ) => {
    setHistory((prev) => {
      const newItem: PlaylistHistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        seedTracks,
        prompt,
        numberOfTracks,
        generatedPlaylist,
      };

      // Add new item at the beginning and limit to MAX_HISTORY_ITEMS
      const updatedHistory = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      return updatedHistory;
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const restoreFromHistory = (item: PlaylistHistoryItem) => {
    return {
      seedTracks: item.seedTracks,
      prompt: item.prompt,
      numberOfTracks: item.numberOfTracks,
      generatedPlaylist: item.generatedPlaylist,
    };
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    restoreFromHistory,
  };
} 