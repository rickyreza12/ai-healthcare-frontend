const BASE: string = import.meta.env?.VITE_API_URL ?? `${typeof window === 'undefined' ? 'http://localhost' : `${window.location.protocol}//${window.location.hostname}`}:8000`

export type User = { id: string; email: string; role: 'doctor' | 'nurse' }

export type MenuConfig = {
  lock_enabled: boolean
  allowed_keys: string[]
  default_key: string
}

export type MedicalRecord = {
  diagnoses: { icd10Code: string; description: string; recordedAt: string; clinician: string | null }[]
  medications: {
    name: string; dose: string | null; frequency: string | null; indication: string | null
    status: string; prescribedAt: string; prescriber: string | null
  }[]
  allergies: { substance: string; category: string; severity: string | null }[]
  vitals: {
    measuredAt: string; bloodPressure: string | null; heartRateBpm: number | null
    temperatureC: string | null; weightKg: string | null; fetalHeartRateBpm: number | null
  }[]
  soapNotes: {
    recordedAt: string; encounterType: string; clinician: string | null
    subjective: string | null; objective: string | null; assessment: string | null; plan: string | null
  }[]
  labResults: { testName: string; value: string; unit: string | null; resultedAt: string }[]
  procedures: { name: string; performedAt: string }[]
}

export type PatientAppointment = {
  id: string; occurredAt: string; title: string; department: string | null
  clinician: string | null; clinicianSpecialty: string | null; note: string; state: 'upcoming' | 'completed'
}

export type DoctorRef = { id: string; displayName: string; specialty: string; avatarUrl?: string | null }

export type PatientStatus = 'inpatient' | 'outpatient' | 'emergency' | 'follow_up'

export type Patient = {
  patientId: string
  patientNumber: string
  displayName: string
  dateOfBirth: string
  age: number
  gender: string
  room: string | null
  unit: string | null
  lastVisit: string | null
  status: PatientStatus
  avatarUrl?: string | null
  doctor: DoctorRef
}

export type EmergencyContact = { name: string; relationship: string; phone: string }

export type PatientDetail = Patient & {
  religion: string | null
  phone: string | null
  address: string | null
  emergencyContact: EmergencyContact | null
  overview: {
    condition: {
      title: string
      description: string
      lastVisitReason: string
      lastVisitAt: string
      careContext: string
      careContextNote: string
    }
    vitals: { label: string; value: string; unit: string; status: string; measuredAt: string }[]
    allergies: { name: string; kind: string; severity: 'high' | 'medium' | 'low' }[]
    medications: { name: string; dose: string; status: string }[]
    history: { occurredAt: string; title: string; note: string; clinician: DoctorRef }[]
  }
}

export type PatientPage = {
  page: number
  pageSize: number
  total: number
  totalPages: number
  statusCounts: { all: number; inpatient: number; outpatient: number; emergency: number; follow_up: number }
  filterOptions: { departments: string[] }
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
export type DoctorOption = { id: string; displayName: string; specialty: string }
export type PatientCreate = {
  patientCode: string; mrn: string; fullName: string; dateOfBirth: string; gender: 'female' | 'male' | 'other'
  religion?: string; phone?: string; address?: string; status: PatientStatus; room?: string; unit: string
  attendingClinicianId: string
}

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
    if (res.status === 401 && path !== '/api/auth/login') window.dispatchEvent(new Event('auth:unauthorized'))
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
  doctors: () => request<{ items: DoctorOption[] }>('/api/doctors'),

  patients: {
    create: (body: PatientCreate, idempotencyKey: string) => request<Patient>('/api/patients', {
      method: 'POST', json: body, headers: { 'Idempotency-Key': idempotencyKey },
    }),
    list: (params: {
      q?: string
      status?: string
      department?: string
      visitDate?: string
      page?: number
      pageSize?: number
    } = {}) => {
      const query = new URLSearchParams()
      if (params.q) query.set('q', params.q)
      if (params.status) query.set('status', params.status)
      if (params.department) query.set('department', params.department)
      if (params.visitDate) query.set('visitDate', params.visitDate)
      if (params.page) query.set('page', String(params.page))
      if (params.pageSize) query.set('pageSize', String(params.pageSize))
      const suffix = query.size ? `?${query.toString()}` : ''
      return request<PatientPage>(`/api/patients${suffix}`)
    },
    get: (patientId: string) =>
      request<PatientDetail>(`/api/patients/${encodeURIComponent(patientId)}`),
    medicalRecord: (patientId: string) =>
      request<MedicalRecord>(`/api/patients/${encodeURIComponent(patientId)}/medical-record`),
    appointments: (patientId: string) =>
      request<{ items: PatientAppointment[] }>(`/api/patients/${encodeURIComponent(patientId)}/appointments`),
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
