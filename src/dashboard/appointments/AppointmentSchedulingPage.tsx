import { useCallback, useRef, useState } from 'react'
import { NoticeDialog, type Notice } from '../NoticeDialog.tsx'
import { PANEL_GLYPH } from '../DashboardPrimitives.tsx'
import { AppointmentCalendar } from './AppointmentCalendar.tsx'
import { PatientDetailPanel, UpcomingPanel } from './AppointmentSidePanel.tsx'
import {
  DEFAULT_SELECTED_APPOINTMENT_ID,
  DEFAULT_SELECTED_DAY,
  REFERENCE_APPOINTMENT_DETAIL,
  SCHEDULE_APPOINTMENTS,
  SCHEDULE_RANGE_LABEL,
  UPCOMING_APPOINTMENTS,
  type ScheduleDayKey,
} from './appointmentScheduleData.ts'
import {
  ALL_CLINICS,
  ALL_DOCTORS,
  ALL_TYPES,
  DEFAULT_SCHEDULE_FILTERS,
  filterAppointments,
  filterUpcoming,
  findScheduleAppointment,
  scheduleClinics,
  scheduleDoctors,
  scheduleTypes,
  type ScheduleFilters,
} from './appointmentScheduleLogic.ts'

const CLINICS = scheduleClinics(SCHEDULE_APPOINTMENTS)
const DOCTORS = scheduleDoctors(SCHEDULE_APPOINTMENTS)
const TYPES = scheduleTypes(SCHEDULE_APPOINTMENTS)

const PLUS_GLYPH = (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
)

const RESET_GLYPH = (
  <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4.5 5.5v5h5" />
    <path d="M5.8 14.6a7 7 0 1 0 1.1-6.9L4.5 10.5" />
  </svg>
)

const PREV_GLYPH = (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </svg>
)

const NEXT_GLYPH = (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9.5 5.5 16 12l-6.5 6.5" />
  </svg>
)

/** The reference draws Day and Month views that the supplied fixtures do not cover. */
const VIEWS = ['Day', 'Week', 'Month'] as const

export function AppointmentSchedulingPage() {
  const [filters, setFilters] = useState<ScheduleFilters>(DEFAULT_SCHEDULE_FILTERS)
  const [selectedDay, setSelectedDay] = useState<ScheduleDayKey>(DEFAULT_SELECTED_DAY)
  const [selectedId, setSelectedId] = useState<string | null>(DEFAULT_SELECTED_APPOINTMENT_ID)
  const [notice, setNotice] = useState<Notice | null>(null)
  const calendarRef = useRef<HTMLHeadingElement>(null)

  const visible = filterAppointments(SCHEDULE_APPOINTMENTS, filters)
  const upcoming = filterUpcoming(UPCOMING_APPOINTMENTS, visible)
  const selected = selectedId ? findScheduleAppointment(SCHEDULE_APPOINTMENTS, selectedId) : undefined

  function applyFilters(patch: Partial<ScheduleFilters>) {
    setFilters((current) => ({ ...current, ...patch }))
  }

  function selectAppointment(id: string) {
    setSelectedId(id)
    const appointment = findScheduleAppointment(SCHEDULE_APPOINTMENTS, id)
    if (appointment) setSelectedDay(appointment.day)
  }

  const resetAndFocusCalendar = useCallback(() => {
    setFilters(DEFAULT_SCHEDULE_FILTERS)
    setSelectedDay(DEFAULT_SELECTED_DAY)
    calendarRef.current?.focus()
  }, [])

  return (
    <div className="db-sched">
      <div className="db-sched-head">
        <span className="db-sched-mark" aria-hidden="true">{PANEL_GLYPH.calendar}</span>
        <div className="db-sched-heading">
          <h1 className="db-sched-title">Appointments &amp; Scheduling</h1>
          <p className="db-sched-sub">Manage appointments, view schedules, and provide better care for your patients.</p>
        </div>
        <button
          type="button"
          className="db-btn-primary"
          onClick={() => setNotice({
            title: 'Appointment creation is not available in this reference demo.',
            body: 'This workspace renders supplied reference appointments. Booking a new appointment needs an approved scheduling workflow and backend, which this demo does not include.',
          })}
        >
          {PLUS_GLYPH}
          New Appointment
        </button>
      </div>

      <div className="db-sched-body">
        <section className="db-sched-calendar" aria-labelledby="db-sched-calendar-title">
          <div className="db-sched-toolbar">
            <div className="db-sched-views" role="group" aria-label="Schedule view">
              {VIEWS.map((view) => (
                <button
                  key={view}
                  type="button"
                  className={`db-sched-view${view === 'Week' ? ' db-sched-view--active' : ''}`}
                  aria-pressed={view === 'Week'}
                  onClick={() => {
                    if (view === 'Week') return
                    setNotice({ title: `${view} view is not available in this reference demo.`, body: 'Only the supplied week of reference appointments is rendered here.' })
                  }}
                >
                  {view}
                </button>
              ))}
            </div>

            <div className="db-sched-weeknav">
              <button
                type="button"
                className="db-sched-step"
                aria-label="Previous week, unavailable in this reference demo"
                onClick={() => setNotice({ title: 'Other weeks are not available in this reference demo.', body: `Only the supplied range ${SCHEDULE_RANGE_LABEL} is rendered here.` })}
              >
                {PREV_GLYPH}
              </button>
              <p className="db-sched-range">{SCHEDULE_RANGE_LABEL}</p>
              <button
                type="button"
                className="db-sched-step"
                aria-label="Next week, unavailable in this reference demo"
                onClick={() => setNotice({ title: 'Other weeks are not available in this reference demo.', body: `Only the supplied range ${SCHEDULE_RANGE_LABEL} is rendered here.` })}
              >
                {NEXT_GLYPH}
              </button>
            </div>

            <label className="db-field db-sched-field">
              <span className="db-field-label">Clinic</span>
              <select className="db-select" value={filters.clinic} onChange={(event) => applyFilters({ clinic: event.target.value })}>
                <option value={ALL_CLINICS}>All Clinics</option>
                {CLINICS.map((clinic) => <option key={clinic} value={clinic}>{clinic}</option>)}
              </select>
            </label>

            <label className="db-field db-sched-field">
              <span className="db-field-label">Doctor</span>
              <select className="db-select" value={filters.doctor} onChange={(event) => applyFilters({ doctor: event.target.value })}>
                <option value={ALL_DOCTORS}>All Doctors</option>
                {DOCTORS.map((doctor) => <option key={doctor} value={doctor}>{doctor}</option>)}
              </select>
            </label>

            <label className="db-field db-sched-field">
              <span className="db-field-label">Appointment type</span>
              <select className="db-select" value={filters.type} onChange={(event) => applyFilters({ type: event.target.value })}>
                <option value={ALL_TYPES}>All Appointment Types</option>
                {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>

            <button
              type="button"
              className="db-clear-filters db-sched-clear"
              onClick={() => setFilters(DEFAULT_SCHEDULE_FILTERS)}
              aria-label="Clear filters"
            >
              {RESET_GLYPH}
            </button>
          </div>

          <h2 id="db-sched-calendar-title" className="sr-only" tabIndex={-1} ref={calendarRef}>
            Weekly schedule, {SCHEDULE_RANGE_LABEL}
          </h2>
          {visible.length === 0 ? (
            <div className="db-sched-empty-panel">
              <p className="db-sched-empty-title">No appointments match these filters.</p>
              <p className="db-sched-empty-text">
                This view shows {SCHEDULE_APPOINTMENTS.length} sample appointments. Adjust the filters or clear them to see
                every sample record.
              </p>
              <button type="button" className="db-clear-filters" onClick={() => setFilters(DEFAULT_SCHEDULE_FILTERS)}>
                {RESET_GLYPH}
                Clear filters
              </button>
            </div>
          ) : (
            <AppointmentCalendar
              visible={visible}
              selectedDay={selectedDay}
              selectedId={selectedId}
              onSelectDay={setSelectedDay}
              onSelect={selectAppointment}
            />
          )}
        </section>

        <div className="db-sched-rail">
          <UpcomingPanel
            rows={upcoming}
            selectedId={selectedId}
            onSelect={selectAppointment}
            onViewAll={resetAndFocusCalendar}
          />
          <PatientDetailPanel
            appointment={selected}
            detail={REFERENCE_APPOINTMENT_DETAIL}
            onEdit={() => setNotice({
              title: 'Appointment editing is not available in this reference demo.',
              body: 'This workspace renders supplied reference appointments. Editing needs an approved scheduling workflow and backend, which this demo does not include.',
            })}
            onReschedule={() => setNotice({
              title: 'Rescheduling is not available in this reference demo.',
              body: 'This workspace renders supplied reference appointments. Moving an appointment needs an approved scheduling workflow and backend, which this demo does not include.',
            })}
            onViewProfile={() => setNotice({
              title: 'A matching patient profile is not available for this reference appointment.',
              body: 'The reference shows a patient identifier that the current patient records already use for another person, so this demo does not link to a profile.',
            })}
          />
        </div>
      </div>

      <p className="db-sched-foot">
        Reference demo: the {SCHEDULE_APPOINTMENTS.length} appointments and {UPCOMING_APPOINTMENTS.length} upcoming rows are
        supplied sample data, not live scheduling. Weekday labels follow the reference copy.
      </p>

      <NoticeDialog notice={notice} onClose={() => setNotice(null)} />
    </div>
  )
}
