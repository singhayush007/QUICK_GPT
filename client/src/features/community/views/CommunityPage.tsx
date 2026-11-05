import { useState } from "react";
import { PageHeader } from "@/shared/components/ui";
import ImageGrid, { EmptyGallery, ImageGridSkeleton } from "../components/ImageGrid";
import ImageLightbox from "../components/ImageLightbox";
import { useCommunityImagesQuery } from "../hooks/UseCommunityImagesQuery";
import type { CommunityImage } from "../types/community.types";

/** Gallery of images users chose to share. */
export default function CommunityPage({ onMenu }: { onMenu: () => void }) {
  const { images, loading } = useCommunityImagesQuery();
  const [active, setActive] = useState<CommunityImage | null>(null);

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <PageHeader onMenu={onMenu} title="Community gallery" subtitle="Images shared by QuickGPT users" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {loading ? <ImageGridSkeleton /> : images.length === 0 ? <EmptyGallery /> : <ImageGrid images={images} onOpen={setActive} />}
      </div>
      {active && <ImageLightbox image={active} onClose={() => setActive(null)} />}
    </div>
  );
}
