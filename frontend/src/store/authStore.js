import { create } from "zustand";
import { authService } from "../services/authService.js";
import useSessionStore from "./sessionStore.js";
import { disconnectSocket } from "../utils/socketManager.js";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitializing: false,
  spotifyConnected: localStorage.getItem("spotifyConnected") === "true",

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setSpotifyConnected: (value) => {
    set({
      spotifyConnected: value,
    });
    localStorage.setItem("spotifyConnected", value ? "true" : false);
  },

  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.register(userData);
      const { user, accessTokens } = response.data.data;

      localStorage.setItem("accessToken", accessTokens);

      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      set({ error: message, isLoading: false, isAuthenticated: false });
      return { success: false, error: message };
    }
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login(credentials);
      const { user, accessTokens } = response.data.data;

      localStorage.setItem("accessToken", accessTokens);

      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      set({ error: message, isLoading: false, isAuthenticated: false });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn("Server logout failed. Clearing client state anyway.");
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("spotifyConnected");
      disconnectSocket("/session");
      const sessionStore = useSessionStore.getState();
      sessionStore.reset();
    }
  },

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
      localStorage.removeItem("accessToken");
     return { success: false };
    }
  },

  updateUser: (userData) =>
    set((state) => ({ user: { ...state.user, ...userData } })),
}));

export default useAuthStore;
