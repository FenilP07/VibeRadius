import sessionService from "../services/session.service.js";
import logger from "../../utils/logger.js";

export const handleJoinSession = async (
  socket,
  sessionNamespace,
  userId,
  userName,
  sessionCode,
  callback
) => {
  try {
    // ✅ DEBUG: Log all inputs
    logger.info(`=== JOIN SESSION START ===`);
    logger.info(`sessionCode: "${sessionCode}" (type: ${typeof sessionCode})`);
    logger.info(`userId: "${userId}" (type: ${typeof userId})`);
    logger.info(`userName: "${userName}" (type: ${typeof userName})`);
    logger.info(`callback: ${typeof callback}`);

    // Validate inputs
    if (!sessionCode || typeof sessionCode !== 'string') {
      logger.error(`Invalid sessionCode: ${sessionCode}`);
      if (callback && typeof callback === 'function') {
        callback({ success: false, message: "Invalid session code" });
      }
      return;
    }

    if (!userId || typeof userId !== 'string') {
      logger.error(`Invalid userId: ${userId}`);
      if (callback && typeof callback === 'function') {
        callback({ success: false, message: "Invalid user ID" });
      }
      return;
    }

    if (!userName || typeof userName !== 'string') {
      logger.error(`Invalid userName: ${userName}`);
      if (callback && typeof callback === 'function') {
        callback({ success: false, message: "Invalid user name" });
      }
      return;
    }

    const session = await sessionService.addUserToSession(
      sessionCode,
      userId,
      userName
    );

    if (!session) {
      if (callback && typeof callback === 'function') {
        callback({
          success: false,
          message: "Session not found",
        });
      }
      return;
    }

    const roomId = sessionService.getRoomId(session);
    const participantCount = sessionService.getParticipantCount(session);

    socket.join(roomId);
    socket.currentSessionId = roomId;
    socket.currentSessionCode = sessionCode;

    sessionNamespace.to(roomId).emit("user_joined", {
      userId,
      name: userName,
      participantCount,
    });

    if (callback && typeof callback === 'function') {
      callback({
        success: true,
        session,
      });
    }
    
    logger.info(`=== JOIN SESSION SUCCESS ===`);
  } catch (err) {
    logger.error(`Error in handleJoinSession: ${err.message}`);
    logger.error(err.stack);
    if (callback && typeof callback === 'function') {
      callback({
        success: false,
        message: "Error joining session",
        error: err.message,
      });
    }
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
      if (callback && typeof callback === 'function') {
        callback({ success: false, message: "Session not found" });
      }
      return;
    }

    const roomId = sessionService.getRoomId(session);
    const participantCount = sessionService.getParticipantCount(session);

    socket.leave(roomId);
    socket.currentSessionId = null;
    socket.currentSessionCode = null;

    sessionNamespace.to(roomId).emit("user_left", {
      userId,
      participantCount,
    });

    if (callback && typeof callback === 'function') {
      callback({ success: true });
    }
  } catch (err) {
    logger.error(`Error in handleLeaveSession: ${err.message}`);
    if (callback && typeof callback === 'function') {
      callback({
        success: false,
        message: "Error leaving session",
        error: err.message,
      });
    }
  }
};

export const handleDisconnect = async (sessionNamespace, userId, sessionId, sessionCode) => {
  try {
    let session = null;
    
    if (sessionCode) {
      logger.info(`Removing user ${userId} from session ${sessionCode}`);
      session = await sessionService.removeUserFromSession(
        { session_code: sessionCode },
        userId
      );
    } else if (sessionId) {
      logger.info(`Removing user ${userId} from session ID ${sessionId}`);
      session = await sessionService.removeUserFromSession(
        { _id: sessionId },
        userId
      );
    }

    if (!session) {
      logger.warn(
        `Session ${sessionCode || sessionId} not found during disconnect for user ${userId}`
      );
      return;
    }

    const roomId = sessionService.getRoomId(session);
    const participantCount = sessionService.getParticipantCount(session);

    sessionNamespace.to(roomId).emit("user_left", {
      userId,
      participantCount,
    });
    
    logger.info(`User ${userId} removed from session ${roomId}. ${participantCount} participants remaining.`);
  } catch (err) {
    logger.error(`Error in handleDisconnect: ${err.message}`);
  }
};