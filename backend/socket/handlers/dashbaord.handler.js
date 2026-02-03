import logger from "../../utils/logger.js";
import Session from "../../models/session.model.js";

export const handleSubscribeDashboard = async (socket, userId, callback) => {
  try {
    logger.info(`User ${userId} subscribing to dashboard updates`);
    socket.join("dashboard_subscribers");

    const activeSessions = await Session.find({
      status: "active",
    })
      .select("code name participants queue")
      .lean();

    const dashboardData = activeSessions.map((session) => ({
      code: session.code,
      name: session.name,
      listeners: session.participants?.length || 0,
      songs: session.queue?.length || 0,
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
