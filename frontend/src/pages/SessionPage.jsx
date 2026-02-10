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
  FaPause,
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
import { getSocket } from "../utils/socketManager.js";

// -------------------- SESSION PAGE --------------------
export default function SessionPage() {
  const { sessionCode: urlSessionCode } = useParams();
  const navigate = useNavigate();

  const [isQueueOpen, setIsQueueOpen] = useState(false);

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
    deviceId,
    play,
    playTrack,
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
  useEffect(() => {
    window.__onSpotifyTrackEnded = async () => {
      try {
        if (!sessionCode) return;

        const sock = await getSocket("/session");
        sock.emit("track_ended", { sessionCode }, (res) => {
          if (!res?.success) console.warn("track_ended failed:", res?.message);
        });
      } catch (e) {
        console.warn("track_ended emit error:", e);
      }
    };

    return () => {
      delete window.__onSpotifyTrackEnded;
    };
  }, [sessionCode]);

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

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const syncedOnce = useRef(false);

  useEffect(() => {
    if (!isReady || !deviceId) return;
    if (!currentSession) return;
    if (syncedOnce.current) return;

    syncedOnce.current = true;

    (async () => {
      try {
        const uri = currentTrack?.uri;

        if (uri) {
          await playTrack(uri);
        } else {
          await pause();
        }
      } catch (err) {
        console.warn("Initial playback sync failed:", err);
        syncedOnce.current = false;
      }
    })();
  }, [isReady, deviceId, currentSession, currentTrack?.uri, playTrack, pause]);
  const lastPlayedUriRef = useRef(null);

  useEffect(() => {
    if (!isReady || !deviceId) return;

    const uri = currentTrack?.uri;

    if (!uri) {
      pause().catch(() => {});
      lastPlayedUriRef.current = null;
      return;
    }

    if (lastPlayedUriRef.current === uri) return;
    lastPlayedUriRef.current = uri;

    playTrack(uri).catch((e) =>
      console.warn("playTrack on track change failed:", e)
    );
  }, [currentTrack?.uri, isReady, deviceId, playTrack, pause]);

  // -------------------- HANDLERS --------------------

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

      {isQueueOpen && (
        <QueueModal
          isOpen={isQueueOpen}
          onClose={() => setIsQueueOpen(false)}
          // queue={displayQueue}
        />
      )}

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
                    {is_paused ? (
                      <FaPlay className="ml-1" size={20} />
                    ) : (
                      <FaPause className="ml-1" size={20} />
                    )}
                  </button>
                  <button
                    disabled={!isReady}
                    onClick={() => {
                      nextTrack();
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

              <div className="flex-1">
                {displayQueue.slice(0, 5).map((song, i) => (
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
                      {song.albumImage ? (
                        <img
                          src={song.albumImage}
                          alt={song.title}
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
                        {song.artists.map((a) => a.name).join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <button className="p-3 bg-surface-bg border border-primary-subtle rounded-xl text-text-muted hover:text-primary hover:border-primary opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                        <FaForward size={14} />
                      </button>
                      <button
                        onClick={() => {
                          removeTrackFromQueue(song.id);
                        }}
                        className="p-3 bg-surface-bg border border-primary-subtle rounded-xl text-text-muted hover:text-error hover:border-error opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                      >
                        <FaTrashAlt size={14} />
                      </button>
                    </div>
                  </div>
                ))}
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
