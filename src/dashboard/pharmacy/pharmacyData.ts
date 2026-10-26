export type MedicationStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'
export type PrescriptionRequirement = 'Required' | 'Not required'

export type Medication = {
  readonly id: string
  readonly name: string
  readonly genericName: string
  readonly category: string
  readonly dosage: string
  readonly form: string
  readonly stock: number
  readonly price: string
  readonly prescription: PrescriptionRequirement
  readonly status: MedicationStatus
}

/** Supplied display fixture. Stock, price, and status carry no medical meaning. */
export const MEDICATIONS: readonly Medication[] = [
  {
    id: 'paracetamol-500',
    name: 'Paracetamol 500 mg',
    genericName: 'Paracetamol',
    category: 'Analgesic (OTC)',
    dosage: '500 mg',
    form: 'Tablet',
    stock: 320,
    price: 'Rp 1.500',
    prescription: 'Not required',
    status: 'In Stock',
  },
  {
    id: 'amoxicillin-500',
    name: 'Amoxicillin 500 mg',
    genericName: 'Amoxicillin trihydrate',
    category: 'Antibiotic',
    dosage: '500 mg',
    form: 'Capsule',
    stock: 120,
    price: 'Rp 2.500',
    prescription: 'Required',
    status: 'In Stock',
  },
  {
    id: 'ibuprofen-400',
    name: 'Ibuprofen 400 mg',
    genericName: 'Ibuprofen',
    category: 'Analgesic (OTC)',
    dosage: '400 mg',
    form: 'Tablet',
    stock: 25,
    price: 'Rp 1.800',
    prescription: 'Not required',
    status: 'Low Stock',
  },
  {
    id: 'omeprazole-20',
    name: 'Omeprazole 20 mg',
    genericName: 'Omeprazole',
    category: 'Gastrointestinal',
    dosage: '20 mg',
    form: 'Capsule',
    stock: 0,
    price: 'Rp 3.200',
    prescription: 'Required',
    status: 'Out of Stock',
  },
  {
    id: 'amlodipine-5',
    name: 'Amlodipine 5 mg',
    genericName: 'Amlodipine besylate',
    category: 'Cardiovascular',
    dosage: '5 mg',
    form: 'Tablet',
    stock: 210,
    price: 'Rp 1.900',
    prescription: 'Required',
    status: 'In Stock',
  },
  {
    id: 'metformin-500',
    name: 'Metformin 500 mg',
    genericName: 'Metformin HCl',
    category: 'Endocrine',
    dosage: '500 mg',
    form: 'Tablet',
    stock: 85,
    price: 'Rp 1.700',
    prescription: 'Required',
    status: 'Low Stock',
  },
  {
    id: 'cetirizine-10',
    name: 'Cetirizine 10 mg',
    genericName: 'Cetirizine dihydrochloride',
    category: 'Antihistamine (OTC)',
    dosage: '10 mg',
    form: 'Tablet',
    stock: 150,
    price: 'Rp 1.600',
    prescription: 'Not required',
    status: 'In Stock',
  },
  {
    id: 'salbutamol-inhaler',
    name: 'Salbutamol Inhaler',
    genericName: 'Salbutamol sulfate',
    category: 'Respiratory',
    dosage: '100 mcg/dose',
    form: 'Inhaler',
    stock: 18,
    price: 'Rp 45.000',
    prescription: 'Required',
    status: 'Low Stock',
  },
  {
    id: 'loratadine-10',
    name: 'Loratadine 10 mg',
    genericName: 'Loratadine',
    category: 'Antihistamine (OTC)',
    dosage: '10 mg',
    form: 'Tablet',
    stock: 64,
    price: 'Rp 2.000',
    prescription: 'Not required',
    status: 'In Stock',
  },
]

/** Every supplied fixture row is counted; no phantom inventory is claimed. */
export const MEDICATION_GLOBAL_COUNT = MEDICATIONS.length

export const MEDICATION_PAGE_SIZE = 8

export type MedicationTabKey = 'all' | 'prescription' | 'otc' | 'supplements' | 'supplies'

export const MEDICATION_TABS: readonly { readonly key: MedicationTabKey; readonly label: string }[] = [
  { key: 'all', label: 'All Medications' },
  { key: 'prescription', label: 'Prescription Only' },
  { key: 'otc', label: 'Over the Counter' },
  { key: 'supplements', label: 'Supplements' },
  { key: 'supplies', label: 'Medical Supplies' },
]

/** Categories come from the supplied rows so no empty option is offered. */
export const MEDICATION_CATEGORIES: readonly string[] = [...new Set(MEDICATIONS.map((medication) => medication.category))]

export const MEDICATION_STATUSES: readonly MedicationStatus[] = ['In Stock', 'Low Stock', 'Out of Stock']

export const PHARMACY_HERO = {
  heading: 'Pharmacy',
  supporting: 'Manage medication inventory, prescriptions, and dispensing.',
  artworkLines: ['Safe Medication', 'Healthier Tomorrows'],
} as const
