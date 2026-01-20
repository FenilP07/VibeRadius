import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const authApiPrefix = "/api/auth";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

// Add response interceptor for handling 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized request, token expired or missing.");
      // only redirect if not already on /login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
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

  getCurrentUser: async (userId) => {
    return await apiClient.get(`${authApiPrefix}/me`);
  },

  forgotPassword: async (email) => {
    return await apiClient.post(`${authApiPrefix}/forgot-password`, { email });
  },

  resetPassword: async (token, password) => {
    return await apiClient.post(`${authApiPrefix}/reset-password/`, {
      token,
      password,
    });
  },
};

export default apiClient;
