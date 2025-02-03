import { PlaylistHistoryItem } from "@/types/spotify";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { TrackCard } from "./track-card";
import { cn } from "@/lib/utils";

interface PlaylistHistoryPanelProps {
  history: PlaylistHistoryItem[];
  onRestore: (item: PlaylistHistoryItem) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
  className?: string;
}

export function PlaylistHistoryPanel({
  history,
  onRestore,
  onRemove,
  onClear,
  onClose,
  className,
}: PlaylistHistoryPanelProps) {
  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 bg-white/80  backdrop-blur border-l border-border shadow-xl z-50 flex flex-col",
        "w-full sm:w-[28rem] max-w-full", // Mobile responsive width
        className
      )}
    >
      <div className="p-4 border-b border-border flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-semibold">Playlist History</h2>
          <p className="text-sm text-muted-foreground">Your last {history.length} generations</p>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground hidden sm:flex"
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {history.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              <p>No playlist history yet</p>
              <p className="text-sm mt-1">
                Generate some playlists and they&apos;ll appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="relative bg-accent/40 hover:bg-accent/60 rounded-lg p-4 group transition-colors"
                >
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(item.id)}
                      className="h-8 w-8 p-0"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {item.generatedPlaylist?.playlistName || "Unnamed Playlist"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      {item.prompt && (
                        <p className="text-xs text-muted-foreground italic">
                          &quot;{item.prompt}&quot;
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Seed Tracks:
                      </p>
                      {item.seedTracks.map((track) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          variant="compact"
                          className="bg-background/50"
                        />
                      ))}
                    </div>

                    <Button
                      onClick={() => onRestore(item)}
                      className="w-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 hover:from-violet-500/20 hover:to-fuchsia-500/20 text-foreground"
                    >
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
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        View Playlist
                      </span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Mobile Clear All Button */}
      {history.length > 0 && (
        <div className="p-4 border-t border-border sm:hidden">
          <Button
            variant="ghost"
            onClick={onClear}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}