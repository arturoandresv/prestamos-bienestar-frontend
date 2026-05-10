import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authService } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import type { Role } from '../../types'

// ── Validation schema ──────────────────────────────
const loginSchema = z.object({
  email: z
    .email('Ingresa un correo válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

// ── Redirect by role ───────────────────────────────
const redirectByRole: Record<Role, string> = {
  student:   '/catalog',
  assistant: '/dashboard',
  admin:     '/admin/users',
}

// ── Component ──────────────────────────────────────
export const LoginPage = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      setServerError(null)
      const response = await authService.login(data)
      setAuth(response.user, response.token)
      navigate(redirectByRole[response.user.role], { replace: true })
    } catch {
      setServerError('Correo o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-screen bg-[#F1EFE8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#1A3A6B]">Bienestar</h1>
          <p className="text-gray-400 text-sm mt-1">Sistema de Préstamos</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Correo institucional
            </label>
            <input
              id="email"
              {...register('email')}
              type="email"
              placeholder="usuario@unimagdalena.edu.co"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                errors.email
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-200 focus:border-[#1A3A6B]'
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña
            </label>
            <input
              id="password"
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                errors.password
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-200 focus:border-[#1A3A6B]'
              }`}
            />
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#1A3A6B] text-white py-2.5 rounded-lg text-sm font-medium
              hover:bg-[#15306A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

        </form>

        {/* Register link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          ¿No tienes cuenta?{' '}
          <a href="/register" className="text-[#1A3A6B] font-medium hover:underline">
            Regístrate
          </a>
        </p>

      </div>
    </div>
  )
}