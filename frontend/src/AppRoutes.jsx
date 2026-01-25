import { Route, Routes, Navigate } from "react-router-dom";
import StyleGuide from "../StyleGuide";
import { AdminDashboard } from "./pages/admin/AdminDashboard.jsx";
import SpotifySearch from "./components/SpotifySearch";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import HomePage from "./pages/homePage.jsx";
import SessionPage from "./pages/SessionPage.jsx";
import { HostProfile } from "./pages/admin/HostProfile.jsx";
import useAuthStore from "./store/authStore.js";
import CustomerView from "./pages/CustomerView.jsx";
import SpotifyPlayer from "./pages/SpotifyPlayer.jsx"

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth/login" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route path="/session" element={<SessionPage />} />
      <Route path="/session/:sessionCode" element={<SessionPage />} />

      <Route path="/customer" element={<CustomerView />} />
      <Route path="/customer/:sessionCode" element={<CustomerView />} />

      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hostprofile"
        element={
          <ProtectedRoute>
            <HostProfile />
          </ProtectedRoute>
        }
      />

      <Route path="/search" element={<SpotifySearch />} />
      <Route path="/styleguide" element={<StyleGuide />} />
      <Route path="/spotifyplayer" element={<SpotifyPlayer />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
