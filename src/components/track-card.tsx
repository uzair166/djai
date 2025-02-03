import { SpotifyTrack } from "@/types/spotify";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";

interface TrackCardProps {
  track: SpotifyTrack;
  selected?: boolean;
  reason?: string;
  onClick?: () => void;
  onRemove?: () => void;
}

export function TrackCard({
  track,
  selected,
  reason,
  onClick,
  onRemove,
}: TrackCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:bg-accent/50",
        selected && "ring-2 ring-primary bg-primary/5",
        onClick && "cursor-pointer"
      )}
      onClick={onClick && !selected ? onClick : undefined}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-4">
          <div className="relative h-12 w-12 flex-shrink-0 group">
            <Image
              src={track.album.images[0]?.url || "/placeholder.png"}
              alt={track.name}
              className="object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
              fill
              sizes="48px"
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="font-medium truncate hover:text-primary transition-colors">
              {track.name}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {track.artists.map((a) => a.name).join(", ")}
            </p>
            {reason && (
              <p className="text-xs text-muted-foreground mt-2 italic bg-muted/50 px-2 py-1 rounded-md inline-block">
                {reason}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selected && onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
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
                <span className="sr-only">Remove track</span>
              </Button>
            )}
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-full hover:bg-accent transition-colors"
            >
              <svg
                className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 