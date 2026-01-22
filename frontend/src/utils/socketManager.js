import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";

const sockets = {};
const refreshingNamespaces = new Set();

export const getSocket = async (namespace) => {
  const authStore = useAuthStore.getState();
  
  // 1. Await the token. If it's not in the store, fetch it before continuing.
  let token = authStore.socketToken;
  if (!token) {
    console.log(`[Socket] Token missing for ${namespace}, fetching...`);
    token = await authStore.fetchSocketToken();
  }

  // 2. Prevent initialization if we still don't have a token
  if (!token) {
    console.error(`[Socket] Failed to obtain token for ${namespace}`);
    return null;
  }

  if (!sockets[namespace]) {
    const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

    // 3. Initialize with the confirmed token
    sockets[namespace] = io(`${baseURL}${namespace}`, {
      auth: { token }, // Explicitly pass the resolved token
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    // --- LISTENERS ---
    sockets[namespace].on("connect", () => {
      console.log(`✅ [Socket] Connected to ${namespace}`);
      refreshingNamespaces.delete(namespace);
    });

    sockets[namespace].on("connect_error", async (err) => {
      console.error(`❌ [Socket] ${namespace} error:`, err.message);

      const isAuthError = 
        err.message === "Invalid or expired token" || 
        err.message === "Authentication token missing";

      if (isAuthError && !refreshingNamespaces.has(namespace)) {
        refreshingNamespaces.add(namespace);
        const newToken = await authStore.fetchSocketToken();
        if (newToken) {
          updateSocketToken(namespace, newToken);
        } else {
          disconnectSocket(namespace);
        }
      }
    });
  }

  return sockets[namespace];
};

export const updateSocketToken = (namespace, token) => {
  const socket = sockets[namespace];
  if (socket) {
    socket.auth.token = token;
    socket.disconnect().connect();
  }
};

export const disconnectSocket = (namespace) => {
  const socket = sockets[namespace];
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    delete sockets[namespace];
    refreshingNamespaces.delete(namespace);
  }
};