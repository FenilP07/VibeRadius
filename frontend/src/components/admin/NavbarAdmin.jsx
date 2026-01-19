// src/components/admin/NavbarAdmin.jsx
import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Music } from "lucide-react"; // Matching our icon set

export const NavbarAdmin = ({ title = "VibeRadius" }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Get initials for the avatar if name exists
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A';

  return (
    <nav className="fixed top-0 left-0 right-0 z-[50] bg-white/50 backdrop-blur-xl border-b border-[#5C4033]/5 h-20 flex items-center px-6 lg:px-16">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group transition-transform active:scale-95">
          <div className="w-10 h-10 bg-[#E07A3D] rounded-xl flex items-center justify-center shadow-lg shadow-[#E07A3D]/20 group-hover:rotate-6 transition-transform">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-[#5C4033] leading-none tracking-tighter">
              Vibe<span className="text-[#E07A3D]">Radius</span>
            </span>
            <span className="text-[10px] font-bold text-[#5C4033]/40 uppercase tracking-[0.2em]">Dashboard</span>
          </div>
        </Link>

        {/* Admin Actions */}
        <div className="flex items-center gap-4">
          
          {/* Enhanced User Badge */}
          <div className="hidden sm:flex items-center gap-3 bg-white/80 border border-[#5C4033]/5 pl-2 pr-4 py-1.5 rounded-2xl shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-[#E07A3D]/20 to-[#5C4033]/10 rounded-xl flex items-center justify-center text-[#E07A3D] font-bold text-xs border border-[#E07A3D]/10">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#5C4033] leading-none">
                {user?.name || "Admin"}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Host Mode</span>
              </div>
            </div>
          </div>

          <div className="w-px h-8 bg-[#5C4033]/10 mx-2 hidden sm:block" />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#5C4033]/60 hover:text-[#C93B3B] hover:bg-red-50 rounded-xl transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};