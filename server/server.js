// ENTRY ONLY: load env, connect the DB, build the app, listen (locally).
// `dotenv/config` must be imported before the app so env vars are available
// to every module that reads them at import time.
import "dotenv/config";
import connectDB from "./config/db.js";
import { createApp } from "./app.js";

await connectDB();

const app = createApp();

const PORT = process.env.PORT || 3000;

// Only listen when running locally (not on Vercel serverless)
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Vercel imports the app as the serverless handler
export default app;
