import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService } from '../services/authService.js'

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Actions
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            clearError: () => set({ error: null }),

            // Registger
            register: async (userData) => {
                try {
                    set({ isLoading: true, error: null });
                    const response = await authService.register(userData);
                    const { user } = response.data;
                    set({ user, isAuthenticated: true, isLoading: false });
                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || "Registration failed";
                    set({ error: message, isLoading: false });
                    return { success: false, error: message };
                }
            },

            // Login 
            login: async (credentials) => {
                try {
                    set({ isLoading: true, error: null });

                    // Backend calls
                    const response = await authService.login(credentials);
                    const { user } = response.data;

                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    return { success: true };
                } catch (error) {
                    const errormessage = error.response?.data?.messsage || 'Login failed';
                    set({
                        error: errormessage,
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    return { success: false, error: errormessage };
                }
            },

            // Logout
            logout: async () => {
                try {
                    await authService.logout();
                } catch (error) {
                    console.error("Logout failed:", error);
                } finally {
                    set({
                        user: null,
                        isAuthenticated: false,
                        error: null,
                    });
                }
            },

            // Verify/Refresh Token
            verifyToken: async () => {
                try {
                    const response = await authService.verifyToken();
                    const { user } = response.data;

                    set({ user, isAuthenticated: true });
                    return true;
                } catch (error) {
                    get().logout();
                    return false;
                }
            },

            updateUser: (userData) => set((state) => ({
                user: { ...state.user, ...userData }
            })),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
)

export default useAuthStore;