/** Every JSON endpoint answers with `success` (+ `message` on failure). */
export type ApiResponse<T = object> = ({ success: true } & T) | { success: false; message: string; code?: string };

/** Shape of the error payload attached to a failed axios request. */
export interface ApiErrorBody {
  success?: false;
  message?: string;
  code?: string;
}
