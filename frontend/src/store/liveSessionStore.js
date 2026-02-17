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
  currentUser: null,

  sessionStatus: "idle",

  currentTrack: null,
  addToQueueTrack: null,
  queue: [],
  isPlaying: false,

  stats: {
    listeners: 0,
    inQueue: 0,
    estimatedWait: 0,
  },

  upNext: null,

  setCurrentSession: (session) => {
    set({
      currentSession: session,
      sessionCode: session.session_code,
      participantCount: session.participants?.length || 0,
      participants: session.participants || [],
      hostId: session.host_id || session.created_by,
      sessionStatus: session.status || session.session_status || "active",
      stats: {
        listeners: session.participants?.length || 0,
        inQueue: 0,
        estimatedWait: 0,
      },
    });
  },

  setSessionCode: (code) => set({ sessionCode: code }),

  setConnected: (isConnected) => set({ isConnected }),

  setJoining: (isJoining) => set({ isJoining }),

  setJoinError: (error) => set({ joinError: error }),

  setSessionData: (data) => {
    set({
      currentSession: data.session,
      sessionCode: data.session.code,
      hostId: data.session.hostId,
      sessionStatus: data.session.status,
      currentTrack: data.currentlyPlaying,
      queue: data.queue || [],
      upNext: data.upNext,
      stats: data.stats,
      participantCount: data.stats.listeners,
    });
  },

  handleUserJoined: (data) => {
    const { userId, name, participantCount } = data;

    set((state) => {
      const user = get().currentUser;
      if (!user || user.id === userId) {
        set({ currentUser: { id: userId, name } });
      }

      const newParticipants = state.participants.some((p) => p.id === userId)
        ? state.participants
        : [...state.participants, { id: userId, name }];

      return {
        participantCount,
        participants: newParticipants,
        stats: {
          ...state.stats,
          listeners: participantCount,
        },
      };
    });
  },

  handleUserLeft: (data) => {
    const { userId, participantCount } = data;

    set((state) => ({
      participantCount,
      participants: state.participants.filter((p) =>
        typeof p === "string" ? p !== userId : p.id !== userId
      ),
      stats: {
        ...state.stats,
        listeners: participantCount,
      },
    }));
  },

  updateParticipantCount: (count) =>
    set((state) => ({
      participantCount: count,
      stats: {
        ...state.stats,
        listeners: count,
      },
    })),

  setCurrentTrack: (track) => set({ currentTrack: track }),

  setAddToQueueTrack: (track) => { set({ addToQueueTrack: track }); },

  setQueue: (queue) =>
    set({
      queue,
      upNext: queue[0] || null,
      stats: {
        ...get().stats,
        inQueue: queue.length,
        estimatedWait: queue.length * 3,
      },
    }),

  /* Remove track from queue */
  removeTrackFromQueue: (trackId) =>
    set((state) => {
      const newQueue = state.queue.filter((track) => track.id !== trackId);
      return {
        queue: newQueue,
        upNext: newQueue[0] || null,
        stats: {
          ...state.stats,
          inQueue: newQueue.length,
          estimatedWait: newQueue.length * 3,
        },
      };
    }),

  updateSessionStatus: (status) => set({ sessionStatus: status }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

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
      currentUser: null,
      sessionStatus: "idle",
      currentTrack: null,
      queue: [],
      upNext: null,
      isPlaying: false,
      stats: {
        listeners: 0,
        inQueue: 0,
        estimatedWait: 0,
      },
    }),

  clearError: () => set({ joinError: null }),
}));

export default useLiveSessionStore;
