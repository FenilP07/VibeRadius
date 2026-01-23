import { useEffect, useRef, useState } from "react";
import useAuthStore from "../store/authStore";
import { getSocket } from "../utils/socketManager";

export const useSessionSocket = (
  sessionCode,
  eventHandlers = {},
  { guest = false } = {}
) => {
  const { isAuthenticated, socketToken } = useAuthStore();
  const handlersRef = useRef(eventHandlers);
  const [isConnected, setIsConnected] = useState(false);
  const [joinError, setJoinError] = useState(null);

  useEffect(() => {
    handlersRef.current = eventHandlers;
  }, [eventHandlers]);

  useEffect(() => {
    if (!guest && (!isAuthenticated || !socketToken)) {
      console.log("⏸️ [Socket] Waiting for authentication");
      return;
    }

    if (!sessionCode) {
      console.log("⏸️ [Socket] No session code provided");
      return;
    }

    let socketInstance = null;
    let cancelled = false;
    const registeredHandlers = [];

    const initSocket = async () => {
      try {
        socketInstance = await getSocket("/session", { guest });

        if (!socketInstance || cancelled) return;

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socketInstance.on("connect", onConnect);
        socketInstance.on("disconnect", onDisconnect);
        registeredHandlers.push(["connect", onConnect]);
        registeredHandlers.push(["disconnect", onDisconnect]);

        Object.entries(handlersRef.current).forEach(([event, handler]) => {
          socketInstance.on(event, handler);
          registeredHandlers.push([event, handler]);
        });

        socketInstance.emit("join_session", sessionCode, (res) => {
          if (res?.success) {
            console.log(`✅ [Session] Joined: ${sessionCode}`);
            setJoinError(null);
          } else {
            console.error(`❌ [Session] Join failed:`, res?.message);
            setJoinError(res?.message || "Failed to join session");
          }
        });
      } catch (error) {
        console.error("❌ [Socket] Init error:", error);
        setJoinError(error.message);
      }
    };

    initSocket();

    return () => {
      cancelled = true;
      if (socketInstance) {
        console.log(`🧹 [Session] Cleaning up: ${sessionCode}`);

        socketInstance.emit("leave_session", sessionCode, (res) => {
          if (res?.success) {
            console.log(`👋 [Session] Left: ${sessionCode}`);
          }
        });

        registeredHandlers.forEach(([event, handler]) => {
          socketInstance.off(event, handler);
        });

        setIsConnected(false);
      }
    };
  }, [isAuthenticated, socketToken, sessionCode, guest]);

  return { isConnected, joinError };
};
