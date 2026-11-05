import mongoose from "mongoose";

/** Name of the MongoDB database (kept explicit so existing Atlas data is found). */
export const DB_NAME = "QuickGPT";

/** Connects to MongoDB; exits the process on failure. */
export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database connected")
    );

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME, // Explicit DB name
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit process on DB failure
  }
};

export default connectDB;
