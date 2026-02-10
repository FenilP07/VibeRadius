import { useEffect, useRef } from "react";
import useAuthStore from "../store/authStore";
import useLiveSessionStore from "../store/liveSessionStore";
import { getSocket } from "../utils/socketManager";

export const useSessionSocket = (
  sessionCode,
  eventHandlers = {},
  { guest = false } = {}
) => {
  const { isAuthenticated, socketToken, user } = useAuthStore();
  const {
    setConnected,
    setJoining,
    setJoinError,
    setSessionData,
    handleUserJoined,
    handleUserLeft,
  } = useLiveSessionStore();

  const handlersRef = useRef(eventHandlers);
  const socketRef = useRef(null);
  const initializedSession = useRef(null);
  const hasLoggedWaiting = useRef(false);

  useEffect(() => {
    handlersRef.current = eventHandlers;
  }, [eventHandlers]);

  useEffect(() => {
    const actualGuest = guest || !isAuthenticated;

    if (!actualGuest && !socketToken) {
      if (!hasLoggedWaiting.current) {
        console.log("⏸️ [Socket] Waiting for authentication...");
        hasLoggedWaiting.current = true;
      }
      return;
    }

    if (!sessionCode) return;

    if (initializedSession.current === sessionCode) return;

    hasLoggedWaiting.current = false;

    let socketInstance = null;
    let cancelled = false;

    const initSocket = async () => {
      try {
        console.log(
          `[Socket] Initializing connection for session: ${sessionCode}`
        );
        setJoining(true);

        socketInstance = await getSocket("/session", { guest: actualGuest });
        socketRef.current = socketInstance;

        if (!socketInstance || cancelled) return;

        const onConnect = () => {
          console.log("[Socket] Connected");
          setConnected(true);
        };
        const onDisconnect = () => {
          console.log("[Socket] Disconnected");
          setConnected(false);
        };
        socketInstance.on("connect", onConnect);
        socketInstance.on("disconnect", onDisconnect);

        const onUserJoined = (data) => {
          handleUserJoined(data);
          if (window.showToast) window.showToast(`${data.name} joined`, "join");
        };
        const onUserLeft = (data) => {
          console.log("User left:", data);
          handleUserLeft(data);
          if (window.showToast) window.showToast(`${data.name} left`, "leave");
        };

        socketInstance.on("user_joined", onUserJoined);
        socketInstance.on("user_left", onUserLeft);

        Object.entries(handlersRef.current).forEach(([event, handler]) => {
          socketInstance.on(event, handler);
        });

        socketInstance.emit("join_session", sessionCode, (res) => {
          setJoining(false);
          if (res?.success) {
            setJoinError(null);
            initializedSession.current = sessionCode;

            socketInstance.emit(
              "get_session_data", sessionCode,
              (dataRes) => {
                if (dataRes?.success) {
                  console.log("Session data received:", dataRes.data);
                  setSessionData(dataRes.data);
                } else {
                  console.warn("Failed to get session data:", dataRes?.message);
                }
              }
            );
          } else {
            console.error(`[Session] Join failed:`, res?.message);
            setJoinError(res?.message || "Failed to join session");
          }
        });
      } catch (error) {
        console.error("[Socket] Init error:", error);
        setJoinError(error.message);
        setJoining(false);
      }
    };

    initSocket();

    return () => {
      cancelled = true;
      if (socketRef.current) {
        console.log(`[Session] Cleaning up: ${sessionCode}`);
        socketRef.current.emit("leave_session", sessionCode, (res) => {
          if (res?.success) console.log(`[Session] Left: ${sessionCode}`);
        });
        socketRef.current.removeAllListeners();
        socketRef.current = null;
        setConnected(false);
        initializedSession.current = null;
      }
    };
  }, [
    isAuthenticated,
    socketToken,
    sessionCode,
    guest,
    user,
    setConnected,
    setJoining,
    setJoinError,
    setSessionData,
    handleUserJoined,
    handleUserLeft,
  ]);

  return { socket: socketRef.current };
};

export const useQueueActions = () => {
  const {
    sessionCode,
    currentUser,
    setAddToQueueTrack,
    setQueue
  } = useLiveSessionStore();
  const socketRef = useRef(null);

    const addToQueueTrack = useLiveSessionStore((state) => state.addToQueueTrack);

  // Get socket instance
  useEffect(() => {
    const getSocketInstance = async () => {
      try {
        const socketInstance = await getSocket("/session");
        socketRef.current = socketInstance;

        if (!socketInstance) {
          console.warn("No socket instance available for queue actions");
          return { success: false, message: "No socket connection" };
        }

        const bindObject = {
          trackDetails: addToQueueTrack,
          sessionCode,
          user: currentUser,
        }

        socketInstance.emit("move_song_to_queue", bindObject, (data) => {
          if (data?.success) {
            setQueue(data.queue);
            setAddToQueueTrack(null);
          } else {
            return { success: false, message: data?.message || "Failed to add to queue" };
          }
        })
      } catch (err) {
        return { success: false, message: err.message };
      };
    };
    getSocketInstance();
  }, [addToQueueTrack]);

  const refreshSessionData = () => {
    if (!socketRef.current?.connected || !sessionCode) {
      console.warn("Cannot refresh: socket not connected or no session code");
      return Promise.reject(new Error("Not connected"));
    }

    return new Promise((resolve, reject) => {
      socketRef.current.emit(
        "get_session_data",
        sessionCode,
        (response) => {
          if (response?.success) {
            console.log("Session data refreshed");
            useLiveSessionStore.getState().setSessionData(response.data);
            resolve(response.data);
          } else {
            console.error("Refresh failed:", response?.message);
            reject(new Error(response?.message || "Failed to refresh"));
          }
        }
      );
    });
  };

  return { refreshSessionData };
};
