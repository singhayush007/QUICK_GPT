/**
 * Error raised by services for expected, client-facing failures.
 * Services never touch `res`: they throw an AppError and the controller
 * decides how it is shaped (some legacy endpoints answer 200 + `success:false`).
 */
export class AppError extends Error {
  /**
   * @param {string} message text shown to the client
   * @param {number} [status=400] HTTP status the controller should use
   * @param {string} [code] optional machine-readable code (e.g. UPGRADE_REQUIRED)
   */
  constructor(message, status = 400, code) {
    super(message);
    this.name = "AppError";
    this.status = status;
    if (code) this.code = code;
  }
}

export const badRequest = (message) => new AppError(message, 400);
export const forbidden = (message, code) => new AppError(message, 403, code);
export const notFound = (message) => new AppError(message, 404);
export const serviceUnavailable = (message) => new AppError(message, 503);

/** Standard `{ success: false, [code], message }` body for an AppError. */
export const errorBody = (error) => ({
  success: false,
  ...(error.code ? { code: error.code } : {}),
  message: error.message,
});
