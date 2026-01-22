import { create } from "zustand";
import { authService } from "../services/authService.js";
import useSessionStore from "./sessionStore.js";
import { disconnectSocket } from "../utils/socketManager.js";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true, // Start as true so the loader shows immediately
  error: null,
  spotifyConnected: localStorage.getItem("spotifyConnected") === "true",
  socketToken: null,
  isFetchingSocketToken: false, // Prevents race conditions

  fetchSocketToken: async () => {
    // If we already have a token or are currently fetching one, skip
    if (get().isFetchingSocketToken) return;

    set({ isFetchingSocketToken: true });
    try {
      const response = await authService.socketToken();
      const { socketToken } = response.data.data;
      set({ socketToken, isFetchingSocketToken: false });
      return socketToken;
    } catch (error) {
      console.error("Error fetching socket token:", error);
      set({ socketToken: null, isFetchingSocketToken: false });
      return null;
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setSpotifyConnected: (value) => {
    set({ spotifyConnected: value });
    localStorage.setItem("spotifyConnected", value ? "true" : "false");
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(userData);
      const { user } = response.data.data;
      
      set({ user, isAuthenticated: true, isLoading: false });
      await get().fetchSocketToken();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      const { user } = response.data.data;

      set({ user, isAuthenticated: true, isLoading: false });
      await get().fetchSocketToken();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn("Server logout failed. Clearing client state anyway.");
    } finally {
      // Clear EVERYTHING
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
        socketToken: null,
        isInitializing: false
      });

      localStorage.removeItem("spotifyConnected");
      disconnectSocket("/session");
      useSessionStore.getState().reset();
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

      await get().fetchSocketToken();
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

  updateUser: (userData) =>
    set((state) => ({ user: { ...state.user, ...userData } })),

  clearError: () => set({ error: null }),
}));

export default useAuthStore;