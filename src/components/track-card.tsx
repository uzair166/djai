import { SpotifyTrack } from "@/types/spotify";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { formatDuration } from "@/lib/utils";

interface TrackCardProps {
  track: SpotifyTrack;
  selected?: boolean;
  reason?: string;
  onClick?: () => void;
  onRemove?: () => void;
  dragHandle?: React.ReactNode;
  isDragging?: boolean;
  variant?: "default" | "compact";
  className?: string;
}

export function TrackCard({
  track,
  selected,
  reason,
  onClick,
  onRemove,
  dragHandle,
  isDragging,
  variant = "default",
  className,
}: TrackCardProps) {
  const isCompact = variant === "compact";

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 group/card border-0",
        "bg-gradient-to-r from-background via-accent/5 to-background hover:via-accent/10",
        selected && "bg-primary/5 hover:bg-primary/10",
        onClick && !selected && "cursor-pointer hover:-translate-y-[1px]",
        isDragging && "brightness-95 scale-[1.02] shadow-lg",
        "backdrop-blur-sm",
        isCompact && "p-2",
        className
      )}
      onClick={onClick && !selected ? onClick : undefined}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-3 p-2.5">
          {/* Drag Handle */}
          {dragHandle}

          {/* Album Art with Hover Effect */}
          <motion.div 
            className={cn(
              "relative h-11 w-11 flex-shrink-0 rounded-md overflow-hidden",
              isCompact && "h-8 w-8"
            )}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10" />
            <Image
              src={track.album.images[0]?.url || "/placeholder.png"}
              alt={track.name}
              className="object-cover transition-all duration-300 group-hover/card:saturate-[1.1]"
              fill
              sizes="44px"
            />
            {/* Play Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/card:opacity-100 transition-all duration-300 z-20">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </motion.div>

          {/* Track Info */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={cn(
                    "font-medium truncate",
                    isCompact && "text-sm"
                  )}>
                    {track.name}
                  </p>
                  {track.explicit && (
                    <span className="px-1 rounded text-[10px] bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">
                      E
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    "text-muted-foreground truncate",
                    isCompact && "text-xs"
                  )}>
                    {track.artists.map((a) => a.name).join(", ")}
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className={cn(
                    "text-muted-foreground/60 tabular-nums",
                    isCompact && "hidden"
                  )}>
                    {formatDuration(track.duration_ms)}
                  </span>
                </div>
              </div>
              
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {selected && onRemove && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className={cn(
                  "h-7 w-7 rounded-full opacity-0 group-hover/card:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive",
                  isCompact && "scale-75"
                )}
              >
                <motion.svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="M12 12L6 6M12 12L18 18M12 12L18 6M12 12L6 18" />
                </motion.svg>
                <span className="sr-only">Remove track</span>
              </Button>
            )}
            <a
              href={track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "p-1.5 rounded-full opacity-60 hover:opacity-100 transition-all hover:bg-[#1DB954]/10 hover:text-[#1DB954] active:scale-95",
                isCompact && "hidden"
              )}
            >
              <motion.svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  fill="currentColor"
                  d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
                />
              </motion.svg>
            </a>
          </div>
        </div>

        {reason && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 min-w-0 max-w-full"
              >
                <div className="flex items-center gap-1.5 min-w-0 ml-12 mb-2">
                  <svg
                    className="w-3.5 h-3.5 text-violet-500/70 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <span className={cn(
                    "text-xs text-muted-foreground/90 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 px-2 py-0.5 rounded-full border border-violet-500/10",
                    "transition-colors group-hover/card:from-violet-500/10 group-hover/card:to-fuchsia-500/10",
                    "truncate",
                    isCompact && "text-[11px] px-1.5"
                  )}>
                    {reason}
                  </span>
                </div>
              </motion.div>
            )}
      </CardContent>
    </Card>
  );
} 