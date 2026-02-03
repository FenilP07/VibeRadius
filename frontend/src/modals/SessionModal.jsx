import React, { useState } from "react";
import { FaMusic, FaTimes } from "react-icons/fa";
import useSessionStore from "../store/sessionStore.js";

export default function CreateSessionModal({ isOpen, onClose }) {
  const [sessionName, setSessionName] = useState("");
  const [closing, setClosing] = useState(false);

  const { createSession, createLoading, addActiveSession } = useSessionStore();

  if (!isOpen && !closing) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setSessionName("");
      onClose();
    }, 250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionName.trim()) return;

    const result = await createSession({ name: sessionName });

    if (result.success) {
      const sessionData = {
        id: result.response.session._id,
        _id: result.response.session._id,
        code: result.response.session.session_code,
        name: result.response.session.session_name,
        songs: 0,
        listeners: 0,
        status: result.response.session.session_status,
      };
      addActiveSession(sessionData);
      handleClose();
    } else {
      alert("Failed to create session");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => handleClose(false)}
      />

      <div
        className={`relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-250
          ${closing ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
      >
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FaMusic className="text-xl" />
            </div>
            <h2 className="text-xl font-bold">Launch New Session</h2>
          </div>
          <button onClick={() => handleClose(false)}>
            <FaTimes size={20} />
          </button>
        </div>

        <form className="p-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block font-semibold mb-2">Session Name</label>
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="flex-1 px-6 py-3 rounded-xl border"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createLoading}
              className="flex-[2] bg-primary text-white py-3 rounded-xl shadow-lg transition-all disabled:opacity-60"
            >
              {createLoading ? "Starting..." : "Roll Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
