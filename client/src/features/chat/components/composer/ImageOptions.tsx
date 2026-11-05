import { RectangleHorizontal, RectangleVertical, Square, Trophy, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { IMAGE_SIZES } from "../../constants/chat.constants";
import type { ImageSize } from "../../types/chat.types";

const SIZE_ICONS: Record<ImageSize, LucideIcon> = { square: Square, landscape: RectangleHorizontal, portrait: RectangleVertical };

interface ImageOptionsProps {
  size: ImageSize;
  onSizeChange: (size: ImageSize) => void;
  publish: boolean;
  onPublishChange: (publish: boolean) => void;
}

/** Shape picker + "share to community" checkbox, shown in image mode. */
export default function ImageOptions({ size, onSizeChange, publish, onPublishChange }: ImageOptionsProps) {
  return (
    <>
      <div className="flex rounded-full bg-surface-2 p-0.5" role="group" aria-label="Image shape">
        {IMAGE_SIZES.map((o) => {
          const Icon = SIZE_ICONS[o.id];
          return (
            <button
              key={o.id}
              onClick={() => onSizeChange(o.id)}
              aria-label={o.label}
              title={o.label}
              aria-pressed={size === o.id}
              className={cn(
                "grid size-7 cursor-pointer place-items-center rounded-full transition",
                size === o.id ? "bg-surface text-brand shadow" : "text-muted hover:text-fg",
              )}
            >
              <Icon size={14} />
            </button>
          );
        })}
      </div>
      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted max-sm:hidden">
        <input type="checkbox" checked={publish} onChange={(e) => onPublishChange(e.target.checked)} className="accent-brand" />
        <Trophy size={12} /> Share to community
      </label>
    </>
  );
}
