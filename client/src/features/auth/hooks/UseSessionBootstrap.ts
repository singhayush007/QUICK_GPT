import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";

/**
 * Keeps the session in sync:
 *  - a stored token is verified (user fetched) on start and after login
 *  - the user's chats are loaded once per signed-in user id (NOT per user object, otherwise
 *    every credit update would re-fetch all chats and reset the selection)
 */
export function useSessionBootstrap(): void {
  const token = useAuthStore((s) => s.token);
  const userId = useAuthStore((s) => s.user?._id);
  const fetchUser = useAuthStore((s) => s.fetchUser);
  const loadChats = useChatStore((s) => s.loadChats);

  useEffect(() => {
    if (token) void fetchUser();
    else useAuthStore.setState({ user: null, loading: false });
  }, [token, fetchUser]);

  useEffect(() => {
    if (userId) void loadChats();
  }, [userId, loadChats]);
}
