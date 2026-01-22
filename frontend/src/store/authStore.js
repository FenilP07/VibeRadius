import { create } from "zustand";
import { authService } from "../services/authService.js";
import useSessionStore from "./sessionStore.js";
import { disconnectSocket } from "../utils/socketManager.js";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
  spotifyConnected: localStorage.getItem("spotifyConnected") === "true",
  socketToken: null,
  activeTokenPromise: null, // Tracks in-flight token requests to prevent loops

  /**
   * Fetches the specialized token for Socket.io authentication.
   * Uses promise-tracking to prevent race conditions during page loads.
   */
  fetchSocketToken: async () => {
    const state = get();

    // If we already have a token, return it immediately
    if (state.socketToken) return state.socketToken;

    // If a request is already in progress, return that specific promise
    if (state.activeTokenPromise) return state.activeTokenPromise;

    // Create a new request promise
    const tokenPromise = (async () => {
      try {
        const response = await authService.socketToken();
        const socketToken = response.data.data.socketToken;

        if (!socketToken) {
          throw new Error("Token missing in API response");
        }

        set({ socketToken, activeTokenPromise: null });
        return socketToken;
      } catch (error) {
        console.error("Error fetching socket token:", error);
        set({ socketToken: null, activeTokenPromise: null });
        return null;
      }
    })();

    // Store the promise so other callers (like the Socket Manager) can await it
    set({ activeTokenPromise: tokenPromise });
    return tokenPromise;
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

      +set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false,
      });
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

      +set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false,
      });
      await get().fetchSocketToken(); // Auto-fetch token after login
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
      // Clear ALL authentication and socket state
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
        socketToken: null,
        isInitializing: false,
        activeTokenPromise: null,
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

      await get().fetchSocketToken(); // Ensure socket token is ready after verification
      return { success: true, user };
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
        socketToken: null,
        activeTokenPromise: null,
      });
      return { success: false };
    }
  },

  updateUser: (userData) =>
    set((state) => ({ user: { ...state.user, ...userData } })),

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
