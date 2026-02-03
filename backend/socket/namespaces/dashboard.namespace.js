import socketAuth from "../../middlewares/socketAuth.middleware.js";
import logger from "../../utils/logger.js";
import {
  handleSubscribeDashboard,
  handleUnsubscribeDashboard,
} from "../handlers/dashbaord.handler.js";

const registerDashboardNamespace = (io) => {
  const dashboardNamespace = io.of("/dashboard");

  dashboardNamespace.use(async (socket, next) => {
    return socketAuth(socket, next);
  });

  dashboardNamespace.on("connection", async (socket) => {
    const userId = socket.user?._id?.toString();
    const userName =
      socket.user?.name || socket.user?.username || `User_${userId?.slice(-6)}`;

    logger.info(`Host ${userId} (${userName}) connected to /dashboard`);

    socket.on("subscribe_dashboard", async (callback) => {
      try {
        await handleSubscribeDashboard(socket, userId, callback);
      } catch (err) {
        logger.error(
          `Subscribe dashboard error for user ${userId}: ${err.message}`
        );
        if (callback && typeof callback === "function") {
          callback({ success: false, message: err.message });
        }
      }
    });
    socket.on("unsubscribe_dashboard", async (callback) => {
      try {
        await handleUnsubscribeDashboard(socket, userId, callback);
      } catch (err) {
        logger.error(
          `Unsubscribe dashboard error for user ${userId}: ${err.message}`
        );
        if (callback && typeof callback === "function") {
          callback({ success: false, message: err.message });
        }
      }
    });

    socket.on("disconnect", (reason) => {
      logger.info(
        `Host ${userId} disconnected from /dashboard. Reason: ${reason}`
      );
    });
  });
};

export { registerDashboardNamespace };
