import { ImageOff } from "lucide-react";
import { Skeleton } from "@/shared/components/ui";
import type { CommunityImage } from "../types/community.types";

const SKELETON_HEIGHTS = [220, 300, 260, 340, 240, 280, 320, 230];
const COLUMNS = "columns-2 gap-4 md:columns-3 xl:columns-4";

export function ImageGridSkeleton() {
  return (
    <div className={COLUMNS}>
      {SKELETON_HEIGHTS.map((h, i) => (
        <Skeleton key={i} style={{ height: h }} className="mb-4 break-inside-avoid" />
      ))}
    </div>
  );
}

export function EmptyGallery() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div>
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-surface-2 text-muted">
          <ImageOff size={28} />
        </span>
        <p className="mt-4 font-medium">No images shared yet</p>
        <p className="mt-1 text-sm text-muted">Generate an image and tick “Share to community” to be the first.</p>
      </div>
    </div>
  );
}

/** Masonry grid of shared images. */
export default function ImageGrid({ images, onOpen }: { images: CommunityImage[]; onOpen: (image: CommunityImage) => void }) {
  return (
    <div className={COLUMNS}>
      {images.map((item, i) => (
        <button
          key={`${item.imageUrl}-${i}`}
          onClick={() => onOpen(item)}
          className="group relative mb-4 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-sm transition hover:shadow-xl hover:shadow-brand/10"
        >
          <img src={item.imageUrl} alt={`Created by ${item.userName}`} loading="lazy" className="w-full transition duration-500 group-hover:scale-105" />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-left text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
            by {item.userName}
          </span>
        </button>
      ))}
    </div>
  );
}
