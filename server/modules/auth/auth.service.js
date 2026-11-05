import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "./User.js";
import { AppError } from "../../shared/utils/httpErrors.js";
import { JWT_EXPIRES_IN, MIN_PASSWORD_LENGTH } from "../../shared/constants/limits.js";

const MSG_REQUIRED = "Name, email and password are required";

/** Signs a session token for a user id. */
export const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const normaliseEmail = (email) => String(email || "").toLowerCase().trim();

/**
 * Creates an account and returns its JWT.
 * @param {{name: unknown, email: unknown, password: unknown}} input raw request values
 * @returns {Promise<string>} token
 * @throws {AppError} on invalid input or when the email is already registered
 */
export async function registerUser({ name, email, password }) {
  if ([name, email, password].some((v) => typeof v !== "string")) {
    throw new AppError(MSG_REQUIRED);
  }
  if (!name.trim() || !email.trim() || !password) {
    throw new AppError(MSG_REQUIRED);
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  const userExists = await User.findOne({ email: email.toLowerCase().trim() });
  if (userExists) throw new AppError("User already exists");

  const user = await User.create({ name, email, password });
  return generateToken(user._id);
}

/**
 * Checks credentials (email is case-insensitive) and returns a JWT.
 * @throws {AppError} "Invalid email or password"
 */
export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: normaliseEmail(email) });
  if (user && typeof password === "string" && password) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return generateToken(user._id);
  }
  throw new AppError("Invalid email or password");
}
