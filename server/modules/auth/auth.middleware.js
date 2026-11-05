import jwt from "jsonwebtoken";
import User from "./User.js";

/**
 * Verifies the JWT and attaches the user (without password hash) to req.user.
 * Accepts both `Authorization: <token>` (existing client) and `Bearer <token>`.
 */
export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : header;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};
