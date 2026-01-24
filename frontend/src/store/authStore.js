import { create } from "zustand";
import { authService } from "../services/authService.js";
import useSessionStore from "./sessionStore.js";
import { disconnectAllSockets } from "../utils/socketManager.js";

// const hasCookie = () => document.cookie.includes("refreshToken");

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,
  spotifyConnected: localStorage.getItem("spotifyConnected") === "true",
  socketToken: null,
  activeTokenPromise: null,
  guest: false,

  fetchSocketToken: async () => {
    const state = get();

    if (!state.isAuthenticated) return null;

    if (state.socketToken) return state.socketToken;

    if (state.activeTokenPromise) return state.activeTokenPromise;

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

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false,
        guest: false,
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

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false,
        guest: false,
      });

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
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
        socketToken: null,
        isInitializing: false,
        activeTokenPromise: null,
        guest: false,
      });

      localStorage.removeItem("spotifyConnected");

      disconnectAllSockets();

      useSessionStore.getState().reset();
    }
  },

  verifyToken: async ({ silent = false } = {}) => {
    // if (!hasCookie()) {
    //   set({
    //     user: null,
    //     isAuthenticated: false,
    //     isInitializing: false,
    //     isLoading: false,
    //     socketToken: null,
    //     activeTokenPromise: null,
    //     guest: true,
    //   });
    //   return { success: false, guest: true };
    // }

    if (!silent) set({ isLoading: true, error: null });

    try {
      const response = await authService.verifyToken();
      const { user } = response.data.data;

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false,
        guest: false,
      });

      await get().fetchSocketToken();
      return { success: true, user };
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
        socketToken: null,
        activeTokenPromise: null,
        guest: true,
      });
      return { success: false };
    }
  },

  updateUser: (userData) =>
    set((state) => ({ user: { ...state.user, ...userData } })),

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
