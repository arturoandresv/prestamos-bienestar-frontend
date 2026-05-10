import axios from 'axios'
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types'

// ── Base instance ──────────────────────────────────
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Request interceptor: attach JWT ───────────────
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

// ── Response interceptor: handle errors ───────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
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

  register: async (payload: RegisterRequest): Promise<void> => {
    await api.post('/auth/register', payload)
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    globalThis.location.href = '/login'
  },
}