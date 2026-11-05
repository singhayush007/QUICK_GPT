import * as communityService from "./community.service.js";

/** GET /api/user/published-images — public gallery of shared images. */
export const getPublishedImages = async (req, res) => {
  try {
    const images = await communityService.listPublishedImages();
    res.json({ success: true, images });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
