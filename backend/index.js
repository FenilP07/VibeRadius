import http from "http";
import connectDB from "./configs/db.config.js";
import logger from "./utils/logger.js";
import { app } from "./app.js";
import { Server } from "socket.io";
import socketAuth from "../backend/middlewares/socketAuth.middleware.js"

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// io.on("connection", (socket) => {
//   logger.info(`Socket connected: ${socket.id}`);
// });
app.set("io", io);

//session

const sessionNamespace = io.of("/session");

sessionNamespace.use(socketAuth)

sessionNamespace.on("connection", (socket) => {
  socket.on("disconnect", () => {});
});

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.warn("Failed to start server:", error);
  });
