import sessionService from "../services/session.service.js";
import logger from "../../utils/logger.js";

export const handleJoinSession = async (
  socket,
  sessionNamespace,
  userId,
  sessionCode,
  callback
) => {
  try {
    const session = await sessionService.addUserToSession(sessionCode, userId);

    if (!session) {
      return callback({
        success: false,
        message: "Session not found",
      });
    }

    const roomId = sessionService.getRoomId(session);
    const participantCount = sessionService.getParticipantCount(session);

    socket.join(roomId);
    socket.currentSessionId = roomId;

    sessionNamespace.to(roomId).emit("user_joined", {
      userId,
      participantCount,
    });

    callback({
      success: true,
      session,
    });
  } catch (err) {
    logger.error(`Error in handleJoinSession: ${err.message}`);
    callback({
      success: false,
      message: "Error joining session",
      error: err.message,
    });
  }
};

export const handleLeaveSession = async (
  socket,
  sessionNamespace,
  userId,
  sessionCode,
  callback
) => {
  try {
    const session = await sessionService.removeUserFromSession(
      { session_code: sessionCode },
      userId
    );
    if (!session) {
      if (callback) callback({ success: false, message: "Session not found" });
      return;
    }

    const roomId = sessionService.getRoomId(session);
    const participantCount = sessionService.getParticipantCount(session);

    socket.leave(roomId);
    socket.currentSessionId = null;

    sessionNamespace.to(roomId).emit("user_left", {
      userId,
      participantCount,
    });

    if (callback) callback({ success: true });
  } catch (err) {
    logger.error(`Error in handleLeaveSession: ${err.message}`);
    if (callback)
      callback({
        success: false,
        message: "Error leaving session",
        error: err.message,
      });
  }
};

export const handleDisconnect = async (sessionNamespace, userId, sessionId) => {
  try {
    const session = await sessionService.removeUserFromSession(
      { _id: sessionId },
      userId
    );

    if (!session) {
      logger.warn(
        `Session ${sessionId} not found during disconnect for user ${userId}`
      );
      return;
    }

    const roomId = sessionService.getRoomId(session);
    const participantCount = sessionService.getParticipantCount(session);

    sessionNamespace.to(roomId).emit("user_left", {
      userId,
      participantCount,
    });
    logger.info(`User ${userId} disconnected from session ${roomId}`);
  } catch (err) {
    logger.error(`Error in handleDisconnect: ${err.message}`);
  }
};
