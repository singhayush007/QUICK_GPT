import { isAxiosError } from "axios";
import type { ApiErrorBody } from "@/shared/types";

/** Best human readable message out of an axios / fetch / generic error. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** True when the request was cancelled on purpose (Stop button, route change). */
export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError") ||
    (isAxiosError(error) && error.code === "ERR_CANCELED")
  );
}
