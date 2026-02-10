import socketAuth from "../../middlewares/socketAuth.middleware.js";
import sessionService from "../services/session.service.js";
import logger from "../../utils/logger.js";
import { createUniqueUsername } from "../../utils/createUniqueUsername.js";
import crypto from "crypto";
import {
  handleGetSessionData,
  handleMoveSongToQueue,
  handleTrackEnded,
} from "../../socket/handlers/queue.handler.js";
import { Namespace } from "socket.io";
import queueService from "../services/queue.service.js";

const emitToDashboard = (io, event, data) => {
  try {
    const dashboardNamespace = io.of("/dashboard");
    dashboardNamespace.to("dashboard_subscribers").emit(event, data);
  } catch (err) {
    logger.error("Error emitting to dashboard:", err.message);
  }
};

const registerSessionNamespace = (io) => {
  const sessionNamespace = io.of("/session");

  // Auth middleware
  sessionNamespace.use(async (socket, next) => {
    if (socket.handshake.auth?.guest) return next();
    return socketAuth(socket, next);
  });

  sessionNamespace.on("connection", async (socket) => {
    let userId;
    let userName;

    if (socket.user?._id) {
      userId = socket.user._id.toString();
      userName =
        socket.user.name ||
        socket.user.username ||
        socket.user.displayName ||
        socket.user.email ||
        `User_${userId.slice(-6)}`;
    } else {
      // Guest user
      userId = `guest_${crypto.randomUUID()}`;
      userName = await createUniqueUsername();
    }

    logger.info(`User ${userId} (${userName}) connected to /session`);

    socket.on("join_session", async (sessionCode, callback) => {
      try {
        if (socket.currentSessionCode === sessionCode) {
          logger.info(`User ${userId} already in session ${sessionCode}`);
          return callback?.({ success: true });
        }

        const session = await sessionService.addUserToSession(
          sessionCode,
          userId,
          userName
        );

        if (!session) {
          return callback?.({ success: false, message: "Session not found" });
        }

        const roomId = sessionService.getRoomId(session);
        const participantCount = sessionService.getParticipantCount(session);

        socket.join(roomId);
        const queue = await queueService.getSessionQueue(session._id);
        sessionNamespace.to(roomId).emit("queue_updated", { queue });
        socket.currentSessionId = roomId;
        socket.currentSessionCode = sessionCode;

        sessionNamespace.to(roomId).emit("user_joined", {
          userId,
          name: userName,
          participantCount,
        });

        emitToDashboard(socket.server, "user_joined_session", {
          sessionCode,
          userId,
          name: userName,
          participantCount,
        });

        callback?.({ success: true, session });
        logger.info(`User ${userId} joined session ${sessionCode}`);
        logger.info(`Socket id: ${socket.id}`);
      } catch (err) {
        logger.error(`Join session error for user ${userId}: ${err.message}`);
        callback?.({ success: false, message: err.message });
      }
    });

    socket.on("leave_session", async (sessionCode, callback) => {
      if (
        !socket.currentSessionCode ||
        socket.currentSessionCode !== sessionCode
      ) {
        logger.warn(`User ${userId} not in session ${sessionCode}`);
        return callback?.({ success: false, message: "Not in session" });
      }

      try {
        const session = await sessionService.removeUserFromSession(
          { session_code: sessionCode },
          userId
        );

        if (!session)
          return callback?.({ success: false, message: "Session not found" });

        const roomId = sessionService.getRoomId(session);
        const participantCount = sessionService.getParticipantCount(session);

        socket.leave(roomId);
        socket.currentSessionId = null;
        socket.currentSessionCode = null;

        sessionNamespace.to(roomId).emit("user_left", {
          userId,
          participantCount,
        });
        emitToDashboard(socket.server, "user_left_session", {
          sessionCode,
          userId,
          participantCount,
        });

        callback?.({ success: true });
        logger.info(`User ${userId} left session ${sessionCode}`);
      } catch (err) {
        logger.error(`Leave session error for user ${userId}: ${err.message}`);
        callback?.({ success: false, message: err.message });
      }
    });

    socket.on("get_session_data", async (sessionCode, callback) => {
      try {
        await handleGetSessionData(
          socket,
          sessionNamespace,
          userId,
          sessionCode,
          callback
        );
      } catch (err) {
        logger.error(
          `Get session data error for user ${userId}: ${err.message}`
        );
        callback?.({ success: false, message: err.message });
      }
    });

    socket.on("disconnecting", async (reason) => {
      if (!socket.currentSessionId && !socket.currentSessionCode) return;

      logger.info(
        `User ${userId} disconnecting from session. Reason: ${reason}`
      );

      try {
        const session = await sessionService.removeUserFromSession(
          socket.currentSessionCode
            ? { session_code: socket.currentSessionCode }
            : { _id: socket.currentSessionId },
          userId
        );

        if (!session) return;

        const roomId = sessionService.getRoomId(session);
        const participantCount = sessionService.getParticipantCount(session);

        sessionNamespace.to(roomId).emit("user_left", {
          userId,
          participantCount,
        });

        emitToDashboard(socket.server, "user_left_session", {
          sessionCode: session.session_code,
          userId,
          participantCount,
        });

        logger.info(
          `User ${userId} removed from session ${roomId}. Participants remaining: ${participantCount}`
        );
      } catch (err) {
        logger.error(`Disconnect error for user ${userId}: ${err.message}`);
      }
    });

    socket.on("move_song_to_queue", async (data, callback) => {
      try {
        await handleMoveSongToQueue(
          sessionNamespace,
          data.trackDetails,
          data.sessionCode,
          data.user,
          callback
        );
      } catch (err) {
        if (callback && typeof callback === "function") {
          callback({ success: false, message: err.message });
        }
      }
    });

    socket.on("track_ended", async (payload, cb) => {
      try {
        await handleTrackEnded(
          sessionNamespace,
          payload.sessionCode,
          { id: userId, name: userName },
          cb
        );
      } catch (err) {
        cb?.({ success: false, message: err.message });
      }
    });

    socket.on("error", (err) => {
      logger.error(`Socket error for user ${userId}: ${err.message}`);
    });
  });

  return sessionNamespace;
};

export { registerSessionNamespace };
