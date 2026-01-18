import { Route, Routes, Navigate } from 'react-router-dom'
import StyleGuide from '../StyleGuide'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import SpotifySearch from './components/SpotifySearch'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'


export default function AppRoutes() {
    return (
        <Routes>

            {/* For Home */}
            <Route path='/' element={<SpotifySearch/>}></Route>

            {/* For Style Guide */}
            <Route path='/styleguide' element={<StyleGuide />} />

            {/* For Admin Dashboard */}
            <Route path='/admin/dashboard' element={<AdminDashboard />} />

            {/* Public routes - anyone can access */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Catch-all - 404 */}
            <Route path="*" element={<div>404 - Page not found</div>} />

        </Routes>
    )
}

