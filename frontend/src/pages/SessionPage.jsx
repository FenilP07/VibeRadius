import React, { useState, useEffect } from 'react';
import { 
  FaPlay, FaStepForward, FaMusic, FaQrcode, FaCircle, FaPlus, 
  FaChevronUp, FaChevronDown, FaListUl, FaTimes, FaSearch, 
  FaBell, FaTrashAlt, FaLock, FaRocket, FaForward, FaUnlock 
} from 'react-icons/fa';
import { NavbarAdmin } from "../components/admin/NavbarAdmin";



// --- 1. Toast Notification ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    join: "bg-success-light text-success border-success/20",
    leave: "bg-error-light text-error border-error/20",
    info: "bg-info-light text-info border-info/20"
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl animate-in slide-in-from-top duration-300 ${styles[type]}`}>
      <div className={`w-2.5 h-2.5 rounded-full ${type === 'join' ? 'bg-success' : type === 'leave' ? 'bg-error' : 'bg-info'} animate-pulse`} />
      <span className="text-sm font-bold">{message}</span>
    </div>
  );
};

// --- 2. Full Queue Management Modal ---
const QueueModal = ({ isOpen, onClose, queue }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-accent-dark/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in duration-200 border border-primary-light/20">
        <div className="p-6 border-b border-primary-subtle bg-surface-alt flex justify-between items-center">
          <h2 className="text-xl font-black text-text-primary flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20"><FaListUl size={14}/></div>
            Session Queue
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-primary-subtle rounded-full text-text-muted transition-colors"><FaTimes size={20}/></button>
        </div>
        
        <div className="p-6 bg-surface">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search and add a new song instantly..." 
              className="w-full pl-11 pr-4 py-4 rounded-2xl bg-surface-bg border border-primary-subtle focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="overflow-y-auto p-4 flex-1 custom-scrollbar">
          {queue.map((song, i) => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-surface-alt rounded-2xl transition-all mb-2 group border border-transparent hover:border-primary-subtle">
               <div className="flex flex-col items-center min-w-[32px] bg-surface-bg py-1 rounded-lg">
                <FaChevronUp className="text-text-muted hover:text-success cursor-pointer transition-colors" size={10}/>
                <span className="text-xs font-black text-text-primary py-0.5">{song.votes}</span>
                <FaChevronDown className="text-text-muted hover:text-error cursor-pointer transition-colors" size={10}/>
              </div>
              <div className="w-12 h-12 bg-primary-subtle text-primary rounded-xl flex items-center justify-center shadow-inner font-bold"><FaMusic size={16}/></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-text-primary text-sm truncate">{song.title}</h4>
                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{song.artist}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all hover:bg-error-light rounded-lg"><FaTrashAlt size={14}/></button>
                <span className="text-[10px] font-black text-primary uppercase bg-primary-subtle px-3 py-1.5 rounded-lg border border-primary/10">{song.table}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function SessionPage() {
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  
  const [fullQueue] = useState([
    { title: "Blinding Lights", artist: "The Weeknd", table: "T-12", votes: 12 },
    { title: "Espresso", artist: "Sabrina Carpenter", table: "T-05", votes: 8 },
    { title: "Heat Waves", artist: "Glass Animals", table: "B-02", votes: 5 },
    { title: "Cruel Summer", artist: "Taylor Swift", table: "T-09", votes: 4 },
    { title: "Flowers", artist: "Miley Cyrus", table: "T-11", votes: 2 },
  ]);

  const activities = [
    { id: 1, type: 'join', user: 'Guest_29', time: '12:01 PM' },
    { id: 2, type: 'leave', user: 'Guest_14', time: '12:05 PM' },
    { id: 3, type: 'join', user: 'Guest_03', time: '12:10 PM' },
  ];

  const addToast = (message, type) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    addToast(isLocked ? "Queue Unlocked" : "Requests Paused", isLocked ? "join" : "leave");
  };

  return (
    <div className="min-h-screen bg-surface-bg text-text-primary relative overflow-x-hidden">
      <NavbarAdmin />
      
      {/* 1. LAYER: TOASTS */}
      <div className="fixed top-24 right-6 z-[200] flex flex-col gap-3 w-72">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => setToasts(prev => prev.filter(item => item.id !== t.id))} />
        ))}
      </div>

      {/* 2. LAYER: ACTIVITY DRAWER */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-surface/90 backdrop-blur-xl shadow-2xl z-[140] transform transition-transform duration-500 ease-in-out border-l border-primary-subtle ${isActivityOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 pt-28 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-text-primary flex items-center gap-3">
              <FaBell className="text-primary" size={18}/>
              Live Activity
            </h3>
            <button onClick={() => setIsActivityOpen(false)} className="p-2 hover:bg-primary-subtle rounded-full text-text-muted transition-all"><FaTimes size={20}/></button>
          </div>
          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {activities.map(act => (
              <div key={act.id} className="p-4 rounded-2xl bg-surface border border-primary-subtle/50 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${act.type === 'join' ? 'bg-success' : 'bg-error shadow-[0_0_8px_rgba(201,59,59,0.4)]'}`} />
                <div>
                  <p className="text-sm font-bold text-text-primary leading-tight">
                    {act.user} <span className="font-medium text-text-secondary">{act.type === 'join' ? 'joined' : 'left'}</span>
                  </p>
                  <p className="text-[10px] text-text-muted font-black mt-1 uppercase tracking-tighter">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <QueueModal isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} queue={fullQueue} />

      <main className="max-w-7xl mx-auto p-6 lg:p-10 pt-24 lg:pt-32">
        {/* DASHBOARD HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="flex items-center gap-1.5 text-success text-[10px] font-black uppercase tracking-[0.2em] bg-success-light px-3 py-1 rounded-full border border-success/10">
                <FaCircle className="text-[6px] animate-pulse" /> Live Now
              </span>
              <p className="text-text-muted font-black text-[10px] uppercase tracking-widest">ID: #MB44</p>
            </div>
            <h1 className="text-5xl font-black text-text-primary tracking-tighter">Morning Brew</h1>
            <p className="text-text-secondary font-medium mt-1">Main Lounge Station • <span className="text-primary">Admin View</span></p>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => setIsActivityOpen(true)} className="relative p-4 bg-surface border border-primary-subtle text-text-primary rounded-2xl hover:bg-primary-subtle transition-all active:scale-90 shadow-sm">
              <FaBell size={18} />
              <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-surface animate-bounce" />
            </button>
            <button onClick={() => setIsQueueOpen(true)} className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95 group">
              <FaPlus className="group-hover:rotate-90 transition-transform" /> Add Song
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: STATUS & NOW PLAYING */}
          <div className="lg:col-span-1 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface p-6 rounded-[2.5rem] shadow-sm border border-primary-subtle">
                <p className="text-text-muted text-[10px] uppercase font-black tracking-widest mb-1 text-center">In Queue</p>
                <p className="text-4xl font-black text-primary text-center tracking-tighter">{fullQueue.length}</p>
              </div>
              <div className="bg-surface p-6 rounded-[2.5rem] shadow-sm border border-primary-subtle">
                <p className="text-text-muted text-[10px] uppercase font-black tracking-widest mb-1 text-center">Listeners</p>
                <p className="text-4xl font-black text-accent text-center tracking-tighter">48</p>
              </div>
            </div>

            {/* NOW PLAYING CARD */}
            <div className="bg-accent-dark text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                <div className="flex justify-between items-center">
                  <span className="bg-primary/20 text-primary-light text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-primary/20">Now Playing</span>
                  <button 
                    onClick={toggleLock} 
                    className={`p-2.5 rounded-xl transition-all ${isLocked ? 'bg-error text-white scale-110' : 'bg-white/5 text-white/40 hover:text-white'}`}
                    title={isLocked ? "Unlock Requests" : "Lock Requests"}
                  >
                    {isLocked ? <FaLock size={14}/> : <FaUnlock size={14}/>}
                  </button>
                </div>
                
                <h3 className="text-4xl font-black mt-8 leading-none tracking-tighter group-hover:text-primary-light transition-colors">Midnight City</h3>
                <p className="text-white/50 text-lg mt-2 font-medium italic">M83 • Table 04</p>
                
                <div className="mt-10 flex items-center gap-5">
                  <button className="w-16 h-16 bg-white text-accent-dark rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-xl active:scale-95">
                    <FaPlay className="ml-1" size={20}/>
                  </button>
                  <button onClick={() => addToast("Track Skipped", "info")} className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all border border-white/5">
                    <FaStepForward size={18}/>
                  </button>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-1/3 h-full bg-primary shadow-[0_0_20px_#E07A3D]" />
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-black text-white/30 tracking-widest">Up Next</p>
                    <p className="text-sm font-bold text-primary-light truncate">Blinding Lights</p>
                  </div>
                  <button className="flex items-center gap-2 bg-primary/10 hover:bg-primary text-primary-light hover:text-white px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-primary/20">
                    <FaRocket /> Boost
                  </button>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            </div>
          </div>

          {/* RIGHT: TRENDING QUEUE */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-[3rem] shadow-sm border border-primary-subtle overflow-hidden h-full flex flex-col">
              <div className="p-8 border-b border-primary-subtle flex justify-between items-center bg-surface-alt/10">
                <div>
                  <h2 className="text-2xl font-black text-text-primary tracking-tight">Upcoming Requests</h2>
                  <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">Real-time Guest Voting</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-[10px] font-black text-text-muted uppercase">Est. Wait</span>
                    <span className="text-sm font-bold text-primary">12 Minutes</span>
                  </div>
                  <button className="p-4 bg-surface-bg border border-primary-subtle rounded-2xl text-text-primary hover:text-primary transition-all shadow-sm">
                    <FaQrcode size={20}/>
                  </button>
                </div>
              </div>

              <div className="flex-1">
                {fullQueue.slice(0, 5).map((song, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 hover:bg-surface-alt/40 border-b border-primary-subtle last:border-0 group transition-all">
                    <div className="flex flex-col items-center min-w-[50px] bg-surface-bg py-2 rounded-2xl border border-primary-subtle/30 group-hover:border-primary/20">
                      <button className="text-text-muted hover:text-success transition-all hover:scale-125"><FaChevronUp size={16}/></button>
                      <span className="font-black text-lg text-text-primary my-1 tracking-tighter">{song.votes}</span>
                      <button className="text-text-muted hover:text-error transition-all hover:scale-125"><FaChevronDown size={16}/></button>
                    </div>
                    
                    <div className="w-16 h-16 bg-primary-subtle text-primary rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <FaMusic size={24}/>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-text-primary text-xl truncate tracking-tight group-hover:translate-x-1 transition-transform">{song.title}</h4>
                      <p className="text-sm text-text-secondary font-medium italic truncate">{song.artist}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <button onClick={() => addToast("Song Prioritized", "join")} className="p-3 bg-surface-bg border border-primary-subtle rounded-xl text-text-muted hover:text-primary hover:border-primary opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                        <FaForward size={14}/>
                      </button>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">From Table</span>
                        <p className="text-xs font-black text-primary uppercase bg-primary-subtle px-3 py-1.5 rounded-lg border border-primary/10">
                          {song.table}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-surface-alt/30 text-center border-t border-primary-subtle">
                <button onClick={() => setIsQueueOpen(true)} className="group text-primary font-black text-xs hover:text-primary-dark transition-all uppercase tracking-[0.2em] flex items-center gap-3 mx-auto">
                  <FaListUl className="group-hover:rotate-12 transition-transform"/> Open Full Management Suite
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}