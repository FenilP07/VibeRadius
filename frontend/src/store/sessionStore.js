import { create } from "zustand";
import { sessionService } from "../services/sessionService";

const useSessionStore = create((set, get) => ({
  activeSessions: [],
  pastSessions: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionService.getDashboardData();
      // Using optional chaining and providing fallbacks to prevent crashes
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

  // NEW: Real-time update helpers
  // Use these when a socket event tells you a session status changed
  addActiveSession: (session) => 
    set((state) => ({ 
      activeSessions: [session, ...state.activeSessions] 
    })),

  removeActiveSession: (sessionId) =>
    set((state) => ({
      activeSessions: state.activeSessions.filter(s => s._id !== sessionId)
    })),

  moveActiveToPast: (sessionId) => {
    const sessionToMove = get().activeSessions.find(s => s._id === sessionId);
    if (sessionToMove) {
      set((state) => ({
        activeSessions: state.activeSessions.filter(s => s._id !== sessionId),
        pastSessions: [sessionToMove, ...state.pastSessions]
      }));
    }
  },

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