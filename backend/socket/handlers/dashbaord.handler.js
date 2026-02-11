import logger from "../../utils/logger.js";
import Session from "../../models/session.model.js";
import QueueService from "../services/queue.service.js";

export const handleSubscribeDashboard = async (socket, userId, callback) => {
  try {
    logger.info(`User ${userId} subscribing to dashboard updates`);
    socket.join("dashboard_subscribers");

    const activeSessions = await Session.find({
      session_status: "active",
      host_id: userId,
    }).select("_id session_code session_name participants current_track_id").lean();

    const queue = await QueueService.getSessionQueue(activeSessions.map(s => s._id));

    const getQueueCount = (sessionId) => {
      return queue.filter(q => q.session_id.toString() === sessionId.toString()).length;
    };

    const dashboardData = activeSessions.map((session) => ({
      id: session._id,
      code: session.session_code,
      name: session.session_name,
      listeners: session.participants?.length || 0,
      songs: getQueueCount(session._id) || 0, // TODO: Optimize this by pre-counting queues for all sessions in one go
    }));

    if (callback && typeof callback === "function") {
      callback({
        success: true,
        message: "subscribed to dashboard updates",
        data: dashboardData,
      });
    }
    logger.info(`User ${userId} successfully subscribed to dashboard`);
  } catch (error) {
    logger.error(
      `Subscribe dashboard error for user ${userId}: ${error.message}`
    );
    if (callback && typeof callback === "function") {
      callback({
        success: false,
        message: error.message,
      });
    }
  }
};

export const handleUnsubscribeDashboard = async (socket, userId, callback) => {
  try {
    logger.info(`User ${userId} unsubscribing from dashboard updates`);

    // Leave the dashboard room
    socket.leave("dashboard_subscribers");

    if (callback && typeof callback === "function") {
      callback({
        success: true,
        message: "Unsubscribed from dashboard",
      });
    }

    logger.info(`User ${userId} successfully unsubscribed from dashboard`);
  } catch (error) {
    logger.error(
      `Unsubscribe dashboard error for user ${userId}: ${error.message}`
    );
    if (callback && typeof callback === "function") {
      callback({
        success: false,
        message: error.message,
      });
    }
  }
};
