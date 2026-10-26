import type { FormErrors, AppointmentFormValues } from './appointmentInputLogic.ts'

export type AppointmentOptions = {
  patients: readonly { patientId: string; displayName: string }[]
  clinicians: readonly string[]
  clinics: readonly string[]
  visitTypes: readonly string[]
}

type Props = {
  idPrefix: string
  values: AppointmentFormValues
  errors: FormErrors
  options: AppointmentOptions
  disabled: boolean
  lockPatient?: boolean
  onChange: (key: keyof AppointmentFormValues, value: string) => void
}

function errorId(prefix: string, key: string): string {
  return `${prefix}-${key}-error`
}

export function AppointmentFields({ idPrefix, values, errors, options, disabled, lockPatient, onChange }: Props) {
  return (
    <div className="di-form-grid">
      <div className="di-field di-field--wide">
        <label className="di-field-label" htmlFor={`${idPrefix}-patient`}>Patient</label>
        <select
          id={`${idPrefix}-patient`}
          className="di-select"
          value={values.patientId}
          disabled={disabled || lockPatient}
          aria-invalid={Boolean(errors.patientId)}
          aria-describedby={errors.patientId ? errorId(idPrefix, 'patientId') : undefined}
          onChange={(event) => onChange('patientId', event.target.value)}
        >
          <option value="">Choose a patient</option>
          {options.patients.map((patient) => (
            <option key={patient.patientId} value={patient.patientId}>
              {patient.displayName} ({patient.patientId})
            </option>
          ))}
        </select>
        {errors.patientId && <p className="di-field-error" id={errorId(idPrefix, 'patientId')}>{errors.patientId}</p>}
      </div>

      <div className="di-field">
        <label className="di-field-label" htmlFor={`${idPrefix}-clinician`}>Clinician</label>
        <select
          id={`${idPrefix}-clinician`}
          className="di-select"
          value={values.clinician}
          disabled={disabled}
          aria-invalid={Boolean(errors.clinician)}
          aria-describedby={errors.clinician ? errorId(idPrefix, 'clinician') : undefined}
          onChange={(event) => onChange('clinician', event.target.value)}
        >
          <option value="">Choose a clinician</option>
          {options.clinicians.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        {errors.clinician && <p className="di-field-error" id={errorId(idPrefix, 'clinician')}>{errors.clinician}</p>}
      </div>

      <div className="di-field">
        <label className="di-field-label" htmlFor={`${idPrefix}-clinic`}>Clinic</label>
        <select
          id={`${idPrefix}-clinic`}
          className="di-select"
          value={values.clinic}
          disabled={disabled}
          aria-invalid={Boolean(errors.clinic)}
          aria-describedby={errors.clinic ? errorId(idPrefix, 'clinic') : undefined}
          onChange={(event) => onChange('clinic', event.target.value)}
        >
          <option value="">Choose a clinic</option>
          {options.clinics.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        {errors.clinic && <p className="di-field-error" id={errorId(idPrefix, 'clinic')}>{errors.clinic}</p>}
      </div>

      <div className="di-field">
        <label className="di-field-label" htmlFor={`${idPrefix}-visit`}>Visit type</label>
        <select
          id={`${idPrefix}-visit`}
          className="di-select"
          value={values.visitType}
          disabled={disabled}
          aria-invalid={Boolean(errors.visitType)}
          aria-describedby={errors.visitType ? errorId(idPrefix, 'visitType') : undefined}
          onChange={(event) => onChange('visitType', event.target.value)}
        >
          <option value="">Choose a visit type</option>
          {options.visitTypes.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        {errors.visitType && <p className="di-field-error" id={errorId(idPrefix, 'visitType')}>{errors.visitType}</p>}
      </div>

      <div className="di-field">
        <label className="di-field-label" htmlFor={`${idPrefix}-room`}>Room</label>
        <input
          id={`${idPrefix}-room`}
          className="di-input"
          value={values.room}
          disabled={disabled}
          aria-invalid={Boolean(errors.room)}
          aria-describedby={errors.room ? errorId(idPrefix, 'room') : undefined}
          onChange={(event) => onChange('room', event.target.value)}
        />
        {errors.room && <p className="di-field-error" id={errorId(idPrefix, 'room')}>{errors.room}</p>}
      </div>

      <div className="di-field">
        <label className="di-field-label" htmlFor={`${idPrefix}-date`}>Date</label>
        <input
          id={`${idPrefix}-date`}
          type="date"
          className="di-input"
          value={values.date}
          disabled={disabled}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? errorId(idPrefix, 'date') : undefined}
          onChange={(event) => onChange('date', event.target.value)}
        />
        {errors.date && <p className="di-field-error" id={errorId(idPrefix, 'date')}>{errors.date}</p>}
      </div>

      <div className="di-field">
        <label className="di-field-label" htmlFor={`${idPrefix}-start`}>Start time</label>
        <input
          id={`${idPrefix}-start`}
          type="time"
          className="di-input"
          value={values.startTime}
          disabled={disabled}
          aria-invalid={Boolean(errors.startTime)}
          aria-describedby={errors.startTime ? errorId(idPrefix, 'startTime') : undefined}
          onChange={(event) => onChange('startTime', event.target.value)}
        />
        {errors.startTime && <p className="di-field-error" id={errorId(idPrefix, 'startTime')}>{errors.startTime}</p>}
      </div>

      <div className="di-field">
        <label className="di-field-label" htmlFor={`${idPrefix}-end`}>End time</label>
        <input
          id={`${idPrefix}-end`}
          type="time"
          className="di-input"
          value={values.endTime}
          disabled={disabled}
          aria-invalid={Boolean(errors.endTime)}
          aria-describedby={errors.endTime ? errorId(idPrefix, 'endTime') : undefined}
          onChange={(event) => onChange('endTime', event.target.value)}
        />
        {errors.endTime && <p className="di-field-error" id={errorId(idPrefix, 'endTime')}>{errors.endTime}</p>}
      </div>
    </div>
  )
}
