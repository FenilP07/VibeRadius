const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      logger.warn("Socket connection rejected: No token provided");
      return next(new Error("Authentication token missing"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = {
      _id: decoded._id,
      role: decoded.role,
      email: decoded.email,
    };

    logger.info("Socket authenticated", {
      socketId: socket.id,
      userId: decoded._id,
      role: decoded.role,
    });

    next();
  } catch (error) {
    logger.warn("Socket authentication failed:", err.message);
    next(new Error("Invalid or expired token"));
  }
};

export default socketAuth;
