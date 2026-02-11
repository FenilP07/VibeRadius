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
  sessionCode,
  callback
) => {
  try {
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
  try {
    if (!trackDetails) {
      return callback?.({ success: false, message: "No track details found." });
    }

    const session = await sessionService.getSessionByCode(sessionCode);
    if (!session) {
      logger.warn(`Session ${sessionCode} not found for moving song to queue.`);
      return callback?.({ success: false, message: "Session not found." });
    }

    const isParticipant = session.participants?.some((p) => p.id === user.id);
    if (!isParticipant) {
      logger.warn(
        `User ${user.id} is not a participant of session ${sessionCode}. Cannot move song to queue.`
      );
      return callback?.({
        success: false,
        message: "User is not a participant of the session.",
      });
    }

    const queueResult = await QueueService.handleMoveSongToQueue(
      trackDetails,
      user,
      session._id
    );

    if (!queueResult.success) {
      logger.error(
        `Song has already been added to Queue for Session ${sessionCode}, Message: ${queueResult.message}`
      );
      return callback?.({ success: false, message: queueResult.message });
    }

    const roomId = sessionService.getRoomId(session);

    const updatedQueue = await QueueService.getSessionQueue(session._id);

    emitToDashboard(sessionNamespace.server, "dashboard_session_updated", {
      sessionCode,
      songs: updatedQueue.length,
    });

    sessionNamespace.to(roomId).emit("queue_updated", { queue: updatedQueue });

    if (queueResult.startedNow) {
      const playing = queueResult.data;

      sessionNamespace.to(roomId).emit("track_changed", {
        track: {
          _id: playing._id,
          id: playing.track_id,
          // trackId: playing.track_id,
          uri: `spotify:track:${playing.track_id}`,
          name: playing.title,
          title: playing.title,
          artists: playing.artists,
          albumImage: playing.track_image,
          status: playing.status,
          addedBy: playing.added_by_name,
        },
      });
    }

    return callback?.({
      success: true,
      queue: updatedQueue,
      startedNow: !!queueResult.startedNow,
    });
  } catch (err) {
    logger.error(`Error in handleMoveSongToQueue: ${err.message}`);
    return callback?.({
      success: false,
      message: "Error moving song to queue",
      error: err.message,
    });
  }
};
const handleTrackEnded = async (
  sessionNamespace,
  sessionCode,
  user,
  callback
) => {
  try {
    const session = await sessionService.getSessionByCode(sessionCode);
    if (!session) {
      return callback?.({ success: false, message: "Session not found" });
    }

    const roomId = sessionService.getRoomId(session);

    const result = await QueueService.advanceToNextTrack(session._id);

    if (!result.success) {
      return callback?.({ success: false, message: result.message });
    }

    const updatedQueue = await QueueService.getSessionQueue(session._id);
    sessionNamespace.to(roomId).emit("queue_updated", { queue: updatedQueue });

    if (!result.nextTrack) {
      sessionNamespace.to(roomId).emit("track_changed", { track: null });
      return callback?.({ success: true, track: null, queue: updatedQueue });
    }

    const t = result.nextTrack;

    sessionNamespace.to(roomId).emit("track_changed", {
      track: {
        _id: t._id,
        id: t.track_id,
        uri: `spotify:track:${t.track_id}`,
        name: t.title,
        title: t.title,
        artists: t.artists,
        albumImage: t.track_image,
        addedBy: t.added_by_name,
        status: t.status,
      },
    });

    return callback?.({ success: true, track: t, queue: updatedQueue });
  } catch (error) {
    logger.error("handleTrackEnded error:", error.message);
    return callback?.({ success: false, message: error.message });
  }
};

export { handleGetSessionData, handleMoveSongToQueue, handleTrackEnded };
