

import { Route, Routes } from 'react-router-dom'
import StyleGuide from '../StyleGuide'
import { AdminDashboard } from './pages/admin/AdminDashboard'


export default function AppRoutes() {
    return(
        <Routes>

            {/* For Style Guide */}
            <Route path='/styleguide' element={<StyleGuide/>} />

            {/* For Admin Dashboard */}
            <Route path='/admin/dashboard' element={<AdminDashboard/>} />

        </Routes>
    )
}

