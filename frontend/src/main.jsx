import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import useAuthStore from "./store/authStore";
import { authService } from "./services/authService";
import "./index.css";

function Root() {
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const verifyToken = useAuthStore((state) => state.verifyToken);
  const logout = useAuthStore((state) => state.logout);

  // Check auth on initial load
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // Silent refresh timer - runs every 14 minutes
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      console.log('[Auth] Refreshing token...');
      try {
        await authService.refreshToken();
        console.log('[Auth] Token refreshed ✓');
      } catch (error) {
        console.error('[Auth] Refresh failed, logging out');
        await logout();
      }
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);