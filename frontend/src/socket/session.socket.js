import { useEffect, useRef } from "react";
import useAuthStore from "../store/authStore";
import { getSocket } from "../utils/socketManager";

export const useSessionSocket = (sessionCode, eventHandlers = {}) => {
  const { isAuthenticated, socketToken } = useAuthStore();
  const handlersRef = useRef(eventHandlers);

  // Keep handlers updated without triggering re-renders
  useEffect(() => {
    handlersRef.current = eventHandlers;
  }, [eventHandlers]);

  useEffect(() => {
    // Only attempt connection if authenticated and we actually have a token string
    if (!isAuthenticated || !socketToken || !sessionCode) return;

    let socketInstance = null;
    let cancelled = false;
    let registeredHandlers = [];

    const initSocket = async () => {
      socketInstance = await getSocket("/session");

      if (!socketInstance || cancelled) return;

      // Register handlers
      registeredHandlers = Object.entries(handlersRef.current);
      registeredHandlers.forEach(([event, handler]) => {
        socketInstance.on(event, handler);
      });

      // Join the specific session room
      socketInstance.emit("join_session", sessionCode, (res) => {
        if (!res.success) console.error("❌ Join Error:", res.message);
      });
    };

    initSocket();

    return () => {
      cancelled = true;
      if (socketInstance) {
        // Emit leave before removing listeners
        socketInstance.emit("leave_session", sessionCode);

        registeredHandlers.forEach(([event, handler]) => {
          socketInstance.off(event, handler);
        });
        console.log("🛑 [Socket] Cleanup complete");
      }
    };
  }, [isAuthenticated, socketToken, sessionCode, eventHandlers]); // Re-run when token is finally fetched
};
