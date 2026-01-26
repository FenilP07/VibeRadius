import React from 'react';
import { useState } from 'react';
import { FaMusic, FaHashtag, FaMagic, FaTimes } from 'react-icons/fa';
import useSessionStore from '../store/sessionStore.js';

export default function CreateSessionModal({ isOpen, onClose, onCreate }) {
  if (!isOpen) return null;

  const [sessionName, setSessionName] = useState('');

  const { createSession } = useSessionStore();

  const handleCreateSession = async (e) => {
    e.preventDefault();
    await createSession({ name: sessionName });
    onCreate();
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-accent-charcoal/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FaMusic className="text-xl" />
            </div>
            <h2 className="text-xl font-bold">Launch New Session</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form className="p-8 space-y-6" onSubmit={handleCreateSession}>

          {/* Session Name */}
          <div>
            <label className="block text-text-primary font-semibold mb-2 flex items-center gap-2">
              <FaMusic className="text-primary text-xs" /> Session Name
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g. Friday Afternoon Chill"
              className="w-full px-4 py-3 rounded-xl bg-surface-bg border border-accent/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Table Count & Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-primary font-semibold mb-2 flex items-center gap-2">
                <FaHashtag className="text-primary text-xs" /> Total Tables
              </label>
              <input
                type="number"
                placeholder="20"
                className="w-full px-4 py-3 rounded-xl bg-surface-bg border border-accent/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-text-primary font-semibold mb-2 flex items-center gap-2">
                <FaMagic /> Mood
              </label>
              <select className="w-full px-4 py-3 rounded-xl bg-surface-bg border border-accent/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                <option>Chill/Lo-Fi</option>
                <option>Upbeat/Pop</option>
                <option>Jazz/Blues</option>
              </select>
            </div>
          </div>

          {/* Toggles Section */}
          <div className="space-y-3 bg-surface-alt p-4 rounded-2xl border border-primary-subtle">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text-primary">Auto-accept requests</p>
                <p className="text-xs text-text-muted">Songs will play without manual approval</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-primary cursor-pointer" defaultChecked />
            </div>
            <div className="pt-3 border-t border-primary-subtle flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text-primary">Explicit Filter</p>
                <p className="text-xs text-text-muted">Block songs with explicit lyrics</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-primary cursor-pointer" defaultChecked />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-bold text-text-secondary hover:bg-surface-alt transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all"
            >
              Start Session
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}