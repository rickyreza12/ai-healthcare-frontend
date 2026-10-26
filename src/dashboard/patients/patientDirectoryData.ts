export type DirectoryStatus = 'Inpatient' | 'Outpatient' | 'Emergency' | 'Follow-up'

/**
 * Row portraits extracted from the supplied directory artwork. Keys are positional because the
 * reference repeats two clinician names with different portraits (rows 1/7 and 3/8), so names do
 * not identify a portrait uniquely.
 */
export type DirectoryPatientPortrait =
  | 'patient1'
  | 'patient2'
  | 'patient3'
  | 'patient4'
  | 'patient5'
  | 'patient6'
  | 'patient7'
  | 'patient8'

export type DirectoryDoctorPortrait =
  | 'doctor1'
  | 'doctor2'
  | 'doctor3'
  | 'doctor4'
  | 'doctor5'
  | 'doctor6'
  | 'doctor7'
  | 'doctor8'

export type DirectoryPatient = {
  readonly id: string
  readonly name: string
  readonly age: number
  readonly gender: 'Female' | 'Male'
  readonly room: string
  readonly unit: string
  readonly lastVisit: string
  readonly doctor: string
  readonly specialty: string
  readonly status: DirectoryStatus
  readonly avatar: DirectoryPatientPortrait
  readonly doctorAvatar: DirectoryDoctorPortrait
}

export type DirectoryTabKey = 'all' | DirectoryStatus

export type DirectoryTab = {
  readonly key: DirectoryTabKey
  readonly label: string
  readonly count: number
}

/** Global directory counts. The dataset below matches them, so tabs and pagination are honest. */
export const DIRECTORY_TABS: readonly DirectoryTab[] = [
  { key: 'all', label: 'All Patients', count: 1248 },
  { key: 'Inpatient', label: 'Inpatient', count: 320 },
  { key: 'Outpatient', label: 'Outpatient', count: 682 },
  { key: 'Emergency', label: 'Emergency', count: 48 },
  { key: 'Follow-up', label: 'Follow-up', count: 198 },
]

export const DIRECTORY_TOTAL = DIRECTORY_TABS[0].count

/** Reference fixture rows supplied by the approved directory design. Page one of the directory. */
const REFERENCE_PATIENTS: readonly DirectoryPatient[] = [
  { id: 'P-00012345', name: 'Siti Aisyah', age: 32, gender: 'Female', room: 'Room 101', unit: 'Maternity', lastVisit: '20 Oct 2026', doctor: 'Dr. Sarah Melati', specialty: 'Sp.OG', status: 'Inpatient', avatar: 'patient1', doctorAvatar: 'doctor1' },
  { id: 'P-00012346', name: 'Muhammad Rizki', age: 6, gender: 'Male', room: 'Room 201', unit: 'Pediatric', lastVisit: '19 Oct 2026', doctor: 'Dr. Budi Santoso', specialty: 'Pediatrician', status: 'Outpatient', avatar: 'patient2', doctorAvatar: 'doctor2' },
  { id: 'P-00012347', name: 'Ahmad Hadi', age: 58, gender: 'Male', room: 'Room 305', unit: 'Cardiology', lastVisit: '18 Oct 2026', doctor: 'Dr. Andi Pratama', specialty: 'Cardiologist', status: 'Follow-up', avatar: 'patient3', doctorAvatar: 'doctor3' },
  { id: 'P-00012348', name: 'Anita Dewi', age: 28, gender: 'Female', room: 'Room 202', unit: 'General Ward', lastVisit: '17 Oct 2026', doctor: 'Dr. Lina Kusuma', specialty: 'Internist', status: 'Inpatient', avatar: 'patient4', doctorAvatar: 'doctor4' },
  { id: 'P-00012349', name: 'Budi Santoso', age: 45, gender: 'Male', room: 'Room 102', unit: 'Surgery', lastVisit: '17 Oct 2026', doctor: 'Dr. Reza Fadli', specialty: 'Surgeon', status: 'Emergency', avatar: 'patient5', doctorAvatar: 'doctor5' },
  { id: 'P-00012350', name: 'Kayla Putri', age: 4, gender: 'Female', room: 'Room 203', unit: 'Pediatric', lastVisit: '16 Oct 2026', doctor: 'Dr. Maya Sari', specialty: 'Pediatrician', status: 'Outpatient', avatar: 'patient6', doctorAvatar: 'doctor6' },
  { id: 'P-00012351', name: 'Dewi Lestari', age: 35, gender: 'Female', room: 'Room 404', unit: 'Obstetrics', lastVisit: '15 Oct 2026', doctor: 'Dr. Sarah Melati', specialty: 'Sp.OG', status: 'Follow-up', avatar: 'patient7', doctorAvatar: 'doctor7' },
  { id: 'P-00012352', name: 'Hendra Wijaya', age: 62, gender: 'Male', room: 'Room 301', unit: 'Internal Medicine', lastVisit: '14 Oct 2026', doctor: 'Dr. Andi Pratama', specialty: 'Internist', status: 'Inpatient', avatar: 'patient8', doctorAvatar: 'doctor8' },
]

const FEMALE_FIRST_NAMES = [
  'Siti', 'Anita', 'Dewi', 'Kayla', 'Rina', 'Putri', 'Nadia', 'Intan', 'Maya', 'Laras',
  'Ayu', 'Citra', 'Fitri', 'Indah', 'Melati', 'Nur', 'Ratih', 'Sri', 'Wulan', 'Zahra',
] as const

const MALE_FIRST_NAMES = [
  'Muhammad', 'Ahmad', 'Budi', 'Hendra', 'Agus', 'Rizky', 'Fajar', 'Yusuf', 'Dimas', 'Bayu',
  'Eko', 'Gilang', 'Ilham', 'Joko', 'Kurnia', 'Lukman', 'Rangga', 'Surya', 'Taufik', 'Wahyu',
] as const

const FAMILY_NAMES = [
  'Aisyah', 'Rizki', 'Hadi', 'Santoso', 'Putra', 'Lestari', 'Wijaya', 'Pratama', 'Kusuma', 'Sari',
  'Nugroho', 'Halim', 'Rahmawati', 'Saputra', 'Maulida', 'Firmansyah', 'Anggraini', 'Setiawan', 'Permata', 'Hidayat',
  'Gunawan', 'Susanto', 'Wibowo', 'Hartono', 'Purnama', 'Siregar', 'Nasution', 'Harahap', 'Lubis', 'Wijayanti',
  'Kusnadi', 'Marlina', 'Oktaviani', 'Rahayu', 'Simanjuntak', 'Tanjung', 'Utami', 'Yuliana', 'Ardianti', 'Sihombing',
] as const

const VISIT_DATES = [
  '20 Oct 2026', '19 Oct 2026', '18 Oct 2026', '17 Oct 2026', '16 Oct 2026', '15 Oct 2026', '14 Oct 2026',
  '13 Oct 2026', '12 Oct 2026', '11 Oct 2026', '10 Oct 2026', '09 Oct 2026', '08 Oct 2026', '07 Oct 2026',
] as const

const FEMALE_PORTRAITS: readonly DirectoryPatientPortrait[] = ['patient1', 'patient4', 'patient6', 'patient7']
const MALE_PORTRAITS: readonly DirectoryPatientPortrait[] = ['patient2', 'patient3', 'patient5', 'patient8']

// Deterministic filler keeps page one identical to the design and the rest stable across reloads.
function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

function shuffle<T>(items: T[], random: () => number): void {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    const value = items[index]
    items[index] = items[swap]
    items[swap] = value
  }
}

/**
 * Dummy records that fill the published status counts. Statuses are dealt from a shuffled plan so
 * every page looks mixed while the tab counts stay exact. The name formula yields unique pairs.
 */
function buildDummyPatients(): DirectoryPatient[] {
  const slots: DirectoryStatus[] = []
  for (const tab of DIRECTORY_TABS) {
    if (tab.key === 'all') continue
    const supplied = REFERENCE_PATIENTS.filter((patient) => patient.status === tab.key).length
    for (let index = supplied; index < tab.count; index += 1) slots.push(tab.key)
  }
  shuffle(slots, seededRandom(20261020))

  const usedNames = new Set(REFERENCE_PATIENTS.map((patient) => patient.name))
  const patients: DirectoryPatient[] = []
  for (let index = 0; index < slots.length; index += 1) {
    const isFemale = index % 2 === 0
    const first = isFemale ? FEMALE_FIRST_NAMES[(index / 2) % 20] : MALE_FIRST_NAMES[Math.floor(index / 2) % 20]
    let family = (Math.floor(index / 40) + (index % 40) * 3) % FAMILY_NAMES.length
    while (usedNames.has(`${first} ${FAMILY_NAMES[family]}`)) {
      family = (family + 1) % FAMILY_NAMES.length
    }
    const name = `${first} ${FAMILY_NAMES[family]}`
    usedNames.add(name)
    const template = REFERENCE_PATIENTS[index % REFERENCE_PATIENTS.length]
    patients.push({
      id: `P-${String(12345 + REFERENCE_PATIENTS.length + index).padStart(8, '0')}`,
      name,
      age: 4 + ((index * 11) % 79),
      gender: isFemale ? 'Female' : 'Male',
      room: `Room ${101 + ((index * 37) % 499)}`,
      unit: template.unit,
      lastVisit: VISIT_DATES[index % VISIT_DATES.length],
      doctor: template.doctor,
      specialty: template.specialty,
      status: slots[index],
      avatar: isFemale
        ? FEMALE_PORTRAITS[Math.floor(index / 2) % FEMALE_PORTRAITS.length]
        : MALE_PORTRAITS[Math.floor(index / 2) % MALE_PORTRAITS.length],
      doctorAvatar: template.doctorAvatar,
    })
  }
  return patients
}

export const DIRECTORY_PATIENTS: readonly DirectoryPatient[] = [
  ...REFERENCE_PATIENTS,
  ...buildDummyPatients(),
]
