import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaPlay,
  FaStepForward,
  FaMusic,
  FaQrcode,
  FaCircle,
  FaPlus,
  FaChevronUp,
  FaChevronDown,
  FaListUl,
  FaTimes,
  FaBell,
  FaTrashAlt,
  FaLock,
  FaRocket,
  FaForward,
  FaUnlock,
} from "react-icons/fa";

import { NavbarAdmin } from "../components/admin/NavbarAdmin";
import useSpotifyPlayer, {
  resetSpotifyPlayer,
} from "../hooks/useSpotifyPlayer";
import useLiveSessionStore from "../store/liveSessionStore";
import useAuthStore from "../store/authStore";
import useSessionStore from "../store/sessionStore.js";
import { useSessionSocket, useQueueActions } from "../socket/session.socket";
import QueueModal from "../modals/QueueModal.jsx";
import { disconnectSocket } from "../utils/socketManager.js";

// -------------------- TOAST --------------------
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    join: "bg-success-light text-success border-success/20",
    leave: "bg-error-light text-error border-error/20",
    info: "bg-info-light text-info border-info/20",
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl animate-in slide-in-from-top duration-300 ${styles[type]}`}
    >
      <div
        className={`w-2.5 h-2.5 rounded-full ${
          type === "join"
            ? "bg-success"
            : type === "leave"
              ? "bg-error"
              : "bg-info"
        } animate-pulse`}
      />
      <span className="text-sm font-bold">{message}</span>
    </div>
  );
};

// -------------------- ACTIVITY DRAWER --------------------
const ActivityDrawer = ({ isOpen, onClose, participants }) => (
  <div
    className={`fixed top-0 right-0 h-full w-80 bg-surface/90 backdrop-blur-xl shadow-2xl z-[140] transform transition-transform duration-500 ease-in-out border-l border-primary-subtle ${
      isOpen ? "translate-x-0" : "translate-x-full"
    }`}
  >
    <div className="p-6 pt-28 flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-text-primary flex items-center gap-3">
          <FaBell className="text-primary" size={18} /> Live Participants
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-primary-subtle rounded-full text-text-muted transition-all"
        >
          <FaTimes size={20} />
        </button>
      </div>
      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
        {participants.map((p) => (
          <div
            key={p.id}
            className="p-4 rounded-2xl bg-surface border border-primary-subtle/50 flex items-start gap-4 hover:shadow-md transition-shadow"
          >
            <div className="w-2.5 h-2.5 rounded-full mt-1.5 bg-success" />
            <div>
              <p className="text-sm font-bold text-text-primary leading-tight">
                {p.name}
              </p>
              <p className="text-[10px] text-text-muted font-black mt-1 uppercase tracking-tighter">
                Active
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// -------------------- SESSION PAGE --------------------
export default function SessionPage() {
  const { sessionCode: urlSessionCode } = useParams();
  const navigate = useNavigate();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  const sessionInitialized = useRef(false);

  // -------------------- STORES --------------------
  const { isAuthenticated } = useAuthStore();
  const { activeSessionCode, setActiveSessionCode, clearError } =
    useSessionStore();
  const {
    currentSession,
    sessionCode,
    isConnected,
    currentTrack,
    queue,
    stats,
    upNext,
    participants,
    sessionStatus,
    removeTrackFromQueue,
    isPlaying,
    setSessionCode,
    reset,
  } = useLiveSessionStore();

  const { refreshSessionData } = useQueueActions();

  const {
    player,
    is_paused,
    is_active,
    position,
    isReady,
    play,
    pause,
    nextTrack,
  } = useSpotifyPlayer();

  // -------------------- SOCKET --------------------
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

  useSessionSocket(sessionCode, socketEventHandlers);

  // -------------------- EFFECTS --------------------
  // Set session code from URL only once
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  // Global toast function
  useEffect(() => {
    window.showToast = (message, type) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
    };
    return () => delete window.showToast;
  }, []);

  // Auto-play when player is ready and track exists
  useEffect(() => {
    if (isReady && currentTrack) {
      play().catch((err) => console.warn("Auto-play failed:", err));
    }
  }, [isReady, currentTrack]);

  // -------------------- HANDLERS --------------------
  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const handleLeaveSession = () => {
    disconnectSocket("/session");
    reset();
    setActiveSessionCode(null);
    resetSpotifyPlayer();
    sessionInitialized.current = false;
    navigate("/");
  };

  const toggleLock = () => {
    setIsLocked((prev) => {
      addToast(
        !prev ? "Requests Paused" : "Queue Unlocked",
        !prev ? "leave" : "join"
      );
      return !prev;
    });
  };

  const handleQRCodeClick = () => {
    try {
      const pathParts = window.location.pathname.split("/");
      const sessionCodeFromPath = activeSessionCode || pathParts.at(-1);
      setActiveSessionCode(sessionCodeFromPath);
      if (!sessionCodeFromPath)
        throw new Error("No active session code found.");
      navigate(`/qrcode`);
    } catch (error) {
      console.error("Failed to navigate to QR code page:", error);
      clearError();
    }
  };

  const displayTrack = currentTrack;
  const displayQueue = queue.length ? queue : [];

  return (
    <div className="min-h-screen bg-surface-bg text-text-primary relative overflow-x-hidden">
      <NavbarAdmin />

      {/* Toasts */}
      <div className="fixed top-24 right-6 z-[200] flex flex-col gap-3 w-72">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            {...t}
            onClose={() =>
              setToasts((prev) => prev.filter((x) => x.id !== t.id))
            }
          />
        ))}
      </div>

      {/* Activity Drawer */}
      <ActivityDrawer
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
        participants={participants}
      />

      {/* Queue Modal */}
      <QueueModal isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />

      <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-24 lg:pt-32">
        {/* --- HEADER --- */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                  isConnected && sessionStatus === "active"
                    ? "text-success bg-success-light border-success/10"
                    : "text-text-muted bg-surface border-primary-subtle/20"
                }`}
              >
                <FaCircle
                  className={`text-[6px] ${isConnected ? "animate-pulse" : ""}`}
                />{" "}
                {isConnected && sessionStatus === "active"
                  ? "Live Now"
                  : "Connecting..."}
              </span>
              <p className="text-text-muted font-black text-[10px] uppercase tracking-widest">
                ID: #{sessionCode || "—"}
              </p>
            </div>
            <h1 className="text-5xl font-black text-text-primary tracking-tighter">
              {currentSession?.name || "Session"}
            </h1>
            <p className="text-text-secondary font-medium mt-1">
              {currentSession?.venue || "Main Lounge"} •{" "}
              <span className="text-primary">Admin View</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsActivityOpen(true)}
              className="relative p-4 bg-surface border border-primary-subtle text-text-primary rounded-2xl hover:bg-primary-subtle transition-all active:scale-90 shadow-sm"
            >
              <FaBell size={18} />
              {participants.length > 0 && (
                <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-surface animate-bounce" />
              )}
            </button>
            <button
              onClick={handleLeaveSession}
              className="px-6 py-4 rounded-2xl font-bold flex items-center gap-3 bg-error/10 text-error border border-error/20 hover:bg-error hover:text-white transition-all active:scale-95 shadow-sm"
            >
              <FaTimes /> Leave
            </button>
            <button
              onClick={() => setIsQueueOpen(true)}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95 group"
            >
              <FaPlus className="group-hover:rotate-90 transition-transform" />{" "}
              Add Song
            </button>
          </div>
        </header>

        {/* --- BODY --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Status & Now Playing */}
          <div className="lg:col-span-1 space-y-6">
            {/* In Queue / Listeners */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface p-6 rounded-[2.5rem] shadow-sm border border-primary-subtle">
                <p className="text-text-muted text-[10px] uppercase font-black tracking-widest mb-1 text-center">
                  In Queue
                </p>
                <p className="text-4xl font-black text-primary text-center tracking-tighter">
                  {stats.inQueue || displayQueue.length}
                </p>
              </div>
              <div className="bg-surface p-6 rounded-[2.5rem] shadow-sm border border-primary-subtle">
                <p className="text-text-muted text-[10px] uppercase font-black tracking-widest mb-1 text-center">
                  Listeners
                </p>
                <p className="text-4xl font-black text-accent text-center tracking-tighter">
                  {stats.listeners || participants.length}
                </p>
              </div>
            </div>

            {/* Now Playing Card */}
            <div className="bg-accent-dark text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-center">
                  <span className="bg-primary/20 text-primary-light text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-primary/20">
                    Now Playing
                  </span>
                  <button
                    onClick={toggleLock}
                    className={`p-2.5 rounded-xl transition-all ${
                      isLocked
                        ? "bg-error text-white scale-110"
                        : "bg-white/5 text-white/40 hover:text-white"
                    }`}
                    title={isLocked ? "Unlock Requests" : "Lock Requests"}
                  >
                    {isLocked ? <FaLock size={14} /> : <FaUnlock size={14} />}
                  </button>
                </div>

                <h3 className="text-4xl font-black mt-8 leading-none tracking-tighter group-hover:text-primary-light transition-colors">
                  {displayTrack?.name || "Waiting for playback..."}
                </h3>
                <p className="text-white/50 text-lg mt-2 font-medium italic">
                  {displayTrack?.artists?.map((a) => a.name).join(", ") ||
                    displayTrack?.artist ||
                    "—"}
                </p>

                <div className="mt-10 flex items-center gap-5">
                  <button
                    disabled={!isReady}
                    onClick={() => (is_paused ? play() : pause())}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl ${
                      isReady
                        ? "bg-white text-accent-dark hover:scale-105 active:scale-95"
                        : "bg-white/20 text-white/40 cursor-not-allowed"
                    }`}
                  >
                    <FaPlay className="ml-1" size={20} />
                  </button>
                  <button
                    disabled={!isReady}
                    onClick={() => {
                      nextTrack();
                      addToast("Track Skipped", "info");
                    }}
                    className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/5"
                  >
                    <FaStepForward size={18} />
                  </button>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary shadow-[0_0_20px_#E07A3D] transition-all duration-300"
                      style={{ width: `${position}%` }}
                    />
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-black text-white/30 tracking-widest">
                      Up Next
                    </p>
                    <p className="text-sm font-bold text-primary-light truncate">
                      {upNext?.title ||
                        upNext?.name ||
                        displayQueue[0]?.title ||
                        "—"}
                    </p>
                  </div>
                  <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary-light hover:text-white px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-primary/20">
                    <FaRocket /> Boost
                  </button>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            </div>
          </div>

          {/* RIGHT: Upcoming Queue */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-[3rem] shadow-sm border border-primary-subtle overflow-hidden h-full flex flex-col">
              <div className="p-8 border-b border-primary-subtle flex justify-between items-center bg-surface-alt/10">
                <div>
                  <h2 className="text-2xl font-black text-text-primary tracking-tight">
                    Upcoming Requests
                  </h2>
                  <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                    Real-time Guest Voting
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-[10px] font-black text-text-muted uppercase">
                      Est. Wait
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {stats.estimatedWait || displayQueue.length * 3} Minutes
                    </span>
                  </div>
                  <button
                    className="p-4 bg-surface-bg border border-primary-subtle rounded-2xl text-text-primary hover:text-primary transition-all shadow-sm"
                    onClick={handleQRCodeClick}
                  >
                    <FaQrcode size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {displayQueue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                    <FaMusic size={48} className="mb-4 opacity-20" />
                    <p className="font-bold">No songs in queue</p>
                    <p className="text-sm mt-1">Add songs to get started!</p>
                  </div>
                ) : (
                  displayQueue.slice(0, 5).map((song, i) => (
                    <div
                      key={song.id || i}
                      className="flex items-center gap-6 p-6 hover:bg-surface-alt/40 border-b border-primary-subtle last:border-0 group transition-all"
                    >
                      <div className="flex flex-col items-center min-w-[50px] bg-surface-bg py-2 rounded-2xl border border-primary-subtle/30 group-hover:border-primary/20">
                        <button className="text-text-muted hover:text-success transition-all hover:scale-125">
                          <FaChevronUp size={16} />
                        </button>
                        <span className="font-black text-lg text-text-primary my-1 tracking-tighter">
                          {song.votes || 0}
                        </span>
                        <button className="text-text-muted hover:text-error transition-all hover:scale-125">
                          <FaChevronDown size={16} />
                        </button>
                      </div>

                      <div className="w-16 h-16 bg-primary-subtle text-primary rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        {song.album?.images?.[0] ? (
                          <img
                            src={song.album.images[0].url}
                            alt={song.album.name}
                            className="w-full h-full object-cover rounded-[1.5rem]"
                          />
                        ) : (
                          <FaMusic size={24} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-text-primary text-xl truncate tracking-tight group-hover:translate-x-1 transition-transform">
                          {song.title || song.name}
                        </h4>
                        <p className="text-sm text-text-secondary font-medium italic truncate">
                          {song.artist || song.artists?.[0]?.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => addToast("Song Prioritized", "join")}
                          className="p-3 bg-surface-bg border border-primary-subtle rounded-xl text-text-muted hover:text-primary hover:border-primary opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        >
                          <FaForward size={14} />
                        </button>
                        <button
                          onClick={() => {
                            addToast("Song Removed from Queue", "leave");
                            removeTrackFromQueue(song.id);
                          }}
                          className="p-3 bg-surface-bg border border-primary-subtle rounded-xl text-text-muted hover:text-error hover:border-error opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-8 bg-surface-alt/30 text-center border-t border-primary-subtle">
                <button
                  onClick={() => setIsQueueOpen(true)}
                  className="group text-primary font-black text-xs hover:text-primary-dark transition-all uppercase tracking-[0.2em] flex items-center gap-3 mx-auto"
                >
                  <FaListUl className="group-hover:rotate-12 transition-transform" />{" "}
                  Open Full Management Suite
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
