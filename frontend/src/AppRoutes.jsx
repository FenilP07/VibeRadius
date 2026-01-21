import { Route, Routes } from "react-router-dom";
import StyleGuide from "../StyleGuide";
import { AdminDashboard } from "./pages/admin/AdminDashboard.jsx";
import SpotifySearch from "./components/SpotifySearch";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import HomePage from "./pages/homePage.jsx";
import SessionPage from "./pages/SessionPage.jsx"
import { HostProfile } from "./pages/admin/HostProfile.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}></Route>
      <Route path="/hostprofile" element={<HostProfile />}></Route>
      <Route path="/search" element={<SpotifySearch />}></Route>
      <Route path="/session" element={<SessionPage />}></Route>
      {/* For Style Guide */}
      <Route path="/styleguide" element={<StyleGuide />} />

      {/* For Admin Dashboard */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* For Authentication */}
      <Route path="/login" element={<Login />}></Route>
      <Route path="/register" element={<Register />}></Route>
    </Routes>
  );
}
