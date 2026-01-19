import { Route, Routes } from "react-router-dom";
import StyleGuide from "../StyleGuide";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import SpotifySearch from "./components/SpotifySearch";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import HomePage from "./pages/homePage.jsx";
import SpotifyPlayer from "./pages/SpotifyPlayer.jsx";

export default function AppRoutes() {
  return (
    <Routes>
<<<<<<< HEAD
      {/* <Route path="/" element={<HomePage />}></Route> */}
=======
      <Route path="/" element={<HomePage />}></Route>
      <Route path="/search" element={<SpotifySearch />}></Route>
>>>>>>> 13d0ae7 (added some mockups for frontend from gemini)

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