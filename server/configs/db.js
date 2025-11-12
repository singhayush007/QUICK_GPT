// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     mongoose.connection.on("connected", () =>
//       console.log("Database connected")
//     );
//     await mongoose.connect(`${process.env.MONGODB_URI}/QuickGPT`);
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// export default connectDB;

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database connected")
    );

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "QuickGPT", // Explicit DB name
    });
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit process on DB failure
  }
};

export default connectDB;
