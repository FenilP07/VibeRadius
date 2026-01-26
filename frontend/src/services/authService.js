import apiClient from "../utils/apiClient.js";

const authApiPrefix = "/api/auth";

const authService = {
  login: async (credentials) => {
    return await apiClient.post(`${authApiPrefix}/login`, credentials);
  },

  register: async (userData) => {
    return await apiClient.post(`${authApiPrefix}/register`, userData);
  },

  logout: async () => {
    return await apiClient.post(`${authApiPrefix}/logout`);
  },

  verifyToken: async () => {
    return await apiClient.get(`${authApiPrefix}/verify-token`);
  },

  refreshToken: async () => {
    return await apiClient.post(`${authApiPrefix}/refresh-token`);
  },

  socketToken: async () => {
    return await apiClient.get(`${authApiPrefix}/socket-token`);
  },

  spotifyToken: async () => {
    return await apiClient.get("/api/spotify/status");
  },
};

export { authService };
