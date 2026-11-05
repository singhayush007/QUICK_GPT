import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MIN_PASSWORD_LENGTH, SIGNUP_CREDITS } from "../../shared/constants/limits.js";

const BCRYPT_SALT_ROUNDS = 10;
const MAX_NAME_LENGTH = 60;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: MAX_NAME_LENGTH },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: MIN_PASSWORD_LENGTH },
    credits: { type: Number, default: SIGNUP_CREDITS },
    // "pro" unlocks the Pro models; set automatically after any paid purchase
    plan: { type: String, enum: ["free", "pro"], default: "free" },
  },
  {
    timestamps: true,
    // Never leak the password hash in API responses
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

/** Mongoose model `User` (collection name must not change). */
export const User = mongoose.model("User", userSchema);

export default User;
