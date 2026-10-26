import { useState } from 'react'
import { NoticeDialog, type Notice } from '../NoticeDialog.tsx'
import { ReadOnlyDialog } from '../ReadOnlyDialog.tsx'
import { PediatricGrowthChart } from './PediatricGrowthChart.tsx'
import {
  PediatricMetricRow,
  PediatricMilestonesCard,
  PediatricNextVisitCard,
  PediatricNotesCard,
  PediatricVaccinationsCard,
} from './PediatricOverviewPanels.tsx'
import { PEDIATRIC_GLYPHS } from './pediatricGlyphs.tsx'
import {
  MILESTONES,
  NEXT_VISIT,
  PEDIATRIC_BREADCRUMB,
  PEDIATRIC_PATIENT,
  PEDIATRIC_TABS,
  RECENT_NOTE,
  VACCINATIONS,
} from './pediatricData.ts'

import bannerScene from '../../assets/dashboard/pediatric/pediatric_banner_growth_scene.png'
import patientAvatar from '../../assets/dashboard/pediatric/pediatric_avatar_muhammad_rizki.png'

const CHIP_GLYPHS = {
  active: <span className="db-ped-chip-dot" aria-hidden="true" />,
  plan: <span className="db-ped-chip-glyph" aria-hidden="true">{PEDIATRIC_GLYPHS.crown}</span>,
  allergy: <span className="db-ped-chip-glyph" aria-hidden="true">{PEDIATRIC_GLYPHS.checkTiny}</span>,
} as const

function unavailableNotice(label: string): Notice {
  return {
    title: label,
    body: `${label} is not available in this reference demo. Only the supplied pediatric overview fixture is provided.`,
  }
}

export function PediatricOverviewPage() {
  const [notice, setNotice] = useState<Notice | null>(null)
  const [visitOpen, setVisitOpen] = useState(false)
  const [milestonesOpen, setMilestonesOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)

  return (
    <div className="db-ped">
      <section className="db-ped-header" aria-label="Patient header">
        <nav className="db-ped-crumb" aria-label="Breadcrumb">
          <ol>
            <li>{PEDIATRIC_BREADCRUMB[0]}</li>
            <li aria-current="page">{PEDIATRIC_BREADCRUMB[1]}</li>
          </ol>
        </nav>

        <div className="db-ped-hero">
          <section className="db-ped-banner">
            <img
              src={patientAvatar}
              alt={`Reference portrait of ${PEDIATRIC_PATIENT.name}`}
              width={133}
              height={133}
              className="db-ped-avatar"
            />
            <img
              src={bannerScene}
              alt=""
              width={543}
              height={202}
              className="db-ped-banner-art"
            />
            <div className="db-ped-identity">
              <div className="db-ped-name-row">
                <h1 id="ped-patient" className="db-ped-name">{PEDIATRIC_PATIENT.name}</h1>
                <p className="db-ped-person">
                  {PEDIATRIC_PATIENT.age}
                  <span aria-hidden="true">•</span>
                  <span className="db-ped-gender" aria-hidden="true">{PEDIATRIC_GLYPHS.male}</span>
                  {PEDIATRIC_PATIENT.gender}
                </p>
              </div>
              <p className="db-ped-ids">Patient ID: {PEDIATRIC_PATIENT.id}</p>
              <ul className="db-ped-chips" role="list">
                {PEDIATRIC_PATIENT.statuses.map((status) => (
                  <li key={status.id} className={`db-ped-status db-ped-status--${status.tone}`}>
                    {CHIP_GLYPHS[status.id as keyof typeof CHIP_GLYPHS]}
                    {status.label}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="db-ped-btn db-ped-btn--primary db-ped-edit"
                onClick={() => setNotice({
                  title: 'Edit patient',
                  body: 'Patient editing is not available in this reference demo.',
                })}
              >
                <span aria-hidden="true">{PEDIATRIC_GLYPHS.pencil}</span>
                Edit
              </button>
            </div>
          </section>

          <ul className="db-ped-tabs" role="list">
            {PEDIATRIC_TABS.map((tab) => {
              const active = tab === 'Overview'
              return (
                <li key={tab}>
                  <button
                    type="button"
                    className={`db-ped-tab${active ? ' db-ped-tab--active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => { if (!active) setNotice(unavailableNotice(tab)) }}
                  >
                    {tab}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <PediatricMetricRow className="db-ped-metric-row" />

      <div className="db-ped-body">
        <div className="db-ped-main">
          <PediatricGrowthChart className="db-ped-card--chart" onUnavailable={(label) => setNotice(unavailableNotice(label))} />
          <PediatricVaccinationsCard className="db-ped-card--vaccinations" onOpenFull={() => setHistoryOpen(true)} />
        </div>
        <div className="db-ped-rail">
          <PediatricNextVisitCard
            className="db-ped-card--visit"
            onOpenVisit={() => setVisitOpen(true)}
            onUnavailable={(label) => setNotice(unavailableNotice(label))}
          />
          <PediatricMilestonesCard className="db-ped-card--milestones" onOpenAll={() => setMilestonesOpen(true)} />
          <PediatricNotesCard className="db-ped-card--notes" onOpenAll={() => setNoteOpen(true)} />
        </div>
      </div>

      <NoticeDialog notice={notice} onClose={() => setNotice(null)} />

      <ReadOnlyDialog open={visitOpen} title="Next vaccination / visit" onClose={() => setVisitOpen(false)}>
        <dl className="db-dialog-facts">
          <div><dt>Vaccine</dt><dd>{NEXT_VISIT.vaccine}</dd></div>
          <div><dt>Recommended age</dt><dd>{NEXT_VISIT.recommendedAge}</dd></div>
          <div><dt>Due date</dt><dd>{NEXT_VISIT.dueDate}</dd></div>
        </dl>
        <p className="db-readonly-note">
          Read-only reference fixture. Scheduling this visit is not part of this demo. No further reference
          visits exist for this patient.
        </p>
      </ReadOnlyDialog>

      <ReadOnlyDialog open={milestonesOpen} title="Developmental milestones" onClose={() => setMilestonesOpen(false)}>
        <ul className="db-dialog-list">
          {MILESTONES.map((milestone) => (
            <li key={milestone.id}>
              {milestone.label}
              <span className="db-ped-status db-ped-status--allergy">{milestone.status}</span>
            </li>
          ))}
        </ul>
        <p className="db-readonly-note">
          Read-only reference fixture. Milestones cannot be assessed or edited in this demo. No additional
          reference milestones are available.
        </p>
      </ReadOnlyDialog>

      <ReadOnlyDialog open={historyOpen} title="Full vaccination history" onClose={() => setHistoryOpen(false)}>
        <table className="db-ped-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Vaccine</th>
              <th scope="col">Dose</th>
              <th scope="col">Status</th>
              <th scope="col">Next Due</th>
            </tr>
          </thead>
          <tbody>
            {VACCINATIONS.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.date}</td>
                <td>{entry.vaccine}</td>
                <td>{entry.dose}</td>
                <td><span className="db-ped-status db-ped-status--active">{entry.status}</span></td>
                <td>{entry.nextDue}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="db-readonly-note">
          Read-only reference fixture kept in the supplied visual order. Vaccinations cannot be recorded in
          this demo. No further reference vaccination history exists.
        </p>
      </ReadOnlyDialog>

      <ReadOnlyDialog open={noteOpen} title={`Recent note · ${RECENT_NOTE.date}`} onClose={() => setNoteOpen(false)}>
        <p className="db-ped-note-meta">
          <span>{RECENT_NOTE.clinician}</span>
          <span>{RECENT_NOTE.visit}</span>
        </p>
        <p className="db-ped-note-body">{RECENT_NOTE.body}</p>
        <p className="db-readonly-note">
          Read-only reference fixture. Notes cannot be created or edited in this demo. No additional
          reference notes exist.
        </p>
      </ReadOnlyDialog>
    </div>
  )
}
