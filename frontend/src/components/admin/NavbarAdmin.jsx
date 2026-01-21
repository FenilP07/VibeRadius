// src/components/admin/NavbarAdmin.jsx

import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

export const NavbarAdmin = ({ title = "VibeRadius" }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  console.log(user)

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  return (
    <nav className="bg-surface/70 backdrop-blur-lg border-b border-primary-subtle h-16 flex items-center px-8 lg:px-16 xl:px-24">
      {/* Same max-width as main content */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
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
              {user?.name}
            </span>
          </div>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            className="text-text-secondary hover:text-primary text-sm font-medium transition-colors"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};
