import { useRef, type ReactNode, type RefObject } from 'react'
import { PANEL_GLYPH } from '../DashboardPrimitives.tsx'
import { slugify } from '../dashboardData.ts'
import { CHECKLIST_ICONS, FETUS_GLYPH, MATERNAL_ICONS, MATERNITY_GLYPHS } from './maternityGlyphs.tsx'
import {
  BABY_DEVELOPMENT,
  DOCTOR_NOTE,
  LATEST_ULTRASOUND,
  MATERNAL_HEALTH,
  NEXT_APPOINTMENT,
  PRENATAL_CHECKLIST,
  PREGNANCY_PROGRESS,
  type MaternalMetric,
  type PrenatalChecklistItem,
} from './maternityData.ts'
import { progressPercent } from './maternityLogic.ts'

import iconPregnancyProgress from '../../assets/dashboard/maternity/icon_pregnancy_progress.png'
import iconMaternalHealth from '../../assets/dashboard/maternity/icon_maternal_health.png'
import iconBabyDevelopment from '../../assets/dashboard/maternity/icon_baby_development.png'
import iconLatestUltrasound from '../../assets/dashboard/maternity/icon_latest_ultrasound.png'
import iconNextAppointment from '../../assets/dashboard/maternity/icon_next_appointment.png'
import iconPrenatalChecklist from '../../assets/dashboard/maternity/icon_prenatal_checklist.png'
import iconDoctorNotes from '../../assets/dashboard/maternity/icon_doctor_notes.png'
import babyArt from '../../assets/dashboard/maternity/maternity_baby_development.png'
import ultrasound from '../../assets/dashboard/maternity/maternity_ultrasound_32w4d.png'
import doctorAvatar from '../../assets/dashboard/maternity/maternity_doctor_avatar.png'

export const SECTION_ICONS = {
  pregnancyProgress: iconPregnancyProgress,
  maternalHealth: iconMaternalHealth,
  babyDevelopment: iconBabyDevelopment,
  latestUltrasound: iconLatestUltrasound,
  nextAppointment: iconNextAppointment,
  prenatalChecklist: iconPrenatalChecklist,
  doctorNotes: iconDoctorNotes,
}

export const MATERNITY_ART = { babyArt, ultrasound, doctorAvatar }

export type MaternityHandlers = {
  /** Every visible chevron or link control explains what this reference demo does not include. */
  onUnavailable: (title: string, body?: string) => void
  onOpenAppointment: () => void
  onOpenChecklistItem: (item: PrenatalChecklistItem) => void
  onOpenUltrasound: () => void
  onOpenNotes: () => void
}

function CardHead({ id, title, icon, action }: {
  id: string
  title: string
  icon: string
  action?: ReactNode
}) {
  return (
    <div className="db-mat-head">
      <img src={icon} alt="" width={32} height={32} className="db-mat-head-icon" />
      <h2 id={id}>{title}</h2>
      {action}
    </div>
  )
}

function MoreButton({ label, onSelect }: { label: string; onSelect: () => void }) {
  return (
    <button type="button" className="db-mat-more" onClick={onSelect}>
      <span aria-hidden="true">{MATERNITY_GLYPHS.chevron}</span>
      <span className="sr-only">{label}</span>
    </button>
  )
}

function ProgressCard({ id, handlers }: { id: string; handlers: MaternityHandlers }) {
  const percent = progressPercent(PREGNANCY_PROGRESS.currentWeek, PREGNANCY_PROGRESS.totalWeeks)
  return (
    <section className="db-panel db-mat-card" aria-labelledby={id}>
      <CardHead
        id={id}
        title="Pregnancy Progress"
        icon={SECTION_ICONS.pregnancyProgress}
        action={<MoreButton label="Pregnancy progress details" onSelect={() => handlers.onUnavailable('Pregnancy progress details')} />}
      />
      <div className="db-mat-progress">
        <span className="db-mat-fetus" aria-hidden="true">{FETUS_GLYPH}</span>
        <div className="db-mat-progress-text">
          <p className="db-mat-progress-value">{PREGNANCY_PROGRESS.gestationalAge}</p>
          <p className="db-mat-progress-tri">{PREGNANCY_PROGRESS.trimester}</p>
        </div>
      </div>
      <p className="db-mat-edd">
        {PREGNANCY_PROGRESS.estimatedDueDate} <span>{PREGNANCY_PROGRESS.countdown}</span>
      </p>
      <div
        className="db-mat-bar"
        role="img"
        aria-label={`Pregnancy progress: ${PREGNANCY_PROGRESS.gestationalAge} of ${PREGNANCY_PROGRESS.totalWeeks} weeks`}
      >
        <span className="db-mat-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <ul className="db-mat-scale">
        {PREGNANCY_PROGRESS.scale.map((step) => (
          <li key={step.week}>
            <span className="db-mat-scale-week">{step.week}</span>
            <span className="db-mat-scale-label">{step.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function MetricTile({ metric }: { metric: MaternalMetric }) {
  return (
    <li className={`db-mat-metric db-mat-metric--${metric.tone}`}>
      <span className="db-mat-metric-icon" aria-hidden="true">{MATERNAL_ICONS[metric.icon]}</span>
      <span className="db-mat-metric-text">
        <span className="db-mat-metric-value">
          {metric.value} <em>{metric.unit}</em>
        </span>
        <span className="db-mat-metric-label">{metric.label}</span>
        {metric.supporting && (
          <span className="db-mat-metric-support">
            <strong>{metric.supporting}</strong>
            <span>{metric.supportingLabel}</span>
          </span>
        )}
      </span>
    </li>
  )
}

function MaternalHealthCard({ id, handlers }: { id: string; handlers: MaternityHandlers }) {
  return (
    <section className="db-panel db-mat-card" aria-labelledby={id}>
      <CardHead
        id={id}
        title="Maternal Health"
        icon={SECTION_ICONS.maternalHealth}
        action={<MoreButton label="Maternal health details" onSelect={() => handlers.onUnavailable('Maternal health history')} />}
      />
      <ul className="db-mat-metrics">
        {MATERNAL_HEALTH.map((metric) => <MetricTile key={metric.id} metric={metric} />)}
      </ul>
    </section>
  )
}

function BabyDevelopmentCard({ id, handlers }: { id: string; handlers: MaternityHandlers }) {
  return (
    <section className="db-panel db-mat-card" aria-labelledby={id}>
      <CardHead
        id={id}
        title="Baby's Development"
        icon={SECTION_ICONS.babyDevelopment}
        action={<MoreButton label="Baby development details" onSelect={() => handlers.onUnavailable('Baby development details')} />}
      />
      <div className="db-mat-baby">
        <img
          src={babyArt}
          alt="Illustration of a baby at 32 weeks of pregnancy"
          width={160}
          height={164}
          className="db-mat-baby-art"
        />
        <div className="db-mat-baby-text">
          <p className="db-mat-baby-lead">
            {BABY_DEVELOPMENT.headline} <strong>{BABY_DEVELOPMENT.headlineEmphasis}</strong>
          </p>
          <p className="db-mat-baby-body">{BABY_DEVELOPMENT.body}</p>
          <ul className="db-mat-measures">
            {BABY_DEVELOPMENT.measures.map((measure) => (
              <li key={measure.id}>
                <span className={`db-mat-measure-icon db-mat-measure-icon--${measure.id}`} aria-hidden="true">
                  {MATERNITY_GLYPHS[measure.icon]}
                </span>
                <span className="db-mat-measure-text">
                  <span className="db-mat-measure-label">{measure.label}</span>
                  <span className="db-mat-measure-value">{measure.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function UltrasoundCard({ id, handlers }: { id: string; handlers: MaternityHandlers }) {
  const captionId = `${id}-caption`
  return (
    <section className="db-panel db-mat-card" aria-labelledby={id}>
      <CardHead
        id={id}
        title="Latest Ultrasound"
        icon={SECTION_ICONS.latestUltrasound}
        action={<MoreButton label="Ultrasound history" onSelect={() => handlers.onUnavailable('Ultrasound history')} />}
      />
      <button type="button" className="db-mat-shot" onClick={handlers.onOpenUltrasound} aria-describedby={captionId}>
        <img
          src={ultrasound}
          alt={`Ultrasound scan from ${LATEST_ULTRASOUND.takenOn} at 32 weeks 4 days`}
          width={364}
          height={175}
        />
      </button>
      <div className="db-mat-shot-foot">
        <p className="db-mat-shot-caption" id={captionId}>
          {LATEST_ULTRASOUND.caption.map((line) => <span key={line}>{line}</span>)}
        </p>
        <MoreButton label="Ultrasound note details" onSelect={() => handlers.onUnavailable('Ultrasound note details')} />
      </div>
    </section>
  )
}

function AppointmentCard({ id, handlers }: { id: string; handlers: MaternityHandlers }) {
  return (
    <section className="db-panel db-mat-card" aria-labelledby={id}>
      <CardHead
        id={id}
        title="Next Appointment"
        icon={SECTION_ICONS.nextAppointment}
        action={<MoreButton label="Appointment history" onSelect={() => handlers.onUnavailable('Appointment history')} />}
      />
      <div className="db-mat-appt">
        <p className="db-mat-appt-date">
          <span className="db-mat-appt-day">{NEXT_APPOINTMENT.day}</span>
          <span className="db-mat-appt-num">{NEXT_APPOINTMENT.date}</span>
          <span className="db-mat-appt-month">{NEXT_APPOINTMENT.month}</span>
        </p>
        <div className="db-mat-appt-body">
          <p className="db-mat-appt-type">{NEXT_APPOINTMENT.type}</p>
          <p className="db-mat-appt-ga">{NEXT_APPOINTMENT.gestationalAge}</p>
          <p className="db-mat-appt-line">
            <span className="db-mat-appt-icon" aria-hidden="true">{MATERNITY_GLYPHS.clock}</span>
            {NEXT_APPOINTMENT.time}
          </p>
          <p className="db-mat-appt-line">
            <img src={doctorAvatar} alt="" width={28} height={28} className="db-mat-appt-avatar" />
            {NEXT_APPOINTMENT.clinician}
          </p>
          <p className="db-mat-appt-line">
            <span className="db-mat-appt-icon" aria-hidden="true">{MATERNITY_GLYPHS.pin}</span>
            <span>
              {NEXT_APPOINTMENT.location}
              <br />
              {NEXT_APPOINTMENT.room}
            </span>
          </p>
        </div>
      </div>
      <div className="db-mat-appt-actions">
        <button type="button" className="db-mat-btn db-mat-btn--primary" onClick={handlers.onOpenAppointment}>
          View Appointment Details
        </button>
        <button
          type="button"
          className="db-mat-btn db-mat-btn--ghost"
          onClick={() => handlers.onUnavailable('Reschedule', 'This reference demo has no scheduling workflow. The supplied appointment cannot be moved.')}
        >
          <span aria-hidden="true">{PANEL_GLYPH.calendar}</span>
          Reschedule
        </button>
      </div>
    </section>
  )
}

function ChecklistCard({ id, handlers, listRef, onFocusList }: {
  id: string
  handlers: MaternityHandlers
  listRef: RefObject<HTMLUListElement | null>
  onFocusList: () => void
}) {
  return (
    <section className="db-panel db-mat-card" aria-labelledby={id}>
      <CardHead
        id={id}
        title="Prenatal Checklist"
        icon={SECTION_ICONS.prenatalChecklist}
        action={
          <button type="button" className="db-mat-link" onClick={onFocusList}>
            View All
            <span aria-hidden="true">{MATERNITY_GLYPHS.chevron}</span>
          </button>
        }
      />
      <ul className="db-mat-checklist" ref={listRef} tabIndex={-1}>
        {PRENATAL_CHECKLIST.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="db-mat-check-row"
              onClick={() => handlers.onOpenChecklistItem(item)}
            >
              <span className={`db-mat-check-icon db-mat-check-icon--${slugify(item.status)}`} aria-hidden="true">
                {CHECKLIST_ICONS[item.status]}
              </span>
              <span className="db-mat-check-label">{item.label}</span>
              <span className={`db-mat-status db-mat-status--${slugify(item.status)}`}>{item.status}</span>
              <span className="db-mat-check-date">{item.date}</span>
              <span className="db-mat-chevron" aria-hidden="true">{MATERNITY_GLYPHS.chevron}</span>
              <span className="sr-only">
                Open details for {item.label}, {item.status}, {item.date}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function NotesCard({ id, handlers }: { id: string; handlers: MaternityHandlers }) {
  return (
    <section className="db-panel db-mat-card db-mat-card--wide" aria-labelledby={id}>
      <CardHead
        id={id}
        title="Doctor's Notes"
        icon={SECTION_ICONS.doctorNotes}
        action={<MoreButton label="All notes" onSelect={handlers.onOpenNotes} />}
      />
      <div className="db-mat-notes">
        <div className="db-mat-note-person">
          <img src={doctorAvatar} alt="" width={44} height={44} className="db-mat-note-avatar" />
          <span className="db-mat-note-who">
            <strong>{DOCTOR_NOTE.clinician}</strong>
            <span>{DOCTOR_NOTE.recorded} • {DOCTOR_NOTE.time}</span>
          </span>
        </div>
        <p className="db-mat-note-body">{DOCTOR_NOTE.body}</p>
        <div className="db-mat-note-actions">
          <MoreButton label="This note's details" onSelect={handlers.onOpenNotes} />
          <button type="button" className="db-mat-btn db-mat-btn--ghost" onClick={handlers.onOpenNotes}>
            <span aria-hidden="true">{MATERNITY_GLYPHS.document}</span>
            View All Notes
          </button>
        </div>
      </div>
    </section>
  )
}

export function MaternityOverviewCards({ handlers }: { handlers: MaternityHandlers }) {
  const listRef = useRef<HTMLUListElement>(null)

  function focusChecklist() {
    const list = listRef.current
    if (!list) return
    list.focus()
    list.scrollIntoView({ block: 'nearest' })
  }

  return (
    <div className="db-mat-grid">
      <ProgressCard id="mat-progress" handlers={handlers} />
      <MaternalHealthCard id="mat-health" handlers={handlers} />
      <BabyDevelopmentCard id="mat-baby" handlers={handlers} />
      <UltrasoundCard id="mat-ultrasound" handlers={handlers} />
      <AppointmentCard id="mat-appointment" handlers={handlers} />
      <ChecklistCard id="mat-checklist" handlers={handlers} listRef={listRef} onFocusList={focusChecklist} />
      <NotesCard id="mat-notes" handlers={handlers} />
    </div>
  )
}
