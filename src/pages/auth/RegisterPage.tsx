import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { authService } from '../../services/api'

// ── Validation schema ──────────────────────────────
const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z
    .email('Ingresa un correo institucional válido'),
  studentCode: z
    .string()
    .min(10, 'El código debe tener 10 caracteres')
    .max(10, 'El código debe tener 10 caracteres'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z
    .string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

// ── Component ──────────────────────────────────────
export const RegisterPage = () => {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      setServerError(null)
      await authService.register({
        firstName:   data.firstName,
        lastName:    data.lastName,
        email:       data.email,
        studentCode: data.studentCode,
        password:    data.password,
      })
      navigate('/login')
    } catch {
      setServerError('No se pudo crear la cuenta. Intenta de nuevo.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F1EFE8] flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#1A3A6B]">Crear cuenta</h1>
          <p className="text-gray-400 text-sm mt-1">Sistema de Préstamos — Bienestar</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* First name + Last name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre
              </label>
              <input
                id="firstName"
                {...register('firstName')}
                type="text"
                placeholder="Juan"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                  errors.firstName
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-[#1A3A6B]'
                }`}
              />
              {errors.firstName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Apellido
              </label>
              <input
                id="lastName"
                {...register('lastName')}
                type="text"
                placeholder="Pérez"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                  errors.lastName
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-[#1A3A6B]'
                }`}
              />
              {errors.lastName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

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

          {/* Student code */}
          <div>
            <label htmlFor="studentCode" className="block text-sm font-medium text-gray-700 mb-1.5">
              Código estudiantil
            </label>
            <input
              id="studentCode"
              {...register('studentCode')}
              type="text"
              placeholder="2022114051"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                errors.studentCode
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-200 focus:border-[#1A3A6B]'
              }`}
            />
            {errors.studentCode && (
              <p className="mt-1.5 text-xs text-red-500">{errors.studentCode.message}</p>
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

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              {...register('confirmPassword')}
              type="password"
              placeholder="••••••••"
              className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors ${
                errors.confirmPassword
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-200 focus:border-[#1A3A6B]'
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
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
              hover:bg-[#15306A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

        </form>

        {/* Login link */}
        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-[#1A3A6B] font-medium hover:underline">
            Inicia sesión
          </a>
        </p>

      </div>
    </div>
  )
}