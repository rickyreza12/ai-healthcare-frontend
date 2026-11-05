import { useEffect, useState, type ReactNode } from 'react'
import { api, ApiError, type MedicalRecord, type PatientAppointment } from '../../api.ts'
import { ClinicalAiLoader } from '../../features/clinicalAi/presentation/ClinicalAiLoader.tsx'
import './patientRecordTabs.css'

type Load<T> = { state: 'loading' } | { state: 'error'; message: string } | { state: 'ready'; data: T }

function useLoad<T>(fetcher: (signal: AbortSignal) => Promise<T>, key: string): Load<T> {
  const [result, setResult] = useState<Load<T>>({ state: 'loading' })
  useEffect(() => {
    const abort = new AbortController()
    setResult({ state: 'loading' })
    fetcher(abort.signal).then((data) => {
      if (!abort.signal.aborted) setResult({ state: 'ready', data })
    }).catch((reason) => {
      if (abort.signal.aborted) return
      setResult({
        state: 'error',
        message: reason instanceof ApiError && reason.status === 403
          ? 'You do not have permission to view these records.'
          : reason instanceof Error ? reason.message : 'The records could not be loaded.',
      })
    })
    return () => abort.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return result
}

const date = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
const time = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <section className="db-pd-card pdr-section">
      <div className="pdr-head"><h2>{title}</h2><span className="pdr-count">{count}</span></div>
      {count === 0 ? <p className="db-pd-rail-note">No {title.toLowerCase()} recorded.</p> : children}
    </section>
  )
}

function Frame<T>({ load, title, children }: { load: Load<T>; title: string; children: (data: T) => ReactNode }) {
  if (load.state === 'loading') {
    return <section className="db-pd-card"><ClinicalAiLoader label={`Loading ${title.toLowerCase()}`} detail="Reading the stored records." /></section>
  }
  if (load.state === 'error') {
    return <section className="db-pd-card" role="alert"><h2 className="pdr-error-title">{title} unavailable</h2><p className="db-pd-rail-note">{load.message}</p></section>
  }
  return <>{children(load.data)}</>
}

export function MedicalRecordPanel({ patientId }: { patientId: string }) {
  const load = useLoad<MedicalRecord>(() => api.patients.medicalRecord(patientId), patientId)
  return (
    <Frame load={load} title="Medical record">{(r) => (
      <div className="pdr-grid">
        <Section title="Diagnoses" count={r.diagnoses.length}>
          <ul className="pdr-list">{r.diagnoses.map((d, i) => (
            <li key={i}><span className="pdr-code">{d.icd10Code}</span>
              <div><strong>{d.description}</strong><span className="pdr-muted">{date(d.recordedAt)}{d.clinician ? ` · ${d.clinician}` : ''}</span></div></li>
          ))}</ul>
        </Section>
        <Section title="Medications" count={r.medications.length}>
          <ul className="pdr-list">{r.medications.map((m, i) => (
            <li key={i}><span className={`pdr-pill pdr-pill--${m.status}`}>{m.status}</span>
              <div><strong>{m.name} {m.dose}</strong>
                <span className="pdr-muted">{[m.frequency, m.indication, `since ${date(m.prescribedAt)}`].filter(Boolean).join(' · ')}</span></div></li>
          ))}</ul>
        </Section>
        <Section title="Allergies" count={r.allergies.length}>
          <ul className="pdr-list">{r.allergies.map((a, i) => (
            <li key={i}><span className="pdr-pill pdr-pill--allergy">{a.severity ?? 'recorded'}</span>
              <div><strong>{a.substance}</strong><span className="pdr-muted">{a.category}</span></div></li>
          ))}</ul>
        </Section>
        <Section title="Vitals" count={r.vitals.length}>
          <ul className="pdr-list">{r.vitals.map((v, i) => (
            <li key={i}><span className="pdr-code">{date(v.measuredAt)}</span>
              <div><strong>{[v.bloodPressure && `BP ${v.bloodPressure} mmHg`, v.heartRateBpm && `HR ${v.heartRateBpm} bpm`,
                v.temperatureC && `${v.temperatureC} °C`, v.weightKg && `${v.weightKg} kg`].filter(Boolean).join(' · ')}</strong>
                {v.fetalHeartRateBpm && <span className="pdr-muted">Fetal heart rate {v.fetalHeartRateBpm} bpm</span>}</div></li>
          ))}</ul>
        </Section>
        <Section title="SOAP notes" count={r.soapNotes.length}>
          <ul className="pdr-notes">{r.soapNotes.map((s, i) => (
            <li key={i}>
              <div className="pdr-note-head"><strong>{s.encounterType}</strong><span className="pdr-muted">{date(s.recordedAt)}{s.clinician ? ` · ${s.clinician}` : ''}</span></div>
              <dl>{([['S', 'Subjective', s.subjective], ['O', 'Objective', s.objective], ['A', 'Assessment', s.assessment], ['P', 'Plan', s.plan]] as const)
                .filter(([, , text]) => text).map(([letter, label, text]) => (
                  <div key={letter}><dt><span className="pdr-letter">{letter}</span>{label}</dt><dd>{text}</dd></div>
                ))}</dl>
            </li>
          ))}</ul>
        </Section>
        <Section title="Lab results" count={r.labResults.length}>
          <ul className="pdr-list">{r.labResults.map((l, i) => (
            <li key={i}><span className="pdr-code">{date(l.resultedAt)}</span>
              <div><strong>{l.testName}</strong><span className="pdr-muted">{l.value} {l.unit}</span></div></li>
          ))}</ul>
        </Section>
        <Section title="Procedures" count={r.procedures.length}>
          <ul className="pdr-list">{r.procedures.map((p, i) => (
            <li key={i}><span className="pdr-code">{date(p.performedAt)}</span><div><strong>{p.name}</strong></div></li>
          ))}</ul>
        </Section>
      </div>
    )}</Frame>
  )
}

export function AppointmentsPanel({ patientId }: { patientId: string }) {
  const load = useLoad<PatientAppointment[]>(() => api.patients.appointments(patientId).then(r => r.items), patientId)
  return (
    <Frame load={load} title="Appointments">{(items) => (
      <Section title="Appointments" count={items.length}>
        <ul className="pdr-visits">{items.map(item => (
          <li key={item.id}>
            <div className="pdr-when"><strong>{date(item.occurredAt)}</strong><span className="pdr-muted">{time(item.occurredAt)}</span></div>
            <div className="pdr-what">
              <strong>{item.title}</strong>
              <span className="pdr-muted">{[item.department, item.clinician, item.clinicianSpecialty].filter(Boolean).join(' · ')}</span>
              {item.note && <p>{item.note}</p>}
            </div>
            <span className={`pdr-pill pdr-pill--${item.state}`}>{item.state}</span>
          </li>
        ))}</ul>
      </Section>
    )}</Frame>
  )
}
