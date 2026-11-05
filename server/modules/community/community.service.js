import Chat from "../chat/Chat.js";
import { PUBLISHED_IMAGES_LIMIT } from "../../shared/constants/limits.js";

/**
 * Image messages users chose to share with the community (newest first).
 * Only the image URL and the creator's display name leave the server.
 */
export const listPublishedImages = () =>
  Chat.aggregate([
    { $unwind: "$messages" },
    {
      $match: {
        "messages.isImage": true,
        "messages.isPublished": true,
      },
    },
    {
      $project: {
        _id: 0,
        imageUrl: "$messages.content",
        userName: "$userName",
        createdAt: "$messages.timestamp",
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: PUBLISHED_IMAGES_LIMIT },
  ]);
