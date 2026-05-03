// ── Roles ──────────────────────────────────────────
export type Rol = 'estudiante' | 'auxiliar' | 'administrador'

// ── Usuario ────────────────────────────────────────
export interface Usuario {
  id_persona: number
  nombre: string
  apellido: string
  email: string
  rol: Rol
}

export interface Estudiante extends Usuario {
  codigo_estudiantil: string
  carnet_en_garantia: boolean
}

// ── Artículo ───────────────────────────────────────
export interface Articulo {
  id_articulo: number
  nombre: string
  descripcion: string
  cantidad_total: number
  cantidad_disponible: number
  id_tipo: number
  tipo_nombre: string
  id_estado: number
  estado_nombre: 'disponible' | 'agotado' | 'inactivo'
}

// ── Reserva ────────────────────────────────────────
export type EstadoReserva = 'activa' | 'cancelada' | 'expirada' | 'convertida'

export interface Reserva {
  id_reserva: number
  fecha_inicio: string
  fecha_limite_reclamo: string
  id_estudiante: number
  estudiante_nombre?: string
  id_articulo: number
  articulo_nombre?: string
  id_estado: number
  estado: EstadoReserva
}

// ── Préstamo ───────────────────────────────────────
export type EstadoPrestamo = 'activo' | 'cerrado' | 'vencido'
export type EstadoArticuloDevuelto = 'buen_estado' | 'mal_estado'

export interface Prestamo {
  id_prestamo: number
  fecha_entrega: string
  fecha_limite_devolucion: string
  fecha_devolucion_real?: string
  estado: EstadoPrestamo
  estado_articulo_devuelto?: EstadoArticuloDevuelto
  id_reserva: number
  id_auxiliar: number
  articulo_nombre?: string
  estudiante_nombre?: string
}

// ── Sanción ────────────────────────────────────────
export type EstadoSancion = 'activa' | 'cerrada'

export interface Sancion {
  id_penalizacion: number
  motivo: string
  fecha_inicio: string
  fecha_cierre?: string
  estado: EstadoSancion
  id_prestamo: number
  id_tipo: number
  tipo_nombre?: string
  id_estudiante: number
  estudiante_nombre?: string
}

// ── Log de auditoría ───────────────────────────────
export interface LogAuditoria {
  id_log: number
  accion: string
  fecha_hora: string
  resultado: 'exitoso' | 'fallido'
  id_persona: number
  usuario_nombre?: string
  usuario_rol?: Rol
}

// ── Auth ───────────────────────────────────────────
export interface LoginRequest {
  email: string
  contrasena: string
}

export interface LoginResponse {
  token: string
  usuario: Usuario
}

// ── API responses genéricas ────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}