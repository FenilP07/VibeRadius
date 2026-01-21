import { create } from "zustand";
import { authService } from "../services/authService.js";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitializing: false,

  // Setters
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Register
  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.register(userData);
      const { user } = response.data.data;
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  // Login
  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(credentials);
      const { user } = response.data.data;
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      set({ error: message, isLoading: false, isAuthenticated: false });
      return { success: false, error: message };
    }
  },

  // Logout
  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  // Verify Token SAFELY
  verifyToken: async () => {
    const state = get();
    if (state.isInitializing || state.isLoading) return state.isAuthenticated;

    try {
      set({ isInitializing: true, isLoading: true, error: null });
      // Call backend to get current user via cookies
      const response = await authService.verifyToken(); // or getCurrentUser()
      const { user } = response.data.data;

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false,
      });
      return true;
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
      });
      return false;
    }
  },
  // Update user locally
  updateUser: (userData) =>
    set((state) => ({ user: { ...state.user, ...userData } })),
}));

export default useAuthStore;
