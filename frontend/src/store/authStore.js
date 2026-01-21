import { create } from "zustand";
import { authService } from "../services/authService.js";
// import { io } from "socket.io-client";

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitializing: false,
  socket: null,
  spotifyConnected: localStorage.getItem("spotifyConnected") === "true",

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  setSpotifyConnected: (value) => {
    set({
      spotifyConnected: value,
    });
    localStorage.setItem("spotifyConnectedd", value ? "true" : false);
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
      set({ error: message, isLoading: false });
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
      console.error("Logout failed:", err);
    } finally {
      set({ user: null, isAuthenticated: false, error: null });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("spotifyConnected");
      const socket = get().socket;
      if (socket) {
        socket.disconnect();
        set({ socket: null });
      }
    }
  },

  verifyToken: async () => {
    const state = get();
    if (state.isInitializing || state.isLoading) return state.isAuthenticated;

    try {
      set({ isInitializing: true, isLoading: true, error: null });
      const response = await authService.verifyToken();
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

  updateUser: (userData) =>
    set((state) => ({ user: { ...state.user, ...userData } })),

  connectToSession: (sessionCode) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("No access token found for socket connection");
      return null;
    }

    const socket = io("http://localhost:3000/session", {
      auth: { token: accessToken },
    });

    socket.on("connect", () => {
      console.log("Connected to session socket:", socket.id);
      socket.emit("join-session", { sessionCode });
    });

    socket.on("user-joined", (data) => {
      console.log("User joined session:", data);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    set({ socket });
    return socket;
  },
}));

export default useAuthStore;
