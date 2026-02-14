import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaMusic,
  FaChevronUp,
  FaChevronDown,
  FaPlus,
  FaCircle,
  FaBolt,
  FaTimes,
} from "react-icons/fa";
import useLiveSessionStore from "../store/liveSessionStore.js";
import useSessionStore from "../store/sessionStore.js";
import QueueModal from "../modals/QueueModal.jsx";
import { useSessionSocket, useQueueActions } from "../socket/session.socket.js";
import useAuthStore from "../store/authStore.js";
import { getSocket } from "../utils/socketManager.js";
import { disconnectSocket } from "../utils/socketManager.js";
export default function CustomerView() {
  const { sessionCode: urlSessionCode } = useParams();
  const navigate = useNavigate();

  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const { activeSessionCode, setActiveSessionCode, clearError } =
    useSessionStore();

  const sessionInitialized = useRef(false);

  const {
    currentSession,
    sessionCode,
    isConnected,
    currentTrack,
    queue,
    sessionStatus,
    setSessionCode,
    reset,
  } = useLiveSessionStore();

  useEffect(() => {
    if (
      urlSessionCode &&
      urlSessionCode !== sessionCode &&
      !sessionInitialized.current
    ) {
      console.log(`📍 Setting session code from URL: ${urlSessionCode}`);
      setSessionCode(urlSessionCode);
      sessionInitialized.current = true;
    }
  }, [urlSessionCode, sessionCode]);

  const socketEventHandlers = useMemo(
    () => ({
      track_changed: (data) =>
        useLiveSessionStore.getState().setCurrentTrack(data.track),
      queue_updated: (data) =>
        useLiveSessionStore.getState().setQueue(data.queue),
      playback_state_changed: (data) =>
        useLiveSessionStore.getState().setIsPlaying(data.isPlaying),
    }),
    []
  );
  useSessionSocket(sessionCode, socketEventHandlers, { guest: true });
  useQueueActions();

  const displayQueue = queue.length ? queue : [];

  const handleLeaveSession = async () => {
    const socket = await getSocket("/session");

    if (socket?.connected) {
      socket.emit("leave_session", urlSessionCode || sessionCode);
    }
    disconnectSocket("/session");
    reset();
    setActiveSessionCode(null);
    sessionInitialized.current = false;
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F5F5F7] font-sans pb-44 relative overflow-hidden">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-white/5 z-[110]">
        <div className="h-full bg-[#E07A3D] w-2/3 shadow-[0_0_20px_#E07A3D]" />
      </div>

      {isQueueOpen && (
        <QueueModal
          isOpen={isQueueOpen}
          onClose={() => setIsQueueOpen(false)}
        />
      )}

      <main className="px-6 mt-10 space-y-12 relative z-10">
        <section className="bg-[#111113] p-8 rounded-[3rem] border border-white/5 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-[#E07A3D] uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <FaBolt /> Now Spinning
            </p>
            <h2 className="text-3xl font-black tracking-tight leading-none mb-2">
              {currentTrack?.name || "Waiting for playback"}
            </h2>
            <p className="text-lg text-gray-400 italic opacity-70">
              {" "}
              {currentTrack?.artists?.map((a) => a.name).join(", ") ||
                currentTrack?.artist ||
                "—"}
            </p>
          </div>
          <FaMusic className="absolute -right-6 -bottom-6 text-white/[0.02] text-9xl rotate-12" />
        </section>

        <div className="space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 px-2">
            Upcoming Tracks
          </h3>
          <div className="space-y-3">
            {queue.slice(0, 5).map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
          <button
            disabled
            onClick={() => setActiveDrawer("left")}
            className="w-full py-5 rounded-[2.5rem] bg-[#111113] border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-[#E07A3D]"
          >
            Full Queue ({queue.length})
          </button>
        </div>
      </main>

      {/* 5. SEARCH TRIGGER */}
      <div className="fixed bottom-10 left-0 right-0 px-8 z-[100]">
        <button
          onClick={handleLeaveSession}
          className="px-6 py-4 rounded-2xl font-bold flex items-center gap-3 bg-error/10 text-error border border-error/20 hover:bg-error hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <FaTimes /> Leave
        </button>
        <button
          onClick={() => setIsQueueOpen(true)}
          className="w-full bg-[#E07A3D] py-6 rounded-[2.5rem] flex items-center justify-center gap-4 shadow-[0_25px_50px_rgba(224,122,61,0.35)] active:scale-95 transition-all"
        >
          <FaPlus className="text-white" />
          <span className="font-black text-sm uppercase tracking-[0.2em] text-white">
            Add Song
          </span>
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0A0A0B] to-transparent pointer-events-none z-40" />
    </div>
  );
}

function SongCard({ song, onVote }) {
  return (
    <div
      className={`p-6 rounded-[2.5rem] border flex items-center gap-5 transition-all ${song.isPlaying ? "bg-[#1DB954]/10 border-[#1DB954]" : "bg-[#111113] border-white/5"}`}
    >
      <div className="w-16 h-16 bg-[#1A1A1C] rounded-2xl flex items-center justify-center text-[#E07A3D] relative">
        {song.albumImage ? (
          <img
            src={song.albumImage}
            alt={song.title}
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <FaMusic size={24} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-white truncate text-base">
          {song.title}
        </h4>
        <p className="text-[10px] text-gray-500 font-black uppercase">
          {song.artists.map((a) => a.name).join(",")}
        </p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => onVote(song.id, 1)}
          className="p-2 bg-[#1A1A1C] rounded-full text-gray-400 hover:text-white active:scale-90 transition"
        >
          <FaChevronUp />
        </button>
        <span className="text-sm font-black text-white">{song.votes}</span>
        <button
          onClick={() => onVote(song.id, -1)}
          className="p-2 bg-[#1A1A1C] rounded-full text-gray-400 hover:text-white active:scale-90 transition"
        >
          <FaChevronDown />
        </button>
      </div>
    </div>
  );
}
