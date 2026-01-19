import { Route, Routes } from 'react-router-dom'
import StyleGuide from '../StyleGuide'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import SpotifySearch from './components/SpotifySearch'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'


export default function AppRoutes() {
    return(
        <Routes>

            {/* For Home
            <Route path='/' element={<SpotifySearch/>}></Route> */}

            {/* For Style Guide */}
            <Route path='/styleguide' element={<StyleGuide/>} />

            {/* For Admin Dashboard */}
            <Route path='/' element={<AdminDashboard/>} />

            {/* For Authentication */}
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/register' element={<Register/>}></Route>

        </Routes>
    )
}

