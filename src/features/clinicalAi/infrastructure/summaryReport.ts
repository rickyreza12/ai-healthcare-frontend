import type { AiSummary } from '../domain/patientSummary.ts'

export type ReportPatient = { displayName: string; patientNumber: string; age: number; gender: string; dateOfBirth: string }

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const STYLE = `
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: 'Segoe UI', Arial, sans-serif; color: #263f4e; font-size: 11pt; line-height: 1.5; }
  .brand { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 10px; border-bottom: 3px solid #087c76; }
  .brand h1 { margin: 0; font-size: 22pt; color: #163650; letter-spacing: -0.01em; }
  .brand h1 span { color: #087c76; }
  .brand p { margin: 0; color: #657989; font-size: 9pt; text-align: right; }
  .patient { margin: 14px 0; padding: 12px 16px; border: 1px solid #d5e6e3; border-radius: 8px; background: #f3fbf8; }
  .patient h2 { margin: 0 0 4px; font-size: 15pt; color: #163650; }
  .patient dl { display: flex; flex-wrap: wrap; gap: 4px 28px; margin: 0; font-size: 9.5pt; }
  .patient dt { display: inline; color: #657989; }
  .patient dd { display: inline; margin: 0 0 0 4px; font-weight: 600; color: #163650; }
  h3 { margin: 20px 0 8px; font-size: 12pt; color: #087c76; text-transform: uppercase; letter-spacing: 0.06em; page-break-after: avoid; }
  .summary { padding: 12px 16px; border-left: 4px solid #17b8a6; background: #f6fbfa; border-radius: 0 8px 8px 0; }
  .meta { color: #657989; font-size: 9pt; margin-top: 6px; }
  .claim, .alert, .source { margin: 0 0 8px; padding: 9px 12px; border: 1px solid #e0e8e8; border-radius: 8px; page-break-inside: avoid; }
  .claim h4, .alert h4, .source h4 { margin: 0 0 2px; font-size: 10.5pt; color: #163650; }
  .claim p, .alert p { margin: 0; font-size: 10pt; }
  .cites { margin-top: 4px; font-size: 8.5pt; font-weight: 700; color: #1f6fd1; }
  .alert--high { background: #fdecef; border-color: #f4c3cb; }
  .alert--medium { background: #fff3e0; border-color: #f6d9a8; }
  .alert--info { background: #e8f0fd; border-color: #c5d8f6; }
  .tag { display: inline-block; padding: 1px 8px; border-radius: 999px; background: #e6f6f2; color: #087c76; font-size: 8pt; font-weight: 700; text-transform: uppercase; }
  .source .row { font-size: 9.5pt; color: #263f4e; }
  .source .row b { color: #657989; font-weight: 600; }
  .score { display: flex; gap: 14px; flex-wrap: wrap; }
  .score div { flex: 1 1 140px; padding: 8px 12px; border-radius: 8px; background: #f1f6fc; }
  .score b { display: block; font-size: 14pt; color: #163650; }
  .score span { font-size: 8.5pt; color: #657989; }
  footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e0e8e8; color: #657989; font-size: 8.5pt; }
`

export function buildSummaryReportHtml(patient: ReportPatient, summary: AiSummary): string {
  const e = escapeHtml
  const marker = new Map(summary.sources.map(source => [source.sourceId, source.marker]))
  const review = summary.review.reviewed
    ? `Reviewed${summary.review.reviewedBy ? ` by ${e(summary.review.reviewedBy)}` : ''}${summary.review.reviewedAt ? ` on ${e(day(summary.review.reviewedAt))}` : ''}`
    : 'Not yet reviewed by a clinician'

  const claims = summary.claims.map(claim => `
    <div class="claim"><h4>${claim.number}. ${e(claim.title)}</h4><p>${e(claim.description)}</p>
    <div class="cites">${claim.sourceIds.map(id => e(marker.get(id) ?? '')).filter(Boolean).join(' · ') || 'No supporting source'}</div></div>`).join('')

  const alerts = summary.alerts.map(alert => `
    <div class="alert alert--${alert.level}"><h4>${e(alert.title)} <span class="tag">${e(alert.level)}</span></h4><p>${e(alert.description)}</p></div>`).join('')

  const sources = summary.sources.map(source => `
    <div class="source"><h4>${e(source.marker)} · ${e(source.title)} <span class="tag">${e(source.kind)}</span></h4>
    <div class="meta">${e(day(source.recordedAt))}</div>
    ${source.fields.map(field => `<div class="row"><b>${e(field.label)}:</b> ${e(field.value)}</div>`).join('')}</div>`).join('')

  const quality = summary.dataQuality
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>AI Patient Summary - ${e(patient.displayName)}</title><style>${STYLE}</style></head><body>
  <div class="brand"><h1>BUNDA <span>Healthcare</span></h1><p>AI Patient Summary<br>Generated ${e(dateTime(summary.generatedAt))}</p></div>
  <div class="patient"><h2>${e(patient.displayName)}</h2><dl>
    <div><dt>Patient ID</dt><dd>${e(patient.patientNumber)}</dd></div>
    <div><dt>Age</dt><dd>${patient.age} years</dd></div>
    <div><dt>Gender</dt><dd>${e(patient.gender)}</dd></div>
    <div><dt>Date of birth</dt><dd>${e(day(patient.dateOfBirth))}</dd></div></dl></div>
  <h3>Summary</h3><div class="summary">${e(summary.body)}<div class="meta">${e(summary.sourceNote)} · ${summary.sourceCount} sources · ${review}</div></div>
  ${alerts ? `<h3>Clinical alerts</h3>${alerts}` : ''}
  <h3>Key clinical statements</h3>${claims}
  <h3>Data quality</h3><div class="score"><div><b>${quality.reliability.score}/${quality.reliability.scale}</b><span>${e(quality.reliability.label)}</span></div>
    ${quality.metrics.map(metric => `<div><b>${e(metric.value)}</b><span>${e(metric.label)}</span></div>`).join('')}</div>
  <h3>Source records</h3>${sources}
  <footer>This summary was produced by an AI model from the patient's stored records and is decision support only. A clinician must verify it before it informs care. Every statement above cites the source records listed.</footer>
  </body></html>`
}

export function downloadFile(content: BlobPart, type: string, filename: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

/** Opens the browser print dialog on the report; "Save as PDF" there produces the PDF. */
export function printReport(html: string): void {
  const frame = document.createElement('iframe')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0'
  frame.srcdoc = html
  frame.onload = () => {
    frame.contentWindow?.focus()
    frame.contentWindow?.print()
    setTimeout(() => frame.remove(), 60_000)
  }
  document.body.appendChild(frame)
}
