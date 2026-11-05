import { Download, X } from "lucide-react";
import toast from "react-hot-toast";
import { useEscapeKey } from "@/shared/hooks/UseEscapeKey";
import { downloadFromUrl } from "@/shared/utils/download.utils";
import type { CommunityImage } from "../types/community.types";

interface ImageLightboxProps {
  image: CommunityImage;
  onClose: () => void;
}

export default function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  useEscapeKey(onClose);

  const download = async () => {
    try {
      await downloadFromUrl(image.imageUrl, "quickgpt-image.png");
    } catch {
      window.open(image.imageUrl, "_blank");
      toast("Opened the image in a new tab", { icon: "↗️" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="animate-pop relative max-h-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <img src={image.imageUrl} alt="" className="max-h-[80vh] rounded-2xl shadow-2xl" />
        <div className="mt-3 flex items-center justify-between text-sm text-white">
          <span>
            Created by <b>{image.userName}</b>
          </span>
          <button onClick={() => void download()} className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 hover:bg-white/25">
            <Download size={15} /> Download
          </button>
        </div>
        <button onClick={onClose} aria-label="Close" className="absolute -right-3 -top-3 grid size-8 cursor-pointer place-items-center rounded-full bg-white text-black shadow-lg">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
