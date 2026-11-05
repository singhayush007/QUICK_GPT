import ImageKit from "imagekit";
import { envSet } from "../shared/utils/env.js";

let client = null;

/** True when all ImageKit env vars hold real values (not `.env.example` placeholders). */
export const isImageKitConfigured = () =>
  envSet("IMAGEKIT_PUBLIC_KEY") &&
  envSet("IMAGEKIT_PRIVATE_KEY") &&
  envSet("IMAGEKIT_URL_ENDPOINT") &&
  /^https?:\/\//.test(process.env.IMAGEKIT_URL_ENDPOINT);

/** Lazily create the ImageKit client so the server can boot without image keys. */
export const getImageKit = () => {
  if (!isImageKitConfigured()) {
    throw new Error(
      "Image generation is not configured. Set the IMAGEKIT_* variables in server/.env"
    );
  }
  if (!client) {
    client = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return client;
};

export default getImageKit;
