import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";

const sockets = {};
// We use this to track namespaces that are currently refreshing their token
const refreshingNamespaces = new Set();

export const getSocket = async (namespace) => {
  const authStore = useAuthStore.getState();
  let token = authStore.socketToken;

  // 1. Ensure we have a token before even trying to initialize
  if (!token) {
    token = await authStore.fetchSocketToken();
  }

  if (!sockets[namespace]) {
    const baseURL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

    sockets[namespace] = io(`${baseURL}${namespace}`, {
      auth: { token },
      transports: ["websocket"], // Preferred for performance
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000, // Increased slightly for server breathing room
    });

    // --- EVENT LISTENERS ---

    sockets[namespace].on("connect", () => {
      console.log(
        `✅ [Socket] Connected to ${namespace} (${sockets[namespace].id})`
      );
      refreshingNamespaces.delete(namespace);
    });

    sockets[namespace].on("connect_error", async (err) => {
      console.error(
        `❌ [Socket] Connection error on ${namespace}:`,
        err.message
      );

      const isAuthError =
        err.message === "Invalid or expired token" ||
        err.message === "Authentication token missing";

      if (isAuthError && !refreshingNamespaces.has(namespace)) {
        refreshingNamespaces.add(namespace);
        console.warn(`⚠️ [Socket] Refreshing token for ${namespace}...`);

        const newToken = await authStore.fetchSocketToken();
        if (newToken) {
          updateSocketToken(namespace, newToken);
        } else {
          // If we can't get a new token, the user is likely logged out
          disconnectSocket(namespace);
        }
      }
    });

    sockets[namespace].on("disconnect", (reason) => {
      console.log(`🔌 [Socket] Disconnected from ${namespace}:`, reason);
      if (reason === "io server disconnect") {
        // Server kicked us out, try to reconnect manually
        sockets[namespace].connect();
      }
    });
  }

  return sockets[namespace];
};

/**
 * Updates the token for an existing socket and reconnects it
 */
export const updateSocketToken = (namespace, token) => {
  const socket = sockets[namespace];
  if (socket) {
    console.log(`🔄 [Socket] Updating auth token for ${namespace}`);
    socket.auth.token = token;

    // Instead of disconnect/connect, we just force a clean reconnection
    // with the new credentials.
    socket.disconnect().connect();
  }
};

/**
 * Cleanly closes a specific namespace
 */
export const disconnectSocket = (namespace) => {
  const socket = sockets[namespace];
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    delete sockets[namespace];
    refreshingNamespaces.delete(namespace);
    console.log(`🧹 [Socket] Cleaned up namespace: ${namespace}`);
  }
};

/**
 * Clears all active socket connections (useful for Logout)
 */
export const disconnectAllSockets = () => {
  Object.keys(sockets).forEach((namespace) => {
    disconnectSocket(namespace);
  });
};
