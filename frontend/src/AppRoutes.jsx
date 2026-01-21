import { Route, Routes } from "react-router-dom";
import StyleGuide from "../StyleGuide";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import SpotifySearch from "./components/SpotifySearch";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import HomePage from "./pages/homePage.jsx";
import SpotifyPlayer from "./pages/SpotifyPlayer.jsx";
import SessionPage from "./pages/SessionPage.jsx"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}></Route>
      <Route path="/search" element={<SpotifySearch />}></Route>
      <Route path="/session" element={<SessionPage />}></Route>
      {/* For Style Guide */}
      <Route path="/styleguide" element={<StyleGuide />} />

      {/* For Admin Dashboard */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* For Authentication */}
      <Route path='/auth/login' element={<Login />}></Route>
      <Route path='/auth/register' element={<Register />}></Route>
      <Route path='/' element={<SpotifyPlayer />}></Route> {/* To be removed later */}

    </Routes>
  )

}