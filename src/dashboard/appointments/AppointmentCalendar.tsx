import { SCHEDULE_DAYS, SCHEDULE_HOURS, type ScheduleAppointment, type ScheduleDayKey } from './appointmentScheduleData.ts'
import { appointmentRange, appointmentsForDay, blockOffset, blockSpan } from './appointmentScheduleLogic.ts'

export function eventLabel(appointment: ScheduleAppointment): string {
  return `Open ${appointment.start} appointment for ${appointment.patient}, ${appointment.visit}, ${appointment.room}`
}

type CalendarProps = {
  visible: readonly ScheduleAppointment[]
  selectedDay: ScheduleDayKey
  selectedId: string | null
  onSelectDay: (day: ScheduleDayKey) => void
  onSelect: (id: string) => void
}

/**
 * Week grid on wide screens and a day list on phones. Both render the same supplied
 * fixture, so filtering and selection stay identical across breakpoints.
 */
export function AppointmentCalendar({ visible, selectedDay, selectedId, onSelectDay, onSelect }: CalendarProps) {
  const dayAppointments = appointmentsForDay(visible, selectedDay)

  return (
    <>
      <div className="db-cal-scroll">
        <div className="db-cal">
          <div className="db-cal-head">
            <span className="db-cal-gutter" aria-hidden="true" />
            {SCHEDULE_DAYS.map((day) => (
              <div
                key={day.key}
                className={`db-cal-day${selectedDay === day.key ? ' db-cal-day--active' : ''}`}
                aria-current={selectedDay === day.key ? 'date' : undefined}
              >
                <span className="db-cal-day-name">{day.short}</span>
                <span className="db-cal-day-date">
                  {day.date}
                  {selectedDay !== day.key && <span className="db-cal-day-month"> {day.month}</span>}
                </span>
              </div>
            ))}
          </div>

          <div className="db-cal-body">
            <div className="db-cal-hours" aria-hidden="true">
              {SCHEDULE_HOURS.map((hour) => <span key={hour}>{hour}</span>)}
            </div>
            {SCHEDULE_DAYS.map((day) => (
              <div className="db-cal-col" key={day.key}>
                {appointmentsForDay(visible, day.key).map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    className={`db-cal-event db-cal-event--${appointment.tone}${selectedId === appointment.id ? ' db-cal-event--selected' : ''}`}
                    style={{ top: `${blockOffset(appointment) * 100}%`, height: `${blockSpan(appointment) * 100}%` }}
                    aria-pressed={selectedId === appointment.id}
                    aria-label={eventLabel(appointment)}
                    onClick={() => onSelect(appointment.id)}
                  >
                    <span className="db-cal-event-time">{appointmentRange(appointment)}</span>
                    <strong>{appointment.patient}</strong>
                    <span className="db-cal-event-visit">{appointment.visit}</span>
                    <span className="db-cal-event-room">{appointment.room}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="db-cal-mobile">
        <div className="db-cal-days" role="group" aria-label="Select a day">
          {SCHEDULE_DAYS.map((day) => (
            <button
              key={day.key}
              type="button"
              className={`db-cal-chip${selectedDay === day.key ? ' db-cal-chip--active' : ''}`}
              aria-pressed={selectedDay === day.key}
              onClick={() => onSelectDay(day.key)}
            >
              <span className="db-cal-chip-name">{day.short}</span>
              <span className="db-cal-chip-date">{day.date}</span>
            </button>
          ))}
        </div>

        {dayAppointments.length === 0 ? (
          <p className="db-sched-empty">No appointments on this day for the current filters.</p>
        ) : (
          <ul className="db-sched-list" role="list">
            {dayAppointments.map((appointment) => (
              <li key={appointment.id}>
                <button
                  type="button"
                  className={`db-sched-card db-sched-card--${appointment.tone}${selectedId === appointment.id ? ' db-sched-card--selected' : ''}`}
                  aria-pressed={selectedId === appointment.id}
                  aria-label={eventLabel(appointment)}
                  onClick={() => onSelect(appointment.id)}
                >
                  <span className="db-sched-card-time">{appointmentRange(appointment)}</span>
                  <strong>{appointment.patient}</strong>
                  <span className="db-sched-card-meta">{appointment.visit} • {appointment.room}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
