import { useEffect, useRef } from "react";
import useAuthStore from "../store/authStore";
import { getSocket } from "../utils/socketManager";

export const useSessionSocket = (eventHandlers = {}) => {
  const { isAuthenticated } = useAuthStore();

  // Use a ref to store handlers so we can access the latest ones
  // without re-triggering the useEffect
  const handlersRef = useRef(eventHandlers);

  // Update the ref whenever handlers change
  useEffect(() => {
    handlersRef.current = eventHandlers;
  }, [eventHandlers]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let socketInstance = null;

    const initSocket = async () => {
      // 1. Get the socket (manager handles tokens internally)
      socketInstance = await getSocket("/session");

      if (!socketInstance) return;

      // 2. Attach handlers using the ref
      Object.entries(handlersRef.current).forEach(([event, handler]) => {
        socketInstance.on(event, handler);
      });

      console.log("📡 [Socket] Listeners attached to /session");
    };

    initSocket();

    // Cleanup function
    return () => {
      if (socketInstance) {
        Object.entries(handlersRef.current).forEach(([event, handler]) => {
          socketInstance.off(event, handler);
        });
        console.log("🛑 [Socket] Listeners removed from /session");
      }
    };
  }, [isAuthenticated]);
};
