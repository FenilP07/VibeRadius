// sockets/session.namespace.js
import socketAuth from "../middlewares/socketAuth.middleware.js";
import logger from "../utils/logger.js";
import Session from "../models/session.model.js";

const registerSessionNamespace = (io) => {
  console.log("session namespace io:", !!io);
  const sessionNamespace = io.of("/session");

  sessionNamespace.use(socketAuth);

  sessionNamespace.on("connection", (socket) => {
    logger.info("Session socket connected", {
      socketId: socket.id,
      userId: socket.user?._id,
    });

   
    socket.on("join_session", async (sessionCode, callback) => {
      try {
        const session = await Session.findOne({
          session_code: sessionCode,
        });
        if (!session) {
          return callback({ success: false, message: "Session not found" });
        }

        const userId = socket.user._id;
        if (!session.participants.includes(userId)) {
          session.participants.push(userId);
          await session.save();
        }

        socket.join(session._id.toString());

        sessionNamespace.to(session._id.toString()).emit("session_update", {
          sessionId: session._id,
          sessionName: session.session_name,
          participants: session.participants,
        });

        callback({
          success: true,
          session: {
            _id: session._id,
            session_name: session.session_name,
            session_code: session.session_code,
            participants: session.participants,
          },
        });

        logger.info(`User ${userId} joined session ${sessionCode}`, {
          socketId: socket.id,
        });
      } catch (err) {
        logger.error("Error joining session", { error: err.message });
        callback({ success: false, message: "Failed to join session" });
      }
    });

    socket.on("disconnect", () => {
      logger.info("Session socket disconnected", {
        socketId: socket.id,
      });
    });
  });
};

export default registerSessionNamespace;
