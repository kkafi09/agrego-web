import type { AuthUser } from '../lib/auth'

export type StockSummary = {
  commodity: string
  totalKg: number
  quality: number
  readyKg: number
  trend: string
}

export type ContractProgress = {
  id: string
  buyer: string
  commodity: string
  targetKg: number
  fulfilledKg: number
  minimumQuality: number
  deadline: string
  status: 'Baru' | 'Aktif' | 'Prioritas' | 'Selesai' | 'Batal'
}

export type SupplyPool = {
  contractId: string
  commodity: string
  allocatedKg: number
  candidateKg: number
  contributors: number
  score: number
}

export type Notification = {
  title: string
  body: string
  time: string
}

export type DepositRecord = {
  id: string
  member: string
  commodity: string
  weightKg: number
  submittedAt: string
  qualityScore: number | null
  status: 'Tercatat' | 'Menunggu QC' | 'Lolos QC' | 'Dialokasi'
  collector: string
  phone: string
  origin: string
  notes: string
}

export type DepositFormState = {
  member: string
  commodity: string
  weightKg: string
  submittedAt: string
  collector: string
  origin: string
  notes: string
}

export type DepositFormErrors = Partial<Record<keyof DepositFormState, string>>

export type QcRecord = {
  id: string
  depositId: string
  member: string
  commodity: string
  checkedAt: string
  moisturePercent: number
  sizeGrade: string
  defectPercent: number
  score: number
  decision: 'Lolos' | 'Tahan' | 'Prioritas'
  inspector: string
}

export type QcFormState = {
  depositId: string
  moisturePercent: string
  sizeGrade: string
  defectPercent: string
  inspector: string
  notes: string
}

export type AllocationCandidate = {
  depositId: string
  member: string
  commodity: string
  availableKg: number
  qualityScore: number
  recommendation: 'Prioritas' | 'Cocok' | 'Cadangan'
}

export type ContractFormState = {
  buyer: string
  commodity: string
  targetKg: string
  minimumQuality: string
  pricePerKg: string
  deadline: string
}

export type ContractFormErrors = Partial<Record<keyof ContractFormState, string>>

export type ProfitShareRecord = {
  member: string
  contractId: string
  commodity: string
  contributedKg: number
  qualityScore: number
  amount: number
  calculatedAt: string
}

export type MockUser = AuthUser

export const stockSummaries: StockSummary[] = [
  {
    commodity: 'Kopi Robusta',
    totalKg: 18640,
    quality: 91,
    readyKg: 13220,
    trend: '+2.4 ton minggu ini',
  },
  {
    commodity: 'Kakao Fermentasi',
    totalKg: 7420,
    quality: 87,
    readyKg: 4910,
    trend: 'QC stabil 3 hari',
  },
  {
    commodity: 'Beras Organik',
    totalKg: 11800,
    quality: 84,
    readyKg: 8200,
    trend: 'Butuh sortasi 1.1 ton',
  },
]

export const contracts: ContractProgress[] = [
  {
    id: 'AGR-2026-014',
    buyer: 'Nusantara Roastery',
    commodity: 'Kopi Robusta',
    targetKg: 20000,
    fulfilledKg: 14580,
    minimumQuality: 88,
    deadline: '18 Jul 2026',
    status: 'Prioritas',
  },
  {
    id: 'AGR-2026-017',
    buyer: 'Cokelat Timur',
    commodity: 'Kakao Fermentasi',
    targetKg: 10000,
    fulfilledKg: 5300,
    minimumQuality: 85,
    deadline: '25 Jul 2026',
    status: 'Aktif',
  },
  {
    id: 'AGR-2026-020',
    buyer: 'Boga Mandiri',
    commodity: 'Beras Organik',
    targetKg: 15000,
    fulfilledKg: 6150,
    minimumQuality: 82,
    deadline: '31 Jul 2026',
    status: 'Baru',
  },
]

export const supplyPools: SupplyPool[] = [
  {
    contractId: 'AGR-2026-014',
    commodity: 'Kopi Robusta',
    allocatedKg: 14580,
    candidateKg: 4060,
    contributors: 128,
    score: 92,
  },
  {
    contractId: 'AGR-2026-017',
    commodity: 'Kakao Fermentasi',
    allocatedKg: 5300,
    candidateKg: 2120,
    contributors: 64,
    score: 88,
  },
  {
    contractId: 'AGR-2026-020',
    commodity: 'Beras Organik',
    allocatedKg: 6150,
    candidateKg: 2050,
    contributors: 92,
    score: 85,
  },
]

export const notifications: Notification[] = [
  {
    title: 'Kontrak baru menunggu alokasi',
    body: 'Boga Mandiri meminta 15 ton beras organik dengan mutu minimum 82.',
    time: '10 menit lalu',
  },
  {
    title: 'Target kopi hampir terpenuhi',
    body: 'Supply pool AGR-2026-014 mencapai 73% dari volume kontrak.',
    time: '42 menit lalu',
  },
  {
    title: 'QC kakao siap masuk pool',
    body: '18 setoran lolos quality check dan dapat dialokasikan hari ini.',
    time: '1 jam lalu',
  },
]

export const memberOptions = [
  'Ibu Sari Wulandari',
  'Pak Jaya Santoso',
  'Ibu Lilis Kurnia',
  'Pak Maman Suparman',
  'Ibu Ningsih',
]

export const commodityOptions = ['Kopi Robusta', 'Kakao Fermentasi', 'Beras Organik']
export const collectorOptions = ['Raka', 'Mira', 'Dewi']
export const gradeOptions = ['A', 'B', 'C']

export const qcRecords: QcRecord[] = [
  {
    id: 'QC-2108',
    depositId: 'STR-1028',
    member: 'Ibu Sari Wulandari',
    commodity: 'Kopi Robusta',
    checkedAt: '10 Jul 2026',
    moisturePercent: 11.5,
    sizeGrade: 'A',
    defectPercent: 1.8,
    score: 92,
    decision: 'Prioritas',
    inspector: 'Dewi',
  },
  {
    id: 'QC-2107',
    depositId: 'STR-1027',
    member: 'Pak Jaya Santoso',
    commodity: 'Kakao Fermentasi',
    checkedAt: '10 Jul 2026',
    moisturePercent: 7.2,
    sizeGrade: 'B',
    defectPercent: 2.4,
    score: 88,
    decision: 'Lolos',
    inspector: 'Raka',
  },
  {
    id: 'QC-2106',
    depositId: 'STR-1025',
    member: 'Pak Maman Suparman',
    commodity: 'Kopi Robusta',
    checkedAt: '09 Jul 2026',
    moisturePercent: 12.1,
    sizeGrade: 'A',
    defectPercent: 2.2,
    score: 90,
    decision: 'Lolos',
    inspector: 'Mira',
  },
  {
    id: 'QC-2105',
    depositId: 'STR-1022',
    member: 'Ibu Ratna',
    commodity: 'Beras Organik',
    checkedAt: '08 Jul 2026',
    moisturePercent: 15.8,
    sizeGrade: 'C',
    defectPercent: 4.9,
    score: 76,
    decision: 'Tahan',
    inspector: 'Dewi',
  },
]

export const allocationCandidates: AllocationCandidate[] = [
  {
    depositId: 'STR-1028',
    member: 'Ibu Sari Wulandari',
    commodity: 'Kopi Robusta',
    availableKg: 420,
    qualityScore: 92,
    recommendation: 'Prioritas',
  },
  {
    depositId: 'STR-1025',
    member: 'Pak Maman Suparman',
    commodity: 'Kopi Robusta',
    availableKg: 505,
    qualityScore: 90,
    recommendation: 'Prioritas',
  },
  {
    depositId: 'STR-1027',
    member: 'Pak Jaya Santoso',
    commodity: 'Kakao Fermentasi',
    availableKg: 315,
    qualityScore: 88,
    recommendation: 'Cocok',
  },
  {
    depositId: 'STR-1021',
    member: 'Ibu Ratna',
    commodity: 'Beras Organik',
    availableKg: 690,
    qualityScore: 84,
    recommendation: 'Cadangan',
  },
]

export const profitShares: ProfitShareRecord[] = [
  {
    member: 'Ibu Sari Wulandari',
    contractId: 'AGR-2026-014',
    commodity: 'Kopi Robusta',
    contributedKg: 420,
    qualityScore: 92,
    amount: 14280000,
    calculatedAt: '20 Jul 2026',
  },
  {
    member: 'Pak Maman Suparman',
    contractId: 'AGR-2026-014',
    commodity: 'Kopi Robusta',
    contributedKg: 505,
    qualityScore: 90,
    amount: 16750000,
    calculatedAt: '20 Jul 2026',
  },
  {
    member: 'Pak Jaya Santoso',
    contractId: 'AGR-2026-017',
    commodity: 'Kakao Fermentasi',
    contributedKg: 315,
    qualityScore: 88,
    amount: 9450000,
    calculatedAt: '28 Jul 2026',
  },
]

export const totalStock = stockSummaries.reduce((total, item) => total + item.totalKg, 0)
export const totalReady = stockSummaries.reduce((total, item) => total + item.readyKg, 0)
export const averageQuality = Math.round(
  stockSummaries.reduce((total, item) => total + item.quality, 0) /
    stockSummaries.length,
)
export const activeFulfilled = contracts.reduce(
  (total, contract) => total + contract.fulfilledKg,
  0,
)
export const activeTargets = contracts.reduce(
  (total, contract) => total + contract.targetKg,
  0,
)
export const overallProgress = Math.round((activeFulfilled / activeTargets) * 100)

export function formatKg(value: number) {
  return `${value.toLocaleString('id-ID')} kg`
}

export function progressPercent(current: number, target: number) {
  return Math.round((current / target) * 100)
}

export function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${cell.replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function validateDepositForm(form: DepositFormState) {
  const errors: DepositFormErrors = {}
  if (!form.member) errors.member = 'Nama anggota wajib dipilih.'
  if (!form.commodity) errors.commodity = 'Komoditas wajib dipilih.'
  if (!form.weightKg || Number.isNaN(Number(form.weightKg)) || Number(form.weightKg) <= 0) {
    errors.weightKg = 'Berat harus berupa angka positif.'
  }
  if (!form.collector) errors.collector = 'Nama pencatat wajib diisi.'
  return errors
}

export function calculateQualityScore(form: QcFormState) {
  const moisture = Number(form.moisturePercent) || 0
  const defect = Number(form.defectPercent) || 0
  const baseScore = 100
  const moisturePenalty = moisture > 12 ? (moisture - 12) * 5 : 0
  const defectPenalty = defect * 3
  const finalScore = Math.max(0, Math.min(100, Math.round(baseScore - moisturePenalty - defectPenalty)))
  return finalScore
}

export function validateContractForm(form: ContractFormState) {
  const errors: ContractFormErrors = {}
  if (!form.buyer.trim()) errors.buyer = 'Nama pembeli wajib diisi.'
  if (!form.commodity) errors.commodity = 'Komoditas wajib dipilih.'
  if (!form.targetKg || Number.isNaN(Number(form.targetKg)) || Number(form.targetKg) <= 0) {
    errors.targetKg = 'Target volume harus berupa angka positif.'
  }
  if (
    !form.minimumQuality ||
    Number.isNaN(Number(form.minimumQuality)) ||
    Number(form.minimumQuality) < 0 ||
    Number(form.minimumQuality) > 100
  ) {
    errors.minimumQuality = 'Standar kualitas minimal bernilai 0 - 100.'
  }
  if (!form.pricePerKg || Number.isNaN(Number(form.pricePerKg)) || Number(form.pricePerKg) <= 0) {
    errors.pricePerKg = 'Harga per kilogram harus berupa angka positif.'
  }
  return errors
}
