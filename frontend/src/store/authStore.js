import { create } from "zustand";
import { authService } from "../services/authService.js";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitializing: true,

  // ---------------------
  // Setters
  // ---------------------
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // ---------------------
  // Register
  // ---------------------
  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.register(userData);
      const { user } = response.data.data;

      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      set({ error: message, isLoading: false, isAuthenticated: false });
      return { success: false, error: message };
    }
  },

  // ---------------------
  // Login
  // ---------------------
  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(credentials);
      const { user } = response.data.data;

      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      set({ error: message, isLoading: false, isAuthenticated: false });
      return { success: false, error: message };
    }
  },

  // ---------------------
  // Logout
  // ---------------------
  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
     console .warn("Server logout failed. Clearing client state anyway.");
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
        error: null,
      });
    }
  },

  // ---------------------
  // Verify token (silent or not)
  // ---------------------
  verifyToken: async ({ silent = false } = {}) => {
    if (!silent) set({ isLoading: true, error: null });

    try {
      const response = await authService.verifyToken();
      const { user } = response.data.data;

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false,
      });
      return { success: true, user };
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
      });
      return { success: false };
    }
  },

  // ---------------------
  // Update user locally
  // ---------------------
  updateUser: (userData) =>
    set((state) => ({ user: { ...state.user, ...userData } })),
}));

export default useAuthStore;
