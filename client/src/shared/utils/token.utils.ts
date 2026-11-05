import { STORAGE_KEYS } from "@/shared/constants/storage.constants";
import { storage } from "./storage.utils";

/** The session token lives in localStorage as a raw string (read by the axios interceptor). */
export const tokenStorage = {
  get: (): string | null => storage.get(STORAGE_KEYS.token),
  set: (token: string): void => storage.set(STORAGE_KEYS.token, token),
  clear: (): void => storage.remove(STORAGE_KEYS.token),
};
