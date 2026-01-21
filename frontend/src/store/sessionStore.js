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
      const dashboard = response?.data?.data;

      set({
        activeSessions: dashboard?.activeSessions ?? [],
        pastSessions: dashboard?.pastSessions ?? [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || "Failed to load sessions",
        isLoading: false,
      });
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
