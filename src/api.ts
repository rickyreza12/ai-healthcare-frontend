const BASE: string = import.meta.env?.VITE_API_URL ?? 'http://127.0.0.1:8000'

export type User = { id: number; email: string }

export type MenuConfig = {
  lock_enabled: boolean
  allowed_keys: string[]
  default_key: string
}

export type DoctorRef = { displayName: string; specialty: string }

export type Patient = {
  patientId: string
  displayName: string
  age: number
  gender: string
  room: string
  unit: string
  lastVisit: string
  status: string
  doctor: DoctorRef
}

export type PatientDetail = Patient & {
  patientNumber: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export type PatientPage = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  statusCounts: Record<string, number>
  filterOptions: { departments: string[]; visitDates: string[] }
  items: Patient[]
}

export type AppointmentStatus = 'scheduled' | 'cancelled'

export type Appointment = {
  appointmentId: string
  patientId: string
  patientName: string
  date: string
  startTime: string
  endTime: string
  timeZone: string
  visitType: string
  clinician: string
  clinic: string
  room: string
  status: AppointmentStatus
  cancellationReason: string | null
  version: number
  createdAt: string
  updatedAt: string
}

export type AppointmentPage = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  timeZone: string
  filterOptions: { clinics: string[]; doctors: string[]; visitTypes: string[] }
  items: Appointment[]
}

export type AppointmentInput = {
  patientId: string
  clinician: string
  clinic: string
  room: string
  visitType: string
  date: string
  startTime: string
  endTime: string
}

export type AppointmentPatch = Partial<Omit<AppointmentInput, 'patientId'>> & { version: number }

export type FieldError = { field: string; code: string; message: string }

export class ApiError extends Error {
  status: number
  code: string | undefined
  fieldErrors: FieldError[]
  constructor(status: number, message: string, code?: string, fieldErrors: FieldError[] = []) {
    super(message)
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Cannot reach the server. Check that the backend is running and try again.')
  }
}

export async function request<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init
  let res: Response
  try {
    res = await fetch(BASE + path, {
      credentials: 'include',
      ...rest,
      headers:
        json === undefined
          ? headers
          : { ...(headers as Record<string, string> | undefined), 'Content-Type': 'application/json' },
      body: json === undefined ? undefined : JSON.stringify(json),
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error
    throw new NetworkError()
  }
  const data: unknown = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    const problem = (data ?? {}) as { detail?: unknown; code?: unknown; message?: unknown; fieldErrors?: unknown }
    const detail = problem.detail
    const message =
      typeof problem.message === 'string'
        ? problem.message
        : typeof detail === 'string'
          ? detail
          : 'Request failed.'
    const code = typeof problem.code === 'string' ? problem.code : undefined
    const fieldErrors = Array.isArray(problem.fieldErrors) ? (problem.fieldErrors as FieldError[]) : []
    throw new ApiError(res.status, message, code, fieldErrors)
  }
  return data as T
}

export const api = {
  me: () => request<User>('/api/auth/me'),
  login: (email: string, password: string, remember: boolean) =>
    request<User>('/api/auth/login', { method: 'POST', json: { email: email.trim(), password, remember } }),
  logout: () => request<null>('/api/auth/logout', { method: 'POST' }),
  menu: () => request<MenuConfig>('/api/menu'),

  patients: {
    list: (params: { q?: string; status?: string; page?: number; pageSize?: number } = {}) => {
      const query = new URLSearchParams()
      if (params.q) query.set('q', params.q)
      if (params.status) query.set('status', params.status)
      if (params.page) query.set('page', String(params.page))
      if (params.pageSize) query.set('pageSize', String(params.pageSize))
      const suffix = query.size ? `?${query.toString()}` : ''
      return request<PatientPage>(`/api/patients${suffix}`)
    },
    get: (patientId: string) =>
      request<PatientDetail>(`/api/patients/${encodeURIComponent(patientId)}`),
  },

  appointments: {
    list: (params: { status?: AppointmentStatus; page?: number; pageSize?: number } = {}) => {
      const query = new URLSearchParams()
      if (params.status) query.set('status', params.status)
      if (params.page) query.set('page', String(params.page))
      if (params.pageSize) query.set('pageSize', String(params.pageSize))
      const suffix = query.size ? `?${query.toString()}` : ''
      return request<AppointmentPage>(`/api/appointments${suffix}`)
    },
    get: (appointmentId: string) =>
      request<Appointment>(`/api/appointments/${encodeURIComponent(appointmentId)}`),
    create: (body: AppointmentInput, idempotencyKey: string) =>
      request<Appointment>('/api/appointments', {
        method: 'POST',
        json: body,
        headers: { 'Idempotency-Key': idempotencyKey },
      }),
    reschedule: (appointmentId: string, body: AppointmentPatch) =>
      request<Appointment>(`/api/appointments/${encodeURIComponent(appointmentId)}`, {
        method: 'PATCH',
        json: body,
      }),
    cancel: (appointmentId: string, version: number, reason: string) =>
      request<Appointment>(`/api/appointments/${encodeURIComponent(appointmentId)}/cancel`, {
        method: 'POST',
        json: { version, reason },
      }),
  },
}
