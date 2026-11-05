import { api } from "@/shared/api/api";
import { API_PATHS } from "@/shared/constants/apiPaths.constants";
import type { CommunityImagesResponse } from "../types/community.types";

export const communityService = {
  /** Public: images that users chose to share. */
  images: () => api.get<CommunityImagesResponse>(API_PATHS.user.publishedImages),
};
