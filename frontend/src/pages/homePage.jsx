import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaHistory,
  FaMusic,
  FaChevronRight,
  FaDotCircle,
  FaSpotify,
  FaBolt,
  FaListUl,
  FaShieldAlt,
  FaChartLine,
} from "react-icons/fa";
import { NavbarAdmin } from "../components/admin/NavbarAdmin";
import CreateSessionModal from "../modals/SessionModal";
import useSessionStore from "../store/sessionStore";
import { useNavigate } from "react-router-dom";

// -----------------------
// Helper: format date + time
// -----------------------
const formatDateTime = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleString("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
const navigate = useNavigate();
  const {
    activeSessions,
    pastSessions,
    isLoading,
    error,
    fetchDashboardData,
    clearError,
  } = useSessionStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStartNewSession = (formData) => {
    console.log("Starting session with data:", formData);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FEF3EB] text-[#5C4033] relative overflow-x-hidden">
      {/* Background Visuals */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E07A3D]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#5C4033]/5 rounded-full blur-[120px]" />
      </div>

      <NavbarAdmin />

      <main className="relative z-10 max-w-7xl mx-auto pt-28 pb-12 px-6 lg:px-16">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-[#5C4033]">
              Host Dashboard
            </h1>
            <p className="text-[#5C4033]/60 font-medium mt-1">
              Manage your venue's live music sessions.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#E07A3D] hover:bg-[#C4612A] text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-[#E07A3D]/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            <FaPlus /> Create New Session
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main List Area */}
          <div className="lg:col-span-2 space-y-10">
            {/* Live Now Section */}
            <section className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#E07A3D] mb-6 flex items-center gap-2">
                <FaDotCircle className="animate-pulse" />
                Live Now
              </h2>

              {isLoading && activeSessions.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-[#5C4033]/10 rounded-[2.5rem] text-center bg-white/30">
                  <p className="text-[#5C4033]/40 font-bold">
                    Loading sessions...
                  </p>
                </div>
              ) : activeSessions.length > 0 ? (
                activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white/70 backdrop-blur-md border border-white p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-[#5C4033]/5 transition-all group"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-[#FEF3EB] rounded-2xl flex items-center justify-center text-[#E07A3D] shadow-inner">
                          <FaMusic size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#5C4033] group-hover:text-[#E07A3D] transition-colors">
                            {session.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm font-medium text-[#5C4033]/50">
                            <span>{session.songs} in queue</span>
                            <span className="opacity-30">•</span>
                            <span>{session.listeners} active listeners</span>
                          </div>
                        </div>
                      </div>
                      <button className="bg-[#5C4033] hover:bg-[#3d2b22] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ml-auto md:ml-0 shadow-lg shadow-[#5C4033]/10"
                      onClick={()=>{
                        navigate("/session")
                      }}>
                        Open Dashboard <FaChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 border-2 border-dashed border-[#5C4033]/10 rounded-[2.5rem] text-center bg-white/30">
                  <p className="text-[#5C4033]/40 font-bold">
                    No active sessions. Start one to get the music moving!
                  </p>
                </div>
              )}
            </section>

            {/* Recent History Area */}
            <section className="animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#5C4033]/40 mb-6">
                Recent History
              </h2>
              <div className="bg-white/40 border border-white/50 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                {pastSessions.map((session, index) => (
                  <div
                    key={session.id}
                    className={`p-6 flex items-center justify-between hover:bg-white/60 transition-colors cursor-pointer ${
                      index !== pastSessions.length - 1
                        ? "border-b border-[#5C4033]/5"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#5C4033]/5 flex items-center justify-center text-[#5C4033]/30">
                        <FaHistory />
                      </div>
                      <div>
                        <p className="font-bold text-[#5C4033]">
                          {session.name}
                        </p>
                        <p className="text-[10px] font-black text-[#5C4033]/30 uppercase tracking-widest">
                          Ended • {formatDateTime(session.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#5C4033]/80">
                        {session.totalSongs} songs played
                      </p>
                      <button className="text-[#E07A3D] text-[10px] font-black uppercase tracking-widest hover:underline mt-1">
                        View Analytics
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <aside className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
            {/* Host Tip Card */}
            <div className="bg-[#3d2b22] text-white p-8 rounded-[2.5rem] shadow-2xl shadow-[#3d2b22]/20 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <FaBolt className="text-[#E07A3D]" /> Host Tip
                </h3>
                <p className="text-white/60 text-sm leading-relaxed mb-8 font-medium">
                  Keep your "Auto-accept" on during peak hours to focus on your
                  customers while the music flows.
                </p>
                <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/10">
                  <FaSpotify className="text-[#1DB954]" /> Spotify Connected
                </div>
              </div>
              <FaMusic
                size={120}
                className="absolute -bottom-4 -right-4 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700"
              />
            </div>

            {/* Quick Management Card */}
            <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5C4033]/40 mb-6">
                Quick Management
              </h4>
              <nav className="space-y-1">
                {[
                  { label: "Manage Playlists", icon: <FaListUl /> },
                  { label: "Blacklisted Songs", icon: <FaShieldAlt /> },
                  { label: "Export Reports", icon: <FaChartLine /> },
                ].map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-[#E07A3D]/5 text-[#5C4033] font-bold text-sm transition-all group"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-[#5C4033]/20 group-hover:text-[#E07A3D] transition-colors">
                        {item.icon}
                      </span>
                      {item.label}
                    </span>
                    <FaChevronRight className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-[#E07A3D] text-[10px] transition-all" />
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </main>

      <CreateSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleStartNewSession}
      />
    </div>
  );
}
