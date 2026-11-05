/**
 * Central error handler (malformed JSON, oversized body, anything unexpected).
 * Never leaks parser / internal details to clients.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON in request body" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request body is too large" });
  }
  console.error(err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status >= 500 ? "Something went wrong on the server" : err.message,
  });
};
