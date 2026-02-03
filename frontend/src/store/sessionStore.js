import { create } from "zustand";
import { sessionService } from "../services/sessionService.js";
import { getSocket, disconnectSocket } from "../utils/socketManager.js";

const useSessionStore = create((set, get) => ({
  activeSessions: [],
  activeSessionCode: null,
  pastSessions: [],

  dashboardLoading: false,
  createLoading: false,
  error: null,

  isWebSocketConnected: false,
  dashboardSocket: null,

  /* Fetch dashboard data */
  fetchDashboardData: async () => {
    set({ dashboardLoading: true, error: null });
    try {
      const response = await sessionService.getDashboardData();
      const dashboard = response?.data?.data;

      set({
        activeSessions: dashboard?.activeSessions ?? [],
        pastSessions: dashboard?.pastSessions ?? [],
        dashboardLoading: false,
      });

      return { success: true, response: dashboard };
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to load sessions",
        dashboardLoading: false,
      });
      return { success: false, response: error };
    }
  },

  initializeDashboardSocket: async () => {
    try {
      const socket = await getSocket("/dashboard");
      if (!socket) {
        console.error("[Dashboard] Failed to get socket instance");
        return;
      }
      set({ dashboardSocket: socket, isWebSocketConnected: true });

      const onConnect = () => {
        console.log("[Dashboard] WebSocket connected");
        set({ isWebSocketConnected: true });

        socket.emit("subscribe_dashboard", (response) => {
          if (response?.success) {
            console.log("[Dashboard] Successfully subscribed", response.data);
          }
        });
      };
      const onDisconnect = (reason) => {
        console.log("[Dashboard] WebSocket disconnected:", reason);
        set({ isWebSocketConnected: false });
      };

      const onUserJoined = (data) => {
        console.log("[Dashboard] User joined:", data);
        const { sessionCode, participantCount } = data;

        set((state) => {
          activeSessions: state.activeSessions.map((session) => {
            session.code === sessionCode
              ? { ...session, listeners: participantCount }
              : session;
          });
        });
      };

      const onUserLeft = (data) => {
        console.log("[Dashboard] User left:", data);
        const { sessionCode, participantCount } = data;

        set((state) => ({
          activeSessions: state.activeSessions.map((session) =>
            session.code === sessionCode
              ? { ...session, listeners: participantCount }
              : session
          ),
        }));
      };

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("user_joined", onUserJoined);
      socket.on("user_left", onUserLeft);

      if (socket.connected) {
        socket.emit("subscribe_dashboard", (response) => {
          if (response?.success) {
            console.log("[Dashboard] Successfully subscribed", response.data);
          }
        });
        set({ isWebSocketConnected: true });
      }

      console.log("[Dashboard] WebSocket listeners registered");
    } catch (error) {
      console.error("[Dashboard] Error initializing socket:", error);
      set({ error: "Failed to connect to live updates" });
    }
  },

  cleanupDashboardWebSocket: () => {
    const { dashboardSocket } = get();
    if (!dashboardSocket) {
      console.log("[Dashboard] No socket to cleanup");
      return;
    }
    console.log("[Dashboard] Cleaning up WebSocket");

    if (dashboardSocket.connected) {
      dashboardSocket.emit("unsubscribe_dashboard", (response) => {
        if (response?.success) {
          console.log("[Dashboard] Successfully unsubscribed");
        }
      });
    }
    dashboardSocket.off("connect");
    dashboardSocket.off("disconnect");
    dashboardSocket.off("user_joined");
    dashboardSocket.off("user_left");

    disconnectSocket("/dashboard");

    set({
      dashboardSocket: null,
      isWebSocketConnected: false,
    });
  },

  /* Create a new session */
  createSession: async (sessionDetails) => {
    set({ createLoading: true, error: null });
    try {
      console.log("Creating session with name:", sessionDetails.name);
      const response = await sessionService.createSession({
        sessionName: sessionDetails.name,
      });
      const newSession = response?.data?.data;

      console.log("Created session:", newSession);
      set({ createLoading: false });
      return { success: true, response: newSession };
    } catch (error) {
      console.error("Error creating session:", error);
      set({
        error: error.response?.data?.message || "Failed to create session",
        createLoading: false,
      });
    }
  },

  setActiveSessionCode: (code) => {
    try {
      set({ activeSessionCode: code });
    } catch (error) {
      set({ error: "Failed to set active session code" });
    }
  },

  /* Add a new active session */
  addActiveSession: (session) =>
    set((state) => ({
      activeSessions: [session, ...state.activeSessions],
    })),

  /* Remove an active session */
  removeActiveSession: (sessionId) =>
    set((state) => ({
      activeSessions: state.activeSessions.filter(
        (s) => (s._id || s.id)?.toString() !== sessionId?.toString()
      ),
    })),

  /* Move an active session to past sessions */
  moveActiveToPast: (sessionId) =>
    set((state) => {
      const sessionToMove = state.activeSessions.find(
        (s) => (s._id || s.id)?.toString() === sessionId?.toString()
      );

      if (!sessionToMove) return state;

      return {
        activeSessions: state.activeSessions.filter(
          (s) => (s._id || s.id)?.toString() !== sessionId?.toString()
        ),
        pastSessions: [sessionToMove, ...state.pastSessions],
      };
    }),

  /* Clear any error */
  clearError: () => set({ error: null }),

  /* Reset the store to initial state */
  reset: () =>
    set({
      activeSessions: [],
      activeSessionCode: null,
      pastSessions: [],
      dashboardLoading: false,
      createLoading: false,
      error: null,
      isWebSocketConnected: false,
      dashboardSocket: null,
    }),
}));

export default useSessionStore;
