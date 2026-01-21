import { io } from "socket.io-client";

const sockets = {};

export const getSocket = (namespace, token) => {
  if (!sockets[namespace]) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    
    sockets[namespace] = io(`${baseURL}${namespace}`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    sockets[namespace].on("connect", () => {
      console.log(`✅ Connected to ${namespace}:`, sockets[namespace].id);
    });

    sockets[namespace].on("connect_error", (err) => {
      console.error(`❌ Connection error on ${namespace}:`, err.message);
      
      if (err.message === "Invalid or expired token" || 
          err.message === "Authentication token missing") {
        console.warn("⚠️ Socket authentication failed - token issue");
      }
    });

    sockets[namespace].on("disconnect", (reason) => {
      console.log(`🔌 Disconnected from ${namespace}:`, reason);
    });
  }

  return sockets[namespace];
};

export const updateSocketToken = (namespace, token) => {
  const socket = sockets[namespace];
  if (socket) {
    socket.auth.token = token;
    socket.disconnect();
    socket.connect();
  }
};

export const disconnectSocket = (namespace) => {
  const socket = sockets[namespace];
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    delete sockets[namespace];
  }
};

export const disconnectAllSockets = () => {
  Object.keys(sockets).forEach((namespace) => {
    disconnectSocket(namespace);
  });
};