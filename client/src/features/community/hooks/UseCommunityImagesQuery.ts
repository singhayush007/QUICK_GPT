import { useQuery } from "@tanstack/react-query";
import { communityService } from "../services/community.service";

export function useCommunityImagesQuery() {
  const query = useQuery({ queryKey: ["community-images"], queryFn: communityService.images });
  return { images: query.data?.success ? query.data.images : [], loading: query.isPending };
}
