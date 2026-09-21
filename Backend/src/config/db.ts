import mongoose from "mongoose";
import { logError } from "../middleware/errorHandler";

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI as string
    );

    console.info("[MongoDB] connected");
  } catch (error) {
    logError("MongoDB connection failed", error);
    process.exit(1);
  }
};
