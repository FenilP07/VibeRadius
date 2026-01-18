import { create } from "zustand";

// UI Store to manage theme settings
const useUIStore = create((set) => ({
    theme: 'light',
    toggleTheme: () => set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light'
    })),
    setTheme: (theme) => set({ theme }),

    // Alerts/Notifications
    alerts: [],
    addAlert: (alert) => set((state) => ({
        alerts: [...state.alerts, { id: Date.now(), ...alert }]
    })),

    removeAlert: (id) => set((state) => ({
        alerts: state.alerts.filter((alert) => alert.id !== id)
    })),
    clearAlerts: () => set({ alerts: [] }),

    // Loading State
    globalLoading: false,
    setGlobalLoading: (isLoading) => set({ globalLoading: isLoading }),

    // Modals
    modals: {},
    openModal: (name) => set((state) => ({
        modals: { ...state.modals, [name]: true }
    })),
    closeModal: (name) => set((state) => ({
        modals: { ...state.modals, [name]: false }
    })),

}));

export default useUIStore;
