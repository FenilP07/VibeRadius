import Session from "../models/session.model.js";
import logger from "../utils/logger.js";
import socketAuth from "../middlewares/socketAuth.middleware.js"; // Ensure this is imported

const registerSessionNamespace = (io) => {
  const sessionNamespace = io.of("/session");
  sessionNamespace.use(socketAuth);

  sessionNamespace.on("connection", (socket) => {
    if (!socket?.user?._id) {
      logger.error(
        `Socket ${socket.id} connected without a valid user object. Disconnecting.`
      );
      return socket.disconnect(true);
    }
    const userId = socket.user._id;
    logger.info(`✅ User ${userId} authenticated and connected to /session`);
    const handleLeave = async (roomId, sessionCode) => {
      try {
        const query = sessionCode
          ? { session_code: sessionCode }
          : { _id: roomId };
        const session = await Session.findOneAndUpdate(
          query,
          { $pull: { participants: userId } },
          { new: true }
        );

        if (session) {
          const actualRoomId = session._id.toString();
          sessionNamespace.to(actualRoomId).emit("user_left", {
            userId,
            participantCount: session.participants.length,
          });
          return actualRoomId;
        }
      } catch (err) {
        logger.error(`Error during leave logic: ${err.message}`);
      }
      return null;
    };

    socket.on("join_session", async (sessionCode, callback) => {
      try {
        const session = await Session.findOneAndUpdate(
          { session_code: sessionCode },
          { $addToSet: { participants: userId } },
          { new: true }
        );

        if (!session) return callback({ success: false, message: "Not found" });

        const roomId = session._id.toString();
        socket.join(roomId);
        socket.currentSessionId = roomId;

        sessionNamespace.to(roomId).emit("user_joined", {
          userId,
          participantCount: session.participants.length,
        });

        callback({ success: true, session });
      } catch (err) {
        callback({ success: false, message: "Error joining" });
      }
    });

    socket.on("leave_session", async (sessionCode, callback) => {
      const roomId = await handleLeave(null, sessionCode);
      if (roomId) {
        socket.leave(roomId);
        socket.currentSessionId = null;
        if (callback) callback({ success: true });
      }
    });

    socket.on("disconnect", async () => {
      if (socket.currentSessionId) {
        await handleLeave(socket.currentSessionId, null);
      }
    });
  });
};

export default registerSessionNamespace;
