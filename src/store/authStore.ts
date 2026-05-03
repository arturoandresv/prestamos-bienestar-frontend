import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario, Rol } from '../types'

// ── Tipos del store ────────────────────────────────
interface AuthState {
  usuario: Usuario | null
  token: string | null
  isAuthenticated: boolean

  // Acciones
  setAuth: (usuario: Usuario, token: string) => void
  clearAuth: () => void

  // Helpers de rol
  isEstudiante: () => boolean
  isAuxiliar: () => boolean
  isAdmin: () => boolean
  hasRole: (rol: Rol) => boolean
}

// ── Store ──────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      token: null,
      isAuthenticated: false,

      setAuth: (usuario, token) => {
        localStorage.setItem('token', token)
        set({ usuario, token, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem('token')
        set({ usuario: null, token: null, isAuthenticated: false })
      },

      isEstudiante: () => get().usuario?.rol === 'estudiante',
      isAuxiliar: () => get().usuario?.rol === 'auxiliar',
      isAdmin: () => get().usuario?.rol === 'administrador',
      hasRole: (rol) => get().usuario?.rol === rol,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        usuario: state.usuario,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)