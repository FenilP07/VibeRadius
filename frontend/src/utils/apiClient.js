import axios from "axios";
import useAuthStore from "../store/authStore.js";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) return Promise.reject(error);

    // Skip certain URLs
    const skipUrls = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/refresh-token",
      "/api/auth/logout",
      "/api/auth/verify-token",
    ];

    if (skipUrls.some((url) => originalRequest.url.includes(url))) {
      return Promise.reject(error);
    }

    // Queue requests if refresh is happening
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    if (!originalRequest._retry) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("[API] Attempting silent token refresh...");
        await apiClient.post(
          "/api/auth/refresh-token",
          {},
          { skipAuthRefresh: true }
        );

        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        const authStore = useAuthStore.getState();
        await authStore.logout();

        if (!window.location.pathname.startsWith("/auth/")) {
          window.location.replace("/auth/login");
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
