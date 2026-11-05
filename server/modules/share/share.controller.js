import * as shareService from "./share.service.js";

/** POST /api/share/create  { chatId } */
export const createShare = async (req, res) => {
  try {
    const shareId = await shareService.createShare(req.user, req.body.chatId);
    res.json({ success: true, shareId });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/** POST /api/share/remove  { chatId } — revokes the public link immediately. */
export const removeShare = async (req, res) => {
  try {
    const { chatId } = req.body;
    await shareService.removeShare(req.user._id, chatId);
    res.json({ success: true, message: "Sharing stopped" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/** GET /api/share/:shareId — PUBLIC, no auth. */
export const getSharedChat = async (req, res) => {
  try {
    const { shareId } = req.params;
    const chat = await shareService.getPublicShare(shareId);

    // unlisted content: never cache it and keep it out of search engines
    res.set({
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    });

    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "This link doesn't exist or was removed" });
    }

    res.json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/** POST /api/share/import { shareId } — copy a shared chat into my own chats. */
export const importSharedChat = async (req, res) => {
  try {
    const { shareId } = req.body;
    const chat = await shareService.importSharedChat(req.user, shareId);
    res.json({ success: true, chat });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
