import { create } from "zustand";

const useLiveSessionStore = create((set, get) => ({
  currentSession: null,
  sessionCode: null,
  isConnected: false,
  isJoining: false,
  joinError: null,

  participants: [],
  participantCount: 0,

  isHost: false,
  hostId: null,

  sessionStatus: "idle", // idle, active, paused, ended

  currentTrack: null,
  queue: [],
  isPlaying: false,

  setCurrentSession: (session) => {
    set({
      currentSession: session,
      sessionCode: session.session_code,
      participantCount: session.participants?.length || 0,
      participants: session.participants || [],
      hostId: session.created_by,
      sessionStatus: session.status || "active",
    });
  },

  setSessionCode: (code) => set({ sessionCode: code }),

  setConnected: (isConnected) => set({ isConnected }),

  setJoining: (isJoining) => set({ isJoining }),
  setJoinError: (error) => set({ joinError: error }),

  handleUserJoined: (data) => {
    const { userId, participantCount } = data;

    set((state) => ({
      participantCount,
      participants: state.participants.includes(userId)
        ? state.participants
        : [...state.participants, userId],
    }));
  },

  handleUserLeft: (data) => {
    const { userId, participantCount } = data;

    set((state) => ({
      participantCount,
      participants: state.participants.filter((id) => id !== userId),
    }));
  },

  updateParticipantCount: (count) => set({ participantCount: count }),
  updateSessionStatus: (status) => set({ sessionStatus: status }),

  reset: () =>
    set({
      currentSession: null,
      sessionCode: null,
      isConnected: false,
      isJoining: false,
      joinError: null,
      participants: [],
      participantCount: 0,
      isHost: false,
      hostId: null,
      sessionStatus: "idle",
      currentTrack: null,
      queue: [],
      isPlaying: false,
    }),

  clearError: () => set({ joinError: null }),
}));

export default useLiveSessionStore;
