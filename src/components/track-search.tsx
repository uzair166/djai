import { useState } from "react";
import { Input } from "@/components/ui/input";
import { TrackCard } from "@/components/track-card";
import { Track } from "@/types";

export interface TrackSearchProps {
  onSelect: (track: Track) => void;
}

export function TrackSearch({ onSelect }: TrackSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchTracks = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.tracks || []);
    } catch (error) {
      console.error("Failed to search tracks:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchTracks(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="Search for songs..."
        value={query}
        onChange={handleSearch}
      />
      
      {isLoading && (
        <div className="text-center text-muted-foreground">
          Searching...
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              onClick={() => onSelect(track)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 