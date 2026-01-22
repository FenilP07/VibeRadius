import Session from "../models/session.model.js";
import logger from "../utils/logger.js";

const registerSessionNamespace = (io) => {
  const sessionNamespace = io.of("/session");

  // Assuming socketAuth is already applied here...
  sessionNamespace.on("connection", (socket) => {
    const userId = socket.user._id;

    // Helper function to handle the database and notification logic
    const handleLeave = async (roomId, sessionCode) => {
      try {
        // Find by code or ID, and pull the user from participants
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

          // Notify the room that a user left
          sessionNamespace.to(actualRoomId).emit("user_left", {
            userId,
            participantCount: session.participants.length,
            currentParticipants: session.participants,
          });

          logger.info(`User ${userId} left session ${session.session_code}`);
          return actualRoomId;
        }
      } catch (err) {
        logger.error(`Error during leave logic: ${err.message}`);
      }
      return null;
    };

    // --- 1. Manual Leave Event ---
    socket.on("leave_session", async (sessionCode, callback) => {
      const roomId = await handleLeave(null, sessionCode);
      if (roomId) {
        socket.leave(roomId);
        if (callback) callback({ success: true });
      } else {
        if (callback)
          callback({ success: false, message: "Session not found" });
      }
    });

    // --- 2. Automated Join Logic (already exists, but ensures room tracking) ---
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

        // Store session info on the socket object to use during disconnect
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

    // --- 3. Passive Disconnect Logic ---
    // This catches users who close the tab or lose internet
    socket.on("disconnect", async () => {
      if (socket.currentSessionId) {
        logger.info(
          `Socket ${socket.id} disconnected passively. Cleaning up...`
        );
        await handleLeave(socket.currentSessionId, null);
      }
    });
  });
};

export default registerSessionNamespace;
