import { SpotifyTrack } from "@/types/spotify";
import { TrackCard } from "./track-card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface DraggableTrackCardProps {
  track: SpotifyTrack;
  reason?: string;
  onRemove?: () => void;
  id: string;
}

export function DraggableTrackCard({
  track,
  reason,
  onRemove,
  id,
}: DraggableTrackCardProps) {
  const [isRemoving, setIsRemoving] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove?.();
    }, 300);
  };

  const dragHandle = (
    <div
      className="cursor-move flex items-center justify-center opacity-60 hover:opacity-100 transition-all
        hover:scale-110 active:scale-95"
      {...attributes}
      {...listeners}
    >
      <div className="p-1.5 rounded-md hover:bg-accent/60">
        <svg
          className="w-4 h-4 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="6" r="1" fill="currentColor" />
          <circle cx="9" cy="12" r="1" fill="currentColor" />
          <circle cx="9" cy="18" r="1" fill="currentColor" />
          <circle cx="15" cy="6" r="1" fill="currentColor" />
          <circle cx="15" cy="12" r="1" fill="currentColor" />
          <circle cx="15" cy="18" r="1" fill="currentColor" />
        </svg>
      </div>
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "relative mb-2 last:mb-0 transition-opacity",
        isRemoving && "opacity-0 -translate-y-4",
        isDragging && "z-50"
      )}
    >
      <TrackCard 
        track={track} 
        reason={reason} 
        onRemove={handleRemove} 
        selected
        dragHandle={dragHandle}
        isDragging={isDragging}
      />
    </div>
  );
} 