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

// Helper to clear the queue
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

    // 1. Only intercept 401s that aren't on the "exclude" list
    if (error.response?.status !== 401) return Promise.reject(error);

    const skipUrls = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/refresh-token",
      "/api/auth/logout",
    ];

    if (skipUrls.some((url) => originalRequest.url.includes(url))) {
      return Promise.reject(error);
    }

    // 2. If a refresh is already happening, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiClient(originalRequest)) // Retry with the same instance
        .catch((err) => Promise.reject(err));
    }

    // 3. Mark request as retry to avoid infinite loops
    if (!originalRequest._retry) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("[API] Attempting silent token refresh...");
        await apiClient.post("/api/auth/refresh-token");
        
        processQueue(null); // Resolve everything in the queue
        return apiClient(originalRequest); // Retry the original request
      } catch (refreshError) {
        processQueue(refreshError, null); // Reject everyone in the queue
        
        // Handle global logout state
        const authStore = useAuthStore.getState();
        await authStore.logout();

        // Optional: Only redirect if you aren't already on an auth page
        if (!window.location.pathname.startsWith("/auth/")) {
            // Using replace prevents the user from clicking "back" into a dead session
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