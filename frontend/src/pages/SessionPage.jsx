import React from 'react';
import { FaPlay, FaStepForward, FaUsers, FaMusic, FaQrcode } from 'react-icons/fa';
import { NavbarAdmin } from "../components/admin/NavbarAdmin";

export default function SessionPage() {
  return (
    <div className="min-h-screen bg-surface-bg">
      <NavbarAdmin />
      
      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        {/* Welcome Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Morning Brew Café</h1>
            <p className="text-text-secondary">Session active since 08:00 AM</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-surface border-2 border-primary text-primary px-5 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary-subtle transition-colors">
              <FaQrcode /> View QR Code
            </button>
            <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg font-medium transition-colors">
              End Session
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface p-6 rounded-xl shadow-sm border border-primary-subtle">
                <p className="text-text-muted text-xs uppercase tracking-wider">In Queue</p>
                <p className="text-3xl font-bold text-primary mt-1">12</p>
              </div>
              <div className="bg-surface p-6 rounded-xl shadow-sm border border-primary-subtle">
                <p className="text-text-muted text-xs uppercase tracking-wider">Listeners</p>
                <p className="text-3xl font-bold text-accent mt-1">48</p>
              </div>
            </div>

            {/* Now Playing Card */}
            <div className="bg-accent-dark text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <span className="bg-primary/20 text-primary-light text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-primary/30">
                  Now Playing
                </span>
                <h3 className="text-xl font-bold mt-4 leading-tight">Midnight City</h3>
                <p className="text-white/70 text-sm">M83 • Requested by Table 4</p>
                
                <div className="mt-6 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer">
                    <FaPlay className="ml-1" />
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer">
                    <FaStepForward />
                  </div>
                  <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-primary" />
                  </div>
                </div>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            </div>
          </div>

          {/* Right Column: Live Queue */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-2xl shadow-sm border border-primary-subtle overflow-hidden">
              <div className="p-6 border-b border-primary-subtle flex justify-between items-center">
                <h2 className="text-xl font-bold text-text-primary">Upcoming Queue</h2>
                <span className="text-sm text-primary font-medium">Auto-accept: ON</span>
              </div>
              
              <div className="divide-y divide-primary-subtle">
                {[
                  { title: "Blinding Lights", artist: "The Weeknd", table: "Table 12", time: "2 min ago" },
                  { title: "Espresso", artist: "Sabrina Carpenter", table: "Table 5", time: "5 min ago" },
                  { title: "Heat Waves", artist: "Glass Animals", table: "Bar 2", time: "8 min ago" },
                ].map((song, i) => (
                  <div key={i} className="p-4 hover:bg-surface-alt transition-colors flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-primary-subtle rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <FaMusic />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary">{song.title}</h4>
                      <p className="text-sm text-text-secondary">{song.artist}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-accent">{song.table}</p>
                      <p className="text-xs text-text-muted">{song.time}</p>
                    </div>
                    <button className="text-text-muted hover:text-error p-2">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-surface-alt text-center">
                <button className="text-primary font-semibold text-sm hover:underline">
                  View All Requests
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}