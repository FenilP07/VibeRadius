import { io } from "socket.io-client";

const sockets = {};

export const getSocket = (namespace, token) => {
  if (!sockets[namespace]) {
    sockets[namespace] = io(`${import.meta.env.VITE_BACKEND_URL}${namespace}`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
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
    socket.disconnect();
    delete sockets[namespace];
  }
};
