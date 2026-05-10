// ── Roles ──────────────────────────────────────────
export type Role = 'student' | 'assistant' | 'admin'

// ── User ───────────────────────────────────────────
export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: Role
}

export interface Student extends User {
  studentCode: string
  cardHeldAsGuarantee: boolean
}

// ── Article ────────────────────────────────────────
export type ArticleStatus = 'available' | 'out_of_stock' | 'inactive'

export interface Article {
  id: number
  name: string
  description: string
  totalQuantity: number
  availableQuantity: number
  typeId: number
  typeName: string
  statusId: number
  status: ArticleStatus
}

// ── Reservation ────────────────────────────────────
export type ReservationStatus = 'active' | 'cancelled' | 'expired' | 'converted'

export interface Reservation {
  id: number
  startDate: string
  claimDeadline: string
  studentId: number
  studentName?: string
  articleId: number
  articleName?: string
  statusId: number
  status: ReservationStatus
}

// ── Loan ───────────────────────────────────────────
export type LoanStatus = 'active' | 'closed' | 'overdue'
export type ReturnedArticleStatus = 'good_condition' | 'poor_condition'

export interface Loan {
  id: number
  deliveryDate: string
  returnDeadline: string
  actualReturnDate?: string
  status: LoanStatus
  returnedArticleStatus?: ReturnedArticleStatus
  reservationId: number
  assistantId: number
  articleName?: string
  studentName?: string
}

// ── Sanction ───────────────────────────────────────
export type SanctionStatus = 'active' | 'closed'

export interface Sanction {
  id: number
  reason: string
  startDate: string
  closeDate?: string
  status: SanctionStatus
  loanId: number
  typeId: number
  typeName?: string
  studentId: number
  studentName?: string
}

// ── Audit Log ──────────────────────────────────────
export interface AuditLog {
  id: number
  action: string
  timestamp: string
  result: 'success' | 'failed'
  userId: number
  userName?: string
  userRole?: Role
}

// ── Auth ───────────────────────────────────────────
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

// ── Generic API responses ──────────────────────────
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