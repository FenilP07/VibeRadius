
import { useEffect } from "react";
import useAuthStore from "../store/authStore";
import { getSocket, updateSocketToken } from "./socketManager";
import { decodeJWT, refreshAccessToken } from "../utils/authUtils";

export const useSessionSocket = (eventHandlers = {}) => {
  const { accessToken, refreshToken, isAuthenticated, setAccessToken } =
    useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = getSocket("/session", accessToken);

    // Connect event
    socket.on("connect", () =>
      console.log("✅ Session socket connected", socket.id),
    );

    // Handle token expiration via connect_error
    socket.on("connect_error", async (err) => {
      if (err.message === "Unauthorized") {
        console.log("⚠️ Access token expired. Refreshing...");
        const newToken = await refreshAccessToken(refreshToken);
        if (newToken) {
          setAccessToken(newToken);
          updateSocketToken("/session", newToken);
        }
      }
    });

    // Register custom events
    for (const [event, handler] of Object.entries(eventHandlers)) {
      socket.on(event, handler);
    }

    // Auto-refresh token before it expires
    const { exp } = decodeJWT(accessToken);
    const now = Date.now();
    const msUntilRefresh = exp * 1000 - now - 60_000;

    const refreshTimer = setTimeout(async () => {
      const newToken = await refreshAccessToken(refreshToken);
      if (newToken) {
        setAccessToken(newToken);
        updateSocketToken("/session", newToken);
      }
    }, msUntilRefresh);

    return () => {
      // Cleanup
      clearTimeout(refreshTimer);
      for (const [event, handler] of Object.entries(eventHandlers)) {
        socket.off(event, handler);
      }
    };
  }, [accessToken, refreshToken, isAuthenticated, setAccessToken]);
};
