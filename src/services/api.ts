import axios from 'axios'
import type { LoginRequest, LoginResponse } from '../types'

// ── Instancia base ─────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Interceptor de request: agrega JWT ────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Interceptor de response: maneja errores ────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      globalThis.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth endpoints ─────────────────────────────────
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/auth/login', credentials)
    return data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    globalThis.location.href = '/login'
  },
}

export default api