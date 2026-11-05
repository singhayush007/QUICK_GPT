import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/shared/utils/error.utils";
import { useChatStore } from "@/store/chatStore";
import { shareService } from "../services/share.service";

/** Create / refresh / revoke a chat's public link, and import someone's shared chat. */
export function useShareActions() {
  const navigate = useNavigate();
  const setShareId = useChatStore((s) => s.setShareId);
  const addChat = useChatStore((s) => s.addChat);

  /** Returns the shareId, or undefined on failure. */
  const share = useCallback(
    async (chatId: string): Promise<string | undefined> => {
      try {
        const data = await shareService.create(chatId);
        if (!data.success) return void toast.error(data.message);
        setShareId(chatId, data.shareId);
        return data.shareId;
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    [setShareId],
  );

  const unshare = useCallback(
    async (chatId: string): Promise<boolean> => {
      try {
        const data = await shareService.remove(chatId);
        if (!data.success) {
          toast.error(data.message);
          return false;
        }
        setShareId(chatId, undefined);
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error));
        return false;
      }
    },
    [setShareId],
  );

  /** Copy a shared chat into my own chats and open it. */
  const importChat = useCallback(
    async (shareId: string) => {
      try {
        const data = await shareService.importChat(shareId);
        if (!data.success) return void toast.error(data.message);
        addChat(data.chat);
        navigate("/");
        toast.success("Chat added to your history");
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    },
    [addChat, navigate],
  );

  return { share, unshare, importChat };
}
