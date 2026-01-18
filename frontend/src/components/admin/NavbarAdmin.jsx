// src/components/admin/NavbarAdmin.jsx

import { Link } from "react-router-dom";

export const NavbarAdmin = ({ title = "VibeRadius", userName = "Kapi Coffee" }) => {
  return (
    <nav className="bg-surface/70 backdrop-blur-lg  flex items-center justify-between px-8 h-16">
      
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold tracking-tight">
        <span className="text-accent-dark">Vibe</span>
        <span className="text-primary">Radius</span>
      </Link>

      {/* Admin Actions */}
      <div className="flex items-center gap-6">
        
        {/* User Badge */}
        <div className="flex items-center gap-3 bg-primary-subtle px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-accent font-medium text-sm">
            {userName}
          </span>
        </div>

        {/* Logout */}
        <Link
          to="/logout"
          className="text-text-secondary hover:text-primary text-sm font-medium transition-colors"
        >
          Logout
        </Link>
      </div>

    </nav>
  );
};