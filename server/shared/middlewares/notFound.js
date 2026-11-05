/** 404 for any route no module handled. */
export const notFound = (req, res) =>
  res.status(404).json({ success: false, message: "Route not found" });
