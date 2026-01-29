import { Route, Routes, Navigate } from "react-router-dom";
import StyleGuide from "../StyleGuide";
import { AdminDashboard } from "./pages/admin/AdminDashboard.jsx";
import SpotifySearch from "./components/SpotifySearch";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import HomePage from "./pages/HomePage.jsx";
import SessionPage from "./pages/SessionPage.jsx";
import { HostProfile } from "./pages/admin/HostProfile.jsx";
import useAuthStore from "./store/authStore.js";
import CustomerView from "./pages/CustomerView.jsx";
import SpotifyPlayer from "./pages/SpotifyPlayer.jsx"
import TestSessionPage from "./pages/test_session.jsx";

const ProtectedRoute = ({ children, allowGuest = false }) => {
  const { isAuthenticated, isInitializing, guest } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (allowGuest && (isAuthenticated || guest)) {
    return children;
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

      <Route
        path="/session"
        element={
          <ProtectedRoute allowGuest={true}>
            <SessionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/session/:sessionCode"
        element={
          <ProtectedRoute allowGuest={true}>
            <SessionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer"
        element={
          <ProtectedRoute allowGuest={true}>
            <CustomerView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customer/:sessionCode"
        element={
          <ProtectedRoute allowGuest={true}>
            <CustomerView />
          </ProtectedRoute>
        }
      />

      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />

      <Route
        path="/session-test"
        element={<TestSessionPage testSessionCode="URWOBR" />}
      />

      <Route
        path="/session-test"
        element={<TestSessionPage testSessionCode="URWOBR" />}
      />

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
