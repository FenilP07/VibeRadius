import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { v4 as uuidv4 } from "uuid";

const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      socket.user = {
        _id: `guest_${uuidv4()}`,
        role: "guest",
      };

      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = {
      _id: decoded._id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    logger.warn(`Socket Auth Error: ${error.message}`);
    socket.user = {
      _id: `guest_${uuidv4()}`,
      role: "guest",
    };
    next();
  }
};

export default socketAuth;
