import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Role } from '../types'

// ── Auth state ─────────────────────────────────────
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // Actions
  setAuth: (user: User, token: string) => void
  clearAuth: () => void

  // Role helpers
  isStudent: () => boolean
  isAssistant: () => boolean
  isAdmin: () => boolean
  hasRole: (role: Role) => boolean
}

// ── Store ──────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      isStudent:   () => get().user?.role === 'student',
      isAssistant: () => get().user?.role === 'assistant',
      isAdmin:     () => get().user?.role === 'admin',
      hasRole:     (role) => get().user?.role === role,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)