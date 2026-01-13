import connectDB from "./configs/db.config.js";
import logger from "./utils/logger.js";
import { app } from "./app.js";

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
