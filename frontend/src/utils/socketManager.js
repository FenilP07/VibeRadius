import { io } from "socket.io-client";
import useAuthStore from "../store/authStore";

const sockets = {};
const refreshingNamespaces = new Set();

const getSocket = async (namespace, { guest = false } = {}) => {
  const authStore = useAuthStore.getState();

  let token = null;
  if (!guest && authStore.isAuthenticated) {
    token = authStore.socketToken || (await authStore.fetchSocketToken());

    if (!token) {
      console.warn(
        `⏸️ [Socket] No token available for ${namespace}, connecting as guest`
      );

      guest = true;
    }
  }

  if (sockets[namespace]?.connected) {
    console.log(`✅ [Socket] Reusing existing connection for ${namespace}`);
    return sockets[namespace];
  }

  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  sockets[namespace] = io(`${baseURL}${namespace}`, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  sockets[namespace].on("connect", () => {
    console.log(
      `✅ [Socket] Connected to ${namespace} ${guest || !token ? "(as guest)" : "(authenticated)"}`
    );
    refreshingNamespaces.delete(namespace);
  });

  sockets[namespace].on("connect_error", async (err) => {
    console.error(`❌ [Socket] ${namespace} error:`, err.message);

    const isAuthError =
      err.message === "Invalid or expired token" ||
      err.message === "Authentication token missing" ||
      err.message === "jwt expired";

    if (
      isAuthError &&
      !guest &&
      authStore.isAuthenticated &&
      !refreshingNamespaces.has(namespace)
    ) {
      refreshingNamespaces.add(namespace);

      console.log(`🔄 [Socket] Refreshing token for ${namespace}`);
      const newToken = await authStore.fetchSocketToken();

      if (newToken) {
        updateSocketToken(namespace, newToken);
      } else {
        console.error(`❌ [Socket] Token refresh failed for ${namespace}`);
        disconnectSocket(namespace);
      }

      refreshingNamespaces.delete(namespace);
    }
  });

  sockets[namespace].on("disconnect", (reason) => {
    console.log(`🔌 [Socket] Disconnected from ${namespace}:`, reason);
  });

  return sockets[namespace];
};

const updateSocketToken = (namespace, token) => {
  const socket = sockets[namespace];
  if (socket) {
    console.log(`🔄 [Socket] Updating token for ${namespace}`);
    socket.auth.token = token;
    socket.disconnect().connect();
  }
};

const disconnectSocket = (namespace) => {
  const socket = sockets[namespace];
  if (socket) {
    console.log(`🛑 [Socket] Disconnecting ${namespace}`);
    socket.removeAllListeners();
    socket.disconnect();
    delete sockets[namespace];
    refreshingNamespaces.delete(namespace);
  }
};

const disconnectAllSockets = () => {
  console.log("🛑 [Socket] Disconnecting all sockets");
  Object.keys(sockets).forEach(disconnectSocket);
};

export { getSocket, updateSocketToken, disconnectSocket, disconnectAllSockets };
