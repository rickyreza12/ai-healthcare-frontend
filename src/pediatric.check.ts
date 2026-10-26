import assert from 'node:assert/strict'
import { NAV_ITEMS, RECENT_PATIENTS } from './dashboard/dashboardData.ts'
import { duplicateValues } from './dashboard/dashboardLogic.ts'
import { DIRECTORY_PATIENTS } from './dashboard/patients/patientDirectoryData.ts'
import {
  HEIGHT_DOMAIN,
  HEIGHT_HIGHLIGHT,
  HEIGHT_SERIES,
  MILESTONES,
  NEXT_VISIT,
  PEDIATRIC_PATIENT,
  VACCINATIONS,
} from './dashboard/pediatric/pediatricData.ts'
import {
  isOrderedByAge,
  findSeries,
  pointPosition,
  pointsInsideDomain,
  toPercent,
  toPolylinePoints,
} from './dashboard/pediatric/pediatricLogic.ts'

// The pediatric fixture shares a name with a directory patient but must stay a separate record.
assert.equal(PEDIATRIC_PATIENT.id, 'P-0004587', 'the pediatric fixture keeps its supplied ID')
assert.ok(
  DIRECTORY_PATIENTS.every((patient) => patient.id !== PEDIATRIC_PATIENT.id),
  'no directory patient owns the pediatric fixture ID',
)
assert.ok(
  RECENT_PATIENTS.every((patient) => patient.id !== PEDIATRIC_PATIENT.id),
  'no recent-patient tile owns the pediatric fixture ID',
)
const directoryRizki = DIRECTORY_PATIENTS.find((patient) => patient.name === PEDIATRIC_PATIENT.name)
assert.ok(directoryRizki, 'the directory still has a same-name patient')
assert.notEqual(directoryRizki.id, PEDIATRIC_PATIENT.id, 'the two Muhammad Rizki records keep distinct IDs')
assert.notEqual(
  directoryRizki.age,
  HEIGHT_HIGHLIGHT.ageYears,
  'the two Muhammad Rizki records keep distinct ages',
)

// Supplied growth summaries keep their exact strings.
assert.equal(
  HEIGHT_SERIES.length,
  6,
  'five percentile reference lines plus the patient line are supplied',
)
assert.deepEqual(
  HEIGHT_SERIES.map((series) => series.key),
  ['p97', 'p85', 'p50', 'p15', 'p3', 'rizki'],
  'series keys and order match the reference',
)
assert.equal(
  duplicateValues(HEIGHT_SERIES.map((series) => series.key)).length,
  0,
  'chart series keys are unique',
)
for (const series of HEIGHT_SERIES) {
  assert.ok(isOrderedByAge(series.points), `${series.key} points stay ordered by age`)
  assert.ok(pointsInsideDomain(series.points, HEIGHT_DOMAIN), `${series.key} stays inside the supplied domain`)
  assert.equal(
    toPolylinePoints(series.points, HEIGHT_DOMAIN).split(' ').length,
    series.points.length,
    `${series.key} emits exactly one coordinate per point`,
  )
}

// Axis mapping is a pure plot helper, not a clinical calculation.
assert.equal(toPercent(0, 0, 7), 0, 'the axis origin maps to zero')
assert.equal(toPercent(7, 0, 7), 100, 'the axis end maps to one hundred percent')
assert.equal(toPercent(3.5, 0, 7), 50, 'the axis midpoint maps to fifty percent')
assert.equal(findSeries(HEIGHT_SERIES, 'rizki')?.patient, true, "Rizki's growth is the patient line")

assert.equal(HEIGHT_HIGHLIGHT.ageYears, 5.17, 'the highlight pins the supplied 5y 2m age')
assert.equal(HEIGHT_HIGHLIGHT.value, 110.2, 'the highlight pins the supplied 110.2 cm value')

// The vaccination table keeps the supplied visual order, which is not chronological.
assert.equal(VACCINATIONS.length, 5, 'five vaccination rows are supplied')
assert.equal(VACCINATIONS[4]?.vaccine, 'Hepatitis B', 'Hepatitis B stays last, per the reference order')
assert.ok(
  VACCINATIONS.every((entry) => entry.status === 'Completed'),
  'every supplied vaccination row is completed',
)

// Milestones keep the supplied order and status.
assert.deepEqual(
  MILESTONES.map((milestone) => [milestone.label, milestone.status]),
  [
    ['Speaks in full sentences', 'On track'],
    ['Can ride a tricycle or bicycle', 'On track'],
    ['Plays well with other children', 'On track'],
    ['Shows curiosity and asks questions', 'On track'],
    ['Can dress independently', 'On track'],
  ],
  'milestone rows keep the supplied order and On track status',
)

// Supplied strings stay display copy: never derived from the device clock.
assert.equal(NEXT_VISIT.relativeLabel, 'In 3 months', 'the next-visit label is the supplied string')
assert.equal(NEXT_VISIT.dueDate, '12 Nov 2026', 'the next-visit due date is the supplied string')

assert.equal(
  NAV_ITEMS.find((item) => item.key === 'pediatric')?.route,
  '/dashboard/pediatric',
  'pediatric navigation is now real',
)
assert.equal(duplicateValues(NAV_ITEMS.map((item) => item.key)).length, 0, 'navigation keys are unique')
const routes = NAV_ITEMS.map((item) => item.route).filter((route): route is string => route !== null)
assert.equal(duplicateValues(routes).length, 0, 'implemented navigation routes are unique')

// Helpers read fixtures only; a mutation would show up as a changed snapshot.
const seriesSnapshot = JSON.stringify(HEIGHT_SERIES)
const vaccinationsSnapshot = JSON.stringify(VACCINATIONS)
const milestonesSnapshot = JSON.stringify(MILESTONES)
for (const series of HEIGHT_SERIES) {
  pointPosition(series.points[0]!, HEIGHT_DOMAIN)
  toPolylinePoints(series.points, HEIGHT_DOMAIN)
}
isOrderedByAge(HEIGHT_SERIES[0]!.points)
pointsInsideDomain(HEIGHT_SERIES[0]!.points, HEIGHT_DOMAIN)
findSeries(HEIGHT_SERIES, 'p50')
assert.equal(JSON.stringify(HEIGHT_SERIES), seriesSnapshot, 'chart helpers do not mutate the fixtures')
assert.equal(JSON.stringify(VACCINATIONS), vaccinationsSnapshot, 'plotting does not mutate vaccinations')
assert.equal(JSON.stringify(MILESTONES), milestonesSnapshot, 'plotting does not mutate milestones')

console.log('pediatric.check.ts passed')
