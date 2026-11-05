import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "@/store/chatStore";

/** Opens the chat screen on an empty chat (re-uses an existing empty one). */
export function useNewChat() {
  const navigate = useNavigate();
  const createOrReuseEmptyChat = useChatStore((s) => s.createOrReuseEmptyChat);
  return useCallback(async () => {
    navigate("/");
    return createOrReuseEmptyChat();
  }, [navigate, createOrReuseEmptyChat]);
}
