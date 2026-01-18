// src/pages/admin/AdminDashboard.jsx

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Lottie from "lottie-react";
import waveAnimation from "../../assets/Wave Animation.json";
import { NavbarAdmin } from "../../components/admin/NavbarAdmin";
import { FaSpotify, FaMusic, FaQrcode } from "react-icons/fa";
import { MdQueueMusic } from "react-icons/md";
import Button from "../../components/ui/Button";
import "./adminDashboard.css";

export const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if redirected from Spotify
  useEffect(() => {
    const spotifyStatus = searchParams.get("spotify");

    if (spotifyStatus === "connected") {
      setIsConnected(true);
      setShowSuccess(true);

      // Remove query param from URL (clean up)
      searchParams.delete("spotify");
      setSearchParams(searchParams);

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }

    if (spotifyStatus === "error") {
      console.error("Spotify connection failed");
    }
  }, [searchParams, setSearchParams]);

  // Handle Spotify Login
  const handleSpotifyLogin = () => {
    setLoading(true);
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/spotify/login`;
  };

  const floatingDots = useMemo(
    () => [
      { top: "15%", left: "10%", delay: "0s" },
      { top: "30%", left: "75%", delay: "0.3s" },
      { top: "50%", left: "20%", delay: "0.6s" },
      { top: "65%", left: "80%", delay: "0.9s" },
      { top: "80%", left: "35%", delay: "1.2s" },
      { top: "25%", left: "60%", delay: "1.5s" },
    ],
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface text-text-primary">

      {/* ================= SUCCESS TOAST ================= */}
      {showSuccess && (
        <div className="fixed top-20 right-6 bg-success-light text-success px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <span>✓</span>
          Spotify connected successfully!
        </div>
      )}

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface to-primary/[0.08]" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary/[0.04] rounded-full blur-[150px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-accent/[0.03] rounded-full blur-[120px]" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ================= NAVBAR ================= */}
      <div className="relative z-20">
        <NavbarAdmin />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-64px)] px-8 lg:px-16 xl:px-24">

        <div className="w-full max-w-6xl flex flex-col-reverse lg:flex-row items-center gap-8">

          {/* ---------- LEFT SECTION ---------- */}
          <section className="flex-1 py-12">

            <span className="text-primary font-medium tracking-widest uppercase text-sm">
              Welcome to VibeRadius
            </span>

            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-accent-dark leading-[1.1] mt-4">
              Let your space <br />
              <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                feel alive.
              </span>
            </h1>

            <p className="mt-8 text-lg text-text-primary/80 max-w-xl leading-relaxed">
              Customers scan. Songs queue. Your venue transforms into an
              <span className="text-accent font-medium"> interactive music experience.</span>
            </p>

            <div className="mt-10 flex flex-col gap-3">
              <Feature
                icon={<FaQrcode className="text-lg" />}
                text="QR Requests"
                desc="Customers scan to add songs"
              />
              <Feature
                icon={<MdQueueMusic className="text-lg" />}
                text="Live Queue"
                desc="Real-time song management"
              />
              <Feature
                icon={<FaSpotify className="text-lg" />}
                text="Spotify Sync"
                desc="Direct integration with Spotify"
              />
            </div>

          </section>

          {/* ---------- RIGHT SECTION ---------- */}
          <section className="flex-1 flex justify-center py-12">

            <div className="relative flex flex-col items-center text-center max-w-xs">

              {/* Animation + Central Orb */}
              <div className="relative w-44 h-44 mb-10">

                <Lottie
                  animationData={waveAnimation}
                  loop
                  autoplay
                  className="absolute inset-0 scale-125 opacity-50"
                />

                <div className="absolute inset-0 pointer-events-none">
                  {floatingDots.map((dot, i) => (
                    <span
                      key={i}
                      className="absolute w-2 h-2 bg-primary-light rounded-full animate-float"
                      style={{
                        top: dot.top,
                        left: dot.left,
                        animationDelay: dot.delay,
                      }}
                    />
                  ))}
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark border-2 border-primary-light/40 shadow-[0_0_60px_rgba(224,122,61,0.35)] flex items-center justify-center orb-pulse">
                    <FaMusic className="text-2xl text-white animate-float-rotate" />
                  </div>
                </div>

              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-accent-dark">
                {isConnected ? "Spotify Connected" : "Connect Your Music"}
              </h2>

              {/* Description */}
              <p className="mt-3 text-text-primary/70 text-sm leading-relaxed">
                {isConnected 
                  ? "Your Spotify account is linked. Ready to start a session!"
                  : "Link your Spotify account to start accepting song requests from customers"
                }
              </p>

              {/* CTA Button */}
              {isConnected ? (
                <Button
                  variant="primary"
                  className="mt-10 w-full h-14 text-base font-semibold shadow-[0_8px_30px_rgba(45,138,78,0.25)] flex items-center gap-3 justify-center bg-success hover:bg-success/90"
                >
                  <FaSpotify className="text-xl" />
                  Connected ✓
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSpotifyLogin}
                  disabled={loading}
                  className="mt-10 w-full h-14 text-base font-semibold shadow-[0_8px_30px_rgba(224,122,61,0.25)] flex items-center gap-3 justify-center"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FaSpotify className="text-xl" />
                      Connect Spotify
                    </>
                  )}
                </Button>
              )}

              {/* Micro-copy */}
              <span className="mt-4 text-text-muted text-xs flex items-center gap-2">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {isConnected ? "Ready to start session" : "Takes less than 30 seconds • Secure OAuth"}
              </span>

            </div>

          </section>

        </div>

      </main>
    </div>
  );
};

/* ==================== Sub Components ==================== */

const Feature = ({ icon, text, desc }) => (
  <div className="flex items-center gap-4 p-3 rounded-xl border border-transparent">
    <span className="w-12 h-12 bg-primary-subtle rounded-xl flex items-center justify-center text-primary text-xl shrink-0 border border-primary/10">
      {icon}
    </span>
    <div className="text-left">
      <h3 className="text-text-primary font-semibold">{text}</h3>
      <p className="text-text-muted text-sm">{desc}</p>
    </div>
  </div>
);