import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/"vibeRadiusDB"`
    );
    logger.info(
      `\n mongo db connected !! db host: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    logger.warn("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
