import type { ApiResponse } from "@/shared/types";

export interface CommunityImage {
  imageUrl: string;
  userName: string;
  createdAt?: number;
}
export type CommunityImagesResponse = ApiResponse<{ images: CommunityImage[] }>;
