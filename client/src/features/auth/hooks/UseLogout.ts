import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

/** Clears the session (token, user, chats) and returns to the root route. */
export function useLogout(): () => void {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  return useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);
}
