import dotenv from "dotenv";
import connectDB from "./configs/db.config.js";
import logger from "./utils/logger.js";
import { app } from "./app.js";

dotenv.config({});

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.warn("Failed to start server:", error);
  });
