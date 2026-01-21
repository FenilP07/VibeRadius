import { FaSpotify, FaStore, FaUser, FaSignOutAlt, FaUsers, FaMusic, FaExternalLinkAlt } from "react-icons/fa";
import { NavbarAdmin } from "../../components/admin/NavbarAdmin";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

export const HostProfile = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const spotifyConnected = useAuthStore((s) => s.spotifyConnected);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FDF8F4] text-[#5C4033]">
      {/* 1. Ensure Navbar is rendered */}
      <NavbarAdmin />

      {/* 2. Added pt-24 (Padding Top) to push content below the fixed navbar */}
      <main className="pt-28 pb-12 px-6 lg:px-12 max-w-4xl mx-auto animate-in fade-in duration-700">
        
        {/* Profile Header Card */}
        <div className="flex items-center gap-6 mb-10 bg-white/40 p-8 rounded-[2.5rem] border border-white/60 backdrop-blur-md shadow-sm">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center text-[#E07A3D] text-3xl border border-[#E07A3D]/10">
              <FaUser />
            </div>
            {spotifyConnected && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-50">
                <FaSpotify className="text-[#1DB954] text-lg" />
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E07A3D] mb-1">Host Identity</p>
            <h1 className="text-3xl font-black text-[#5C4033] tracking-tight leading-none">
              {user?.name || "Host Profile"}
            </h1>
            <p className="text-sm opacity-50 mt-2 font-medium">{user?.email}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="bg-white/70 border border-white p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#5C4033]/5 flex items-center justify-center text-[#5C4033]/40">
                <FaStore size={20} />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C4033]/40 mb-0.5">Venue Username</p>
                <p className="font-bold text-[#5C4033] text-lg">{user?.username || "Not Set"}</p>
            </div>
          </div>

          <div className="bg-white/70 border border-white p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E07A3D]/5 flex items-center justify-center text-[#E07A3D]">
                <FaUsers size={20} />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#E07A3D]/50 mb-0.5">Current Status</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="font-bold text-[#E07A3D] italic text-lg">Ready to Launch</p>
                </div>
            </div>
          </div>
        </div>

        {/* Connectivity Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-[#5C4033]/5 border border-white">
          <h2 className="text-xs font-black uppercase tracking-[0.25em] mb-8 text-[#5C4033]/30">
            Management & Connectivity
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-between bg-[#FDF8F4]/80 p-6 rounded-[2rem] border border-white mb-10 gap-4">
            <div className="flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${spotifyConnected ? 'bg-[#1DB954]/10 text-[#1DB954]' : 'bg-gray-200 text-gray-400'}`}>
                <FaSpotify size={28} />
              </div>
              <div className="text-left">
                <h3 className="font-black text-lg">Spotify Player SDK</h3>
                <p className="text-xs opacity-60 font-medium">
                    {spotifyConnected ? "Connected to Spotify" : "Connection required for playback"}
                </p>
              </div>
            </div>
            <button className="w-full md:w-auto bg-[#E07A3D] hover:bg-[#C4612A] text-white px-10 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95">
              {spotifyConnected ? "Reconnect" : "Connect"}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
                onClick={() => navigate("/admin/dashboard")} 
                className="flex-1 bg-[#5C4033] text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-[#453026] transition-all shadow-lg active:scale-[0.98]"
            >
              <FaMusic size={14} /> Back to Dashboard
            </button>
            <button 
                onClick={handleLogout} 
                className="flex-1 bg-white border-2 border-[#5C4033]/5 text-[#5C4033] py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:text-[#E07A3D] hover:border-[#E07A3D]/20 transition-all active:scale-[0.98]"
            >
              <FaSignOutAlt size={14} /> Sign Out
            </button>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
            <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-[#5C4033]/30 hover:text-[#E07A3D] transition-colors flex items-center gap-2">
                VibeRadius Business Support <FaExternalLinkAlt size={8} />
            </a>
        </div>
      </main>
    </div>
  );
};