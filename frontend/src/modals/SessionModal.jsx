import React, { useEffect, useState, useRef } from "react";
import { FaMusic, FaTimes, FaPlusCircle } from "react-icons/fa";
import useSessionStore from "../store/sessionStore.js";

export default function CreateSessionModal({ isOpen, onClose }) {
  const [sessionName, setSessionName] = useState("");
  const [closing, setClosing] = useState(false);
  const inputRef = useRef(null);

  const { createSession, createLoading, addActiveSession } = useSessionStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen && !closing) return null;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setSessionName("");
      onClose();
    }, 200);
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
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Soft Backdrop */}
      <div
        className={`absolute inset-0 bg-[#5C4033]/20 backdrop-blur-sm transition-opacity duration-300 ${
          closing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-white/90 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(92,64,51,0.2)] overflow-hidden transform transition-all duration-300 border border-white
          ${closing ? "opacity-0 scale-95 translate-y-4" : "opacity-100 scale-100 translate-y-0"}`}
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 text-[#5C4033]/20 hover:text-[#5C4033] transition-colors"
        >
          <FaTimes size={18} />
        </button>

        <div className="p-10">
          {/* Icon and Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-[#FEF3EB] text-[#E07A3D] rounded-3xl flex items-center justify-center mb-4 shadow-inner">
              <FaMusic size={24} />
            </div>
            <h2 className="text-2xl font-black text-[#5C4033] tracking-tight">
              Create a Session
            </h2>
            <p className="text-[#5C4033]/50 font-medium text-sm mt-1">
              Set a name for your live queue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder=" " /* Required for floating label effect */
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value.slice(0, 30))}
                className="peer w-full px-0 py-4 bg-transparent border-b-2 border-[#5C4033]/10 font-bold text-[#5C4033] text-lg focus:border-[#E07A3D] focus:outline-none transition-all placeholder-transparent"
                required
              />
              <label className="absolute left-0 -top-3.5 text-xs font-black uppercase tracking-widest text-[#E07A3D] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#5C4033]/30 peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-[#E07A3D] peer-focus:text-xs pointer-events-none">
                Session Name
              </label>
              <div className="flex justify-end mt-1">
                 <span className="text-[10px] font-bold text-[#5C4033]/20 uppercase">
                   {sessionName.length}/30
                 </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <button
                type="submit"
                disabled={createLoading || !sessionName.trim()}
                className="w-full bg-[#E07A3D] hover:bg-[#C4612A] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#E07A3D]/20 transition-all transform active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {createLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FaPlusCircle /> Start Session
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleClose}
                className="text-[#5C4033]/40 text-xs font-black uppercase tracking-widest hover:text-[#5C4033] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}