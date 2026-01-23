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

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing } = useAuthStore();

  return isAuthenticated ? children : <Navigate to="/auth/login" />;
};

export default function AppRoutes() {
  return (
    
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/session" element={<SessionPage />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/styleguide" element={<StyleGuide />} />
      <Route path="/session/:sessionCode" element={<SessionPage />} />

      {/* Protected Admin/Host Routes */}
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
    </Routes>
  );
}
