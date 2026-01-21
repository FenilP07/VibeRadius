import http from "http";
import connectDB from "./configs/db.config.js";
import logger from "./utils/logger.js";
import { app } from "./app.js";
import { Server } from "socket.io";
import registerSockets from "./configs/socket.config.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_URL,
    ],
    credentials: true,
  },
});

app.set("io", io);

logger.info("io created", !!io)
registerSockets(io);

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.warn("Failed to start server:", error);
  });
