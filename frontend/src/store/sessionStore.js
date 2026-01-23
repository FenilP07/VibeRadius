import { create } from "zustand";
import { sessionService } from "../services/sessionService";

const useSessionStore = create((set) => ({
  activeSessions: [],
  pastSessions: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionService.getDashboardData();
      const dashboard = response?.data?.data;

      set({
        activeSessions: dashboard?.activeSessions ?? [],
        pastSessions: dashboard?.pastSessions ?? [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to load sessions",
        isLoading: false,
      });
    }
  },

  addActiveSession: (session) =>
    set((state) => ({
      activeSessions: [session, ...state.activeSessions],
    })),

  removeActiveSession: (sessionId) =>
    set((state) => ({
      activeSessions: state.activeSessions.filter(
        (s) => (s._id || s.id)?.toString() !== sessionId?.toString()
      ),
    })),

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

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      activeSessions: [],
      pastSessions: [],
      isLoading: false,
      error: null,
    }),
}));

export default useSessionStore;