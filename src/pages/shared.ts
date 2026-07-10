import type { AuthUser } from '../lib/auth'

export type DepositStatus = 'recorded' | 'quality_checked' | 'allocated' | 'rejected'
export type ContractStatus = 'draft' | 'active' | 'completed' | 'cancelled'
export type QualityDecision = 'priority' | 'passed' | 'held'
export type SizeGrade = 'A' | 'B' | 'C'

export type DepositFormState = {
  memberId: string
  commodityId: string
  weightKg: string
  submittedAt: string
  collector: string
  origin: string
  notes: string
}

export type DepositFormErrors = Partial<Record<keyof DepositFormState, string>>

export type QcFormState = {
  depositId: string
  moisturePercent: string
  sizeGrade: SizeGrade
  defectPercent: string
  inspector: string
  notes: string
}

export type ContractFormState = {
  buyerId: string
  commodityId: string
  targetKg: string
  minimumQuality: string
  pricePerKg: string
  deadline: string
  title: string
  notes: string
}

export type ContractFormErrors = Partial<Record<keyof ContractFormState, string>>
export type MockUser = AuthUser

export const gradeOptions: SizeGrade[] = ['A', 'B', 'C']

export function formatKg(value: number) {
  return `${value.toLocaleString('id-ID')} kg`
}

export function formatDate(value: number | null | undefined) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function progressPercent(current: number, target: number) {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

export function mapDepositStatus(status: DepositStatus) {
  const labels: Record<DepositStatus, 'Tercatat' | 'Lolos QC' | 'Dialokasi' | 'Ditolak'> = {
    recorded: 'Tercatat',
    quality_checked: 'Lolos QC',
    allocated: 'Dialokasi',
    rejected: 'Ditolak',
  }
  return labels[status]
}

export function mapContractStatus(status: ContractStatus) {
  const labels: Record<ContractStatus, 'Baru' | 'Aktif' | 'Selesai' | 'Batal'> = {
    draft: 'Baru',
    active: 'Aktif',
    completed: 'Selesai',
    cancelled: 'Batal',
  }
  return labels[status]
}

export function mapQualityDecision(decision: QualityDecision | null | undefined) {
  if (decision === 'priority') return 'Prioritas'
  if (decision === 'passed') return 'Lolos'
  if (decision === 'held') return 'Tahan'
  return '-'
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
  if (!form.memberId) errors.memberId = 'Nama anggota wajib dipilih.'
  if (!form.commodityId) errors.commodityId = 'Komoditas wajib dipilih.'
  if (!form.weightKg || Number.isNaN(Number(form.weightKg)) || Number(form.weightKg) <= 0) {
    errors.weightKg = 'Berat harus berupa angka positif.'
  }
  if (!form.submittedAt) errors.submittedAt = 'Tanggal setor wajib diisi.'
  if (!form.collector.trim()) errors.collector = 'Nama pencatat wajib diisi.'
  if (!form.origin.trim()) errors.origin = 'Asal dusun wajib diisi.'
  return errors
}

export function calculateQualityScore(form: QcFormState) {
  const moisture = Number(form.moisturePercent) || 0
  const defect = Number(form.defectPercent) || 0
  const moisturePenalty =
    moisture < 10 ? (10 - moisture) * 2 : Math.max(0, moisture - 13) * 3
  const gradePenalty = form.sizeGrade === 'A' ? 0 : form.sizeGrade === 'B' ? 6 : 14
  const defectPenalty = defect * 4
  const finalScore = Math.max(0, Math.min(100, Math.round(100 - moisturePenalty - gradePenalty - defectPenalty)))
  return finalScore
}

export function validateContractForm(form: ContractFormState) {
  const errors: ContractFormErrors = {}
  if (!form.buyerId) errors.buyerId = 'Buyer wajib dipilih.'
  if (!form.commodityId) errors.commodityId = 'Komoditas wajib dipilih.'
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
  if (!form.deadline) errors.deadline = 'Tenggat wajib diisi.'
  return errors
}
