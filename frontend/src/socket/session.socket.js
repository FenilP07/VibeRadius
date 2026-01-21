import { useEffect } from "react";
import useAuthStore from "../store/authStore";
import { getSocket } from "../utils/socketManager";

export const useSessionSocket = (eventHandlers = {}) => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.warn("⚠️ No access token found for socket connection");
      return;
    }

    const socket = getSocket("/session", accessToken);

    // Register custom event handlers
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // Cleanup
    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [isAuthenticated, eventHandlers]);
};