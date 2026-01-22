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

  // 1. Initial verification on mount
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  // 2. Optimized Silent Refresh Timer
  useEffect(() => {
    // Only start the timer if the user is actually logged in
    if (!isAuthenticated) return;

    const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes

    const performRefresh = async () => {
      console.log('[Auth] Periodic token refresh initiated...');
      try {
        await authService.refreshToken();
        console.log('[Auth] Token refreshed ✓');
      } catch (error) {
        console.error('[Auth] Periodic refresh failed, session expired.');
        await logout();
      }
    };

    const intervalId = setInterval(performRefresh, REFRESH_INTERVAL);

    // Cleanup function: clears the timer if the component unmounts 
    // or if the user logs out (isAuthenticated changes)
    return () => clearInterval(intervalId);
  }, [isAuthenticated, logout]);

  // 3. Early return for the "Gating" mechanism
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking your session...</p>
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

// Render logic
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
}