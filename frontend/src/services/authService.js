import apiClient from "../utils/apiClient.js";

const authApiPrefix = "/api/auth";

const authService = {
  login: async (Credentials) => {
    return await apiClient.post(`${authApiPrefix}/login`, Credentials);
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

  // refreshToken: async () => {
  //   return await apiClient.get(`${authApiPrefix}/refresh-token`);
  // },

  // getCurrentUser: async (userId) => {
  //   return await apiClient.get(`${authApiPrefix}/me`);
  // },

  // forgotPassword: async (email) => {
  //   return await apiClient.post(`${authApiPrefix}/forgot-password`, { email });
  // },

  // resetPassword: async (token, password) => {
  //   return await apiClient.post(`${authApiPrefix}/reset-password/`, {
  //     token,
  //     password,
  //   });
  // },
};

export { authService };