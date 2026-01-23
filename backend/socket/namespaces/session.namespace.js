import socketAuth from "../../middlewares/socketAuth.middleware.js";
import {
  handleDisconnect,
  handleJoinSession,
  handleLeaveSession,
} from "../handlers/session.handler.js";
import logger from "../../utils/logger.js";

const registerSessionNamespace = (io) => {
  const sessionNamespace = io.of("/session");

  sessionNamespace.use(socketAuth);

  sessionNamespace.on("connection", (socket) => {
    if (!socket?.user?._id) {
      logger.error(
        `Socket ${socket.id} connected without a valid user object. Discconeting.`
      );
      return socket.disconnect(true);
    }

    const userId = socket.user._id;
    logger.info(`User ${userId} authenticated and connected to /session`);

    socket.on("join_session", async (sessionCode, callback) => {
      await handleJoinSession(
        socket,
        sessionNamespace,
        userId,
        sessionCode,
        callback
      );
    });

    socket.on("leave_session", async (sessionCode, callback) => {
      await handleLeaveSession(
        socket,
        sessionNamespace,
        userId,
        sessionCode,
        callback
      );
    });

    socket.on("disconnect", async () => {
      if (socket.currentSessionId) {
        await handleDisconnect(
          sessionNamespace,
          userId,
          socket.currentSessionId
        );
      }
    });
  });
};

export { registerSessionNamespace };
