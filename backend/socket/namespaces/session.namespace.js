import socketAuth from "../../middlewares/socketAuth.middleware.js";
import {
  handleDisconnect,
  handleJoinSession,
  handleLeaveSession,
} from "../handlers/session.handler.js";
import logger from "../../utils/logger.js";
import { createUniqueUsername } from "../../utils/createUniqueUsername.js";
import crypto from "crypto";
import { handleGetSessionData, handleMoveSongToQueue } from "../../socket/handlers/queue.handler.js";
import { Namespace } from "socket.io";

const registerSessionNamespace = (io) => {
  const sessionNamespace = io.of("/session");

  sessionNamespace.use(async (socket, next) => {
    if (socket.handshake.auth?.guest) {
      return next();
    }

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

      logger.info(`Resolved userName: "${userName}" for userId: "${userId}"`);
    } else {
      // Guest user
      userId = `guest_${crypto.randomUUID()}`;
      userName = await createUniqueUsername();
    }

    logger.info(`User ${userId} (${userName}) connected to /session`);

    socket.on("join_session", async (sessionCode, callback) => {
      try {
        await handleJoinSession(
          socket,
          sessionNamespace,
          userId,
          userName,
          sessionCode,
          callback
        );

        logger.info(`Socket id: ${socket.id}`);
      } catch (err) {
        logger.error(`Join session error for user ${userId}: ${err.message}`);
        if (callback && typeof callback === "function") {
          callback({ success: false, message: err.message });
        }
      }
    });

    socket.on("leave_session", async (sessionCode, callback) => {
      try {
        await handleLeaveSession(
          socket,
          sessionNamespace,
          userId,
          sessionCode,
          callback
        );
      } catch (err) {
        logger.error(`Leave session error for user ${userId}: ${err.message}`);
        if (callback && typeof callback === "function") {
          callback({ success: false, message: err.message });
        }
      }
    });

    socket.on("get_session_data", async (data, callback) => {
      try {
        await handleGetSessionData(
          socket,
          sessionNamespace,
          userId,
          data,
          callback
        );
      } catch (err) {
        logger.error(
          `Get session data error for user ${userId}: ${err.message}`
        );
        if (callback && typeof callback === "function") {
          callback({ success: false, message: err.message });
        }
      }
    });

    socket.on("disconnecting", async (reason) => {
      logger.info(`User ${userId} is disconnecting. Reason: ${reason}`);

      if (socket.currentSessionId || socket.currentSessionCode) {
        try {
          await handleDisconnect(
            sessionNamespace,
            userId,
            socket.currentSessionId,
            socket.currentSessionCode
          );
        } catch (err) {
          logger.error(
            `Disconnecting error for user ${userId}: ${err.message}`
          );
        }
      }
    });

    socket.on("disconnect", async (reason) => {
      logger.info(
        `User ${userId} disconnected from /session. Reason: ${reason}`
      );

      if (socket.currentSessionId || socket.currentSessionCode) {
        try {
          await handleDisconnect(
            sessionNamespace,
            userId,
            socket.currentSessionId,
            socket.currentSessionCode
          );
        } catch (err) {
          logger.error(`Disconnect error for user ${userId}: ${err.message}`);
        }
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

    socket.on("error", (err) => {
      logger.error(`Socket error for user ${userId}: ${err.message}`);
    });
  });
};

export { registerSessionNamespace };
