import { type ButtonHTMLAttributes } from 'react'

// ── Types ──────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  children: React.ReactNode
}

// ── Styles ─────────────────────────────────────────
const variantStyles: Record<ButtonVariant, string> = {
  primary:   'bg-[#1A3A6B] text-white hover:bg-[#15306A]',
  secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
  danger:    'bg-[#A32D2D] text-white hover:bg-[#8B2424]',
  ghost:     'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

// ── Component ──────────────────────────────────────
export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) => {
  return (
    <button
      disabled={disabled ?? isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium transition-colors
        disabled:opacity-60 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Cargando...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}