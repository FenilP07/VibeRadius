import Queue from "../../models/queue.model.js";
import Session from "../../models/session.model.js";
import logger from "../../utils/logger.js";
import { isUpperCase } from "../../utils/typeVerification.js";

class QueueService {
  async getSessionQueue(sessionId) {
    const queueItems = await Queue.find({
      session_id: sessionId,
      status: "queued",
    }).sort({ createdAt: 1 });

    return queueItems.map((track) => ({
      _id: track._id,
      track_id: track.track_id,
      title: track.title,
      artists: track.artists,
      albumImage: track.track_image,
      table: track.added_by_name,
      votes: track.total_votes,
      requestedById: track.added_by_id,
      requestedByName: track.added_by_name,
      addedAt: track.createdAt,
      status: track.status,
    }));
  }

  async handleGetSessionData(sessionCode) {
    try {
      // Basic validation for session code format (e.g., length, uppercase)
      if (!sessionCode || !isUpperCase(sessionCode)) {
        return { success: false, message: "Invalid session code format." };
      }

      // Fetch session and populate current track details
      const session = await Session.findOne({
        session_code: sessionCode.toUpperCase(),
      }).populate("current_track_id");
      const queue = await this.getSessionQueue(session._id);

      // If there's a current track, format its details for the response
      let currentlyPlaying = null;
      if (session.current_track_id) {
        const currentTrack = session.current_track_id;
        if (currentTrack) {
          currentlyPlaying = {
            _id: currentTrack._id,
            // trackId: currentTrack.track_id,
            track_id: currentTrack.track_id,
            uri: `spotify:track:${currentTrack.track_id}`,
            name: currentTrack.title,
            artists: currentTrack.artists,
            albumImage: currentTrack.track_image,
            addedBy: currentTrack.added_by_name,
          };
        }
      }

      logger.info(`Listener from backend ${session.participants.length}`)
      // Compile all session data into a structured response
      const data = {
        session: {
          id: session._id,
          name: session.session_name,
          code: session.session_code,
          status: session.session_status,
          hostId: session.host_id,
          createdAt: session.createdAt,
        },
        stats: {
          listeners: session.participants?.length ?? 0,
          inQueue: queue.length,
          estimatedWait: queue.length * 3,
        },
        currentlyPlaying,
        queue,
        upNext: queue.length > 0 ? queue[0] : null,
      };

      return { success: true, data };
    } catch (err) {
      logger.error(`Error in getSessionData: ${err.message}`);
      return { success: false, message: err.message };
    }
  }

  async handleMoveSongToQueue(trackDetails, user, sessionId) {
    try {
      const session = await Session.findById(sessionId);

      if (!session) {
        return { success: false, message: "Session not found" };
      }

      const isFirstTrack = !session.current_track_id;
      const newQueueItem = new Queue({
        session_id: sessionId,
        track_id: trackDetails.id,
        title: trackDetails.name,
        artists: trackDetails.artists,
        track_image: trackDetails.album?.images[0]?.url,

        added_by_id: user.id,
        added_by_name: user.name,
        total_votes: 0,
        status: isFirstTrack ? "playing" : "queued",
      });
      await newQueueItem.save();

      if (isFirstTrack) {
        session.current_track_id = newQueueItem._id;
        await session.save();
      }
      return { success: true, data: newQueueItem, startedNow: isFirstTrack };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async advanceToNextTrack(sessionId) {
    const session = await Session.findById(sessionId);
    if (!session) return { success: false, message: "Session not found" };

    if (session.current_track_id) {
      await Queue.findByIdAndUpdate(session.current_track_id, {
        $set: { status: "played" },
      });
    }

    const next = await Queue.findOne({
      session_id: sessionId,
      status: "queued",
    }).sort({ createdAt: 1 });

    if (!next) {
      session.current_track_id = null;
      await session.save();
      return { success: true, nextTrack: null };
    }

    next.status = "playing";
    await next.save();

    return { success: true, nextTrack: next };
  }
}

export default new QueueService();
