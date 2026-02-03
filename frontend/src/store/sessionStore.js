import { create } from "zustand";
import { sessionService } from "../services/sessionService.js";

const useSessionStore = create((set) => ({
  activeSessions: [],
  activeSessionCode: null,
  pastSessions: [],

  dashboardLoading: false,
  createLoading: false,
  error: null,

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
    }),
}));

export default useSessionStore;
