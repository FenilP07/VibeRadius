import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Attach user data to socket for use in handlers
    socket.user = {
      _id: decoded._id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.warn(`Socket Auth Error: ${error.message}`);
    // Explicit message so frontend socketManager knows to refresh token
    next(new Error("Invalid or expired token"));
  }
};

export default socketAuth;