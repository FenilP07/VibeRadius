// sockets/session.namespace.js
import socketAuth from "../middlewares/socketAuth.middleware.js";
import logger from "../utils/logger.js";

const registerSessionNamespace = (io) => {
  console.log("session namespace io:", !!io);
  const sessionNamespace = io.of("/session");

  // Namespace-level middleware
  sessionNamespace.use(socketAuth);

  sessionNamespace.on("connection", (socket) => {
    logger.info("Session socket connected", {
      socketId: socket.id,
      userId: socket.user?._id,
    });

    // Example events
    socket.on("join_session", (sessionId) => {
      socket.join(sessionId);
      logger.info(`Socket joined session ${sessionId}`);
    });

    socket.on("disconnect", () => {
      logger.info("Session socket disconnected", {
        socketId: socket.id,
      });
    });
  });
};

export default registerSessionNamespace;
