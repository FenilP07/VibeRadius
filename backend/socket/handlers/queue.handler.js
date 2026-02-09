import QueueService from "../services/queue.service.js";
import logger from "../../utils/logger.js";
import sessionService from "../services/session.service.js";

const emitToDashboard = (io, event, data) => {
  try {
    const dashboardNamespace = io.of("/dashboard");
    dashboardNamespace.to("dashboard_subscribers").emit(event, data);
  } catch (err) {
    logger.error("Error emitting to dashboard:", err.message);
  }
};

const handleGetSessionData = async (
  socket,
  sessionNamespace,
  userId,
  data,
  callback
) => {
  try {
    const { sessionCode } = data;
    const sessionData = await QueueService.handleGetSessionData(sessionCode);
    if (!sessionData.success) {
      if (callback && typeof callback === "function") {
        callback({
          success: false,
          message: sessionData.message,
        });
      }
      return;
    }
    logger.info(`Successfully retrieved session data for ${sessionCode}`);
    if (callback && typeof callback === "function") {
      callback({
        success: true,
        data: sessionData.data,
      });
    }
  } catch (err) {
    if (callback && typeof callback === "function") {
      callback({
        success: false,
        message: "Failed to get session data",
        error: err.message,
      });
    }
  }
};

const handleMoveSongToQueue = async (
  sessionNamespace,
  trackDetails,
  sessionCode,
  user,
  callback
) => {
  /* Do we have a Track details? -- If not, we just return an error
    Does session really exist? -- If not, we return an error
    Is the user part of the session? -- If not, we return an error
    If all good, we add the track to the queue and emit an event to all participants in the session with the new queue data
  */

  try {
    // Validate track details
    if (!trackDetails) {
      if (callback && typeof callback === "function") {
        callback({ success: false, message: "No track details found." });
      }
      return callback;
    }

    // Validate session existence
    const session = await sessionService.getSessionByCode(sessionCode);
    if (!session) {
      logger.warn(`Session ${sessionCode} not found for moving song to queue.`);
      if (callback && typeof callback === "function") {
        callback({ success: false, message: "Session not found." });
      }
      return callback;
    }

    // validate participant
    const isParticipant = session.participants.some((p) => p.id === user.id);
    if (!isParticipant) {
      logger.warn(
        `User ${user.id} is not a participant of session ${sessionCode}. Cannot move song to queue.`
      );
      if (callback && typeof callback === "function") {
        callback({
          success: false,
          message: "User is not a participant of the session.",
        });
      }
      return callback;
    }

    // Add track to Queue
    const queueResult = await QueueService.handleMoveSongToQueue(
      trackDetails,
      user.name,
      session._id
    );
    if (!queueResult.success) {
      logger.error(
        `Failed to move song to queue for session ${sessionCode}: ${queueResult.message}`
      );
      if (callback && typeof callback === "function") {
        callback({ success: false, message: queueResult.message });
      }
      return callback;
    }

    // Emit updated queue to session participants
    const roomId = sessionService.getRoomId(session);
    const updatedQueue = await QueueService.getSessionQueue(session._id);
    emitToDashboard(sessionNamespace.server, "dashboard_session_updated", {
      sessionCode,
      songs: updatedQueue.length,
    });
    const payload = { queue: updatedQueue };
    sessionNamespace.to(roomId).emit("queue_updated", payload);
    if (callback && typeof callback === "function") {
      callback({ success: true, ...payload });
    }
  } catch (err) {
    logger.error(`Error in handleMoveSongToQueue: ${err.message}`);
    if (callback && typeof callback === "function") {
      callback({
        success: false,
        message: "Error moving song to queue",
        error: err.message,
      });
    }
    return callback;
  }
};

export { handleGetSessionData, handleMoveSongToQueue };
