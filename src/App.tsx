import { useMemo, useState } from 'react'
import './App.css'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'

type Page =
  | 'dashboard'
  | 'deposits'
  | 'newDeposit'
  | 'qcHistory'
  | 'qcDepositDetail'
  | 'qcForm'
  | 'qcResultDetail'
  | 'allocation'
  | 'allocationStatus'
  | 'contracts'
  | 'newContract'
  | 'contractDetail'
  | 'depositReport'
  | 'profitShares'
  | 'login'
  | 'register'
  | 'resetPassword'
  | 'profile'
  | 'members'
  | 'commodities'
  | 'cooperativeProfile'

type StockSummary = {
  commodity: string
  totalKg: number
  quality: number
  readyKg: number
  trend: string
}

type ContractProgress = {
  id: string
  buyer: string
  commodity: string
  targetKg: number
  fulfilledKg: number
  minimumQuality: number
  deadline: string
  status: 'Baru' | 'Aktif' | 'Prioritas' | 'Selesai' | 'Batal'
}

type SupplyPool = {
  contractId: string
  commodity: string
  allocatedKg: number
  candidateKg: number
  contributors: number
  score: number
}

type Notification = {
  title: string
  body: string
  time: string
}

type DepositRecord = {
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

type DepositFormState = {
  member: string
  commodity: string
  weightKg: string
  submittedAt: string
  collector: string
  origin: string
  notes: string
}

type DepositFormErrors = Partial<Record<keyof DepositFormState, string>>

type QcRecord = {
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

type QcFormState = {
  depositId: string
  moisturePercent: string
  sizeGrade: string
  defectPercent: string
  inspector: string
  notes: string
}

type AllocationCandidate = {
  depositId: string
  member: string
  commodity: string
  availableKg: number
  qualityScore: number
  recommendation: 'Prioritas' | 'Cocok' | 'Cadangan'
}

type ContractFormState = {
  buyer: string
  commodity: string
  targetKg: string
  minimumQuality: string
  pricePerKg: string
  deadline: string
}

type ContractFormErrors = Partial<Record<keyof ContractFormState, string>>

type ProfitShareRecord = {
  member: string
  contractId: string
  commodity: string
  contributedKg: number
  qualityScore: number
  amount: number
  calculatedAt: string
}

type MockUser = {
  name: string
  email: string
  role: 'Admin' | 'Koperasi' | 'Buyer'
}

/*
type MemberRecord = {
  name: string
  phone: string
  village: string
  commodity: string
  status: 'Aktif' | 'Perlu Verifikasi'
}
*/

const stockSummaries: StockSummary[] = [
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

const contracts: ContractProgress[] = [
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

const supplyPools: SupplyPool[] = [
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

const notifications: Notification[] = [
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

const initialDepositRecords: DepositRecord[] = [
  {
    id: 'STR-1028',
    member: 'Ibu Sari Wulandari',
    commodity: 'Kopi Robusta',
    weightKg: 420,
    submittedAt: '10 Jul 2026',
    qualityScore: 92,
    status: 'Dialokasi',
    collector: 'Raka',
    phone: '0812-4400-1028',
    origin: 'Dusun Cibuntu',
    notes: 'Sudah dialokasikan ke AGR-2026-014 untuk pemenuhan kopi robusta.',
  },
  {
    id: 'STR-1027',
    member: 'Pak Jaya Santoso',
    commodity: 'Kakao Fermentasi',
    weightKg: 315,
    submittedAt: '10 Jul 2026',
    qualityScore: 88,
    status: 'Lolos QC',
    collector: 'Mira',
    phone: '0812-4400-1027',
    origin: 'Dusun Pasir Jati',
    notes: 'Fermentasi merata dan siap direkomendasikan ke pool kakao.',
  },
  {
    id: 'STR-1026',
    member: 'Ibu Lilis Kurnia',
    commodity: 'Beras Organik',
    weightKg: 760,
    submittedAt: '09 Jul 2026',
    qualityScore: null,
    status: 'Menunggu QC',
    collector: 'Raka',
    phone: '0812-4400-1026',
    origin: 'Dusun Sukamaju',
    notes: 'Menunggu pengukuran kadar air sebelum masuk stok siap alokasi.',
  },
  {
    id: 'STR-1025',
    member: 'Pak Maman Suparman',
    commodity: 'Kopi Robusta',
    weightKg: 505,
    submittedAt: '09 Jul 2026',
    qualityScore: 90,
    status: 'Lolos QC',
    collector: 'Dewi',
    phone: '0812-4400-1025',
    origin: 'Dusun Cikadu',
    notes: 'Ukuran biji seragam, prioritas untuk kontrak kopi minggu ini.',
  },
  {
    id: 'STR-1024',
    member: 'Ibu Ningsih',
    commodity: 'Kakao Fermentasi',
    weightKg: 280,
    submittedAt: '08 Jul 2026',
    qualityScore: null,
    status: 'Tercatat',
    collector: 'Mira',
    phone: '0812-4400-1024',
    origin: 'Dusun Cileuweung',
    notes: 'Setoran baru diterima dan belum masuk antrean pemeriksaan kualitas.',
  },
]

const navItems: { page: Page; label: string }[] = [
  { page: 'dashboard', label: 'Dashboard' },
  { page: 'deposits', label: 'Riwayat Setoran' },
  { page: 'newDeposit', label: 'Setoran Baru' },
  { page: 'qcHistory', label: 'Riwayat QC' },
  { page: 'qcDepositDetail', label: 'Detail Setoran QC' },
  { page: 'qcForm', label: 'Form QC' },
  { page: 'qcResultDetail', label: 'Detail Hasil QC' },
  { page: 'allocation', label: 'Alokasi Stok' },
  { page: 'allocationStatus', label: 'Status Alokasi' },
  { page: 'contracts', label: 'Kontrak' },
  { page: 'newContract', label: 'Kontrak Baru' },
  { page: 'contractDetail', label: 'Detail Kontrak' },
  { page: 'depositReport', label: 'Laporan Setoran' },
  { page: 'profitShares', label: 'Bagi Hasil' },
  { page: 'login', label: 'Login' },
  { page: 'register', label: 'Daftar' },
  { page: 'resetPassword', label: 'Reset Password' },
  { page: 'profile', label: 'Profil' },
  { page: 'members', label: 'Anggota' },
  { page: 'commodities', label: 'Komoditas' },
  { page: 'cooperativeProfile', label: 'Profil Koperasi' },
]

const memberOptions = [
  'Ibu Sari Wulandari',
  'Pak Jaya Santoso',
  'Ibu Lilis Kurnia',
  'Pak Maman Suparman',
  'Ibu Ningsih',
]

const commodityOptions = ['Kopi Robusta', 'Kakao Fermentasi', 'Beras Organik']
const collectorOptions = ['Raka', 'Mira', 'Dewi']
const gradeOptions = ['A', 'B', 'C']

const qcRecords: QcRecord[] = [
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

const allocationCandidates: AllocationCandidate[] = [
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

const profitShares: ProfitShareRecord[] = [
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

/*
const members: MemberRecord[] = [
  {
    name: 'Ibu Sari Wulandari',
    phone: '0812-4400-1028',
    village: 'Cibuntu',
    commodity: 'Kopi Robusta',
    status: 'Aktif',
  },
  {
    name: 'Pak Jaya Santoso',
    phone: '0812-4400-1027',
    village: 'Pasir Jati',
    commodity: 'Kakao Fermentasi',
    status: 'Aktif',
  },
  {
    name: 'Ibu Lilis Kurnia',
    phone: '0812-4400-1026',
    village: 'Sukamaju',
    commodity: 'Beras Organik',
    status: 'Perlu Verifikasi',
  },
]
*/

const totalStock = stockSummaries.reduce((total, item) => total + item.totalKg, 0)
const totalReady = stockSummaries.reduce((total, item) => total + item.readyKg, 0)
const averageQuality = Math.round(
  stockSummaries.reduce((total, item) => total + item.quality, 0) /
    stockSummaries.length,
)
const activeFulfilled = contracts.reduce(
  (total, contract) => total + contract.fulfilledKg,
  0,
)
const activeTargets = contracts.reduce(
  (total, contract) => total + contract.targetKg,
  0,
)
const overallProgress = Math.round((activeFulfilled / activeTargets) * 100)

function formatKg(value: number) {
  return `${value.toLocaleString('id-ID')} kg`
}

function progressPercent(current: number, target: number) {
  return Math.round((current / target) * 100)
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${cell.replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function validateDepositForm(form: DepositFormState) {
  const errors: DepositFormErrors = {}
  const weight = Number(form.weightKg)

  if (!form.member) {
    errors.member = 'Pilih anggota penyetor.'
  }

  if (!form.commodity) {
    errors.commodity = 'Pilih komoditas setoran.'
  }

  if (!form.weightKg || Number.isNaN(weight) || weight <= 0) {
    errors.weightKg = 'Berat setoran harus lebih dari 0 kg.'
  }

  if (!form.submittedAt) {
    errors.submittedAt = 'Tanggal setor wajib diisi.'
  }

  if (!form.collector) {
    errors.collector = 'Pilih petugas penerima.'
  }

  if (form.origin.trim().length < 3) {
    errors.origin = 'Asal dusun minimal 3 karakter.'
  }

  if (form.notes.length > 160) {
    errors.notes = 'Catatan maksimal 160 karakter.'
  }

  return errors
}

function calculateQualityScore(form: QcFormState) {
  const moisture = Number(form.moisturePercent)
  const defect = Number(form.defectPercent)
  const moisturePenalty =
    moisture < 10 ? (10 - moisture) * 2 : Math.max(0, moisture - 13) * 3
  const gradePenalty =
    form.sizeGrade === 'A' ? 0 : form.sizeGrade === 'B' ? 6 : 14
  const defectPenalty = Number.isNaN(defect) ? 0 : defect * 4
  const rawScore = 100 - moisturePenalty - gradePenalty - defectPenalty

  if (Number.isNaN(rawScore)) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round(rawScore)))
}

function validateContractForm(form: ContractFormState) {
  const errors: ContractFormErrors = {}

  if (form.buyer.trim().length < 3) {
    errors.buyer = 'Nama buyer minimal 3 karakter.'
  }

  if (!form.commodity) {
    errors.commodity = 'Pilih komoditas kontrak.'
  }

  if (Number(form.targetKg) <= 0) {
    errors.targetKg = 'Target volume harus lebih dari 0 kg.'
  }

  if (Number(form.minimumQuality) < 0 || Number(form.minimumQuality) > 100) {
    errors.minimumQuality = 'Quality minimum harus antara 0 sampai 100.'
  }

  if (Number(form.pricePerKg) <= 0) {
    errors.pricePerKg = 'Harga per kg harus lebih dari 0.'
  }

  if (!form.deadline) {
    errors.deadline = 'Tenggat wajib diisi.'
  }

  return errors
}

function DashboardPage() {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Dashboard Koperasi</p>
          <h1>Kapasitas pasok hari ini</h1>
        </div>
        <div className="operator-panel" aria-label="Profil koperasi aktif">
          <span>Koperasi Tani Makmur</span>
          <strong>Jawa Barat</strong>
        </div>
      </header>

      <section className="overview-grid" aria-label="Ringkasan operasional">
        <article className="metric-card">
          <span>Total Stok Tercatat</span>
          <strong>{formatKg(totalStock)}</strong>
          <small>{formatKg(totalReady)} siap dialokasi</small>
        </article>
        <article className="metric-card">
          <span>Quality Score Rata-rata</span>
          <strong>{averageQuality}</strong>
          <small>Di atas standar kontrak aktif</small>
        </article>
        <article className="metric-card">
          <span>Progres Kontrak Aktif</span>
          <strong>{overallProgress}%</strong>
          <small>{contracts.length} kontrak dalam pemenuhan</small>
        </article>
        <article className="metric-card alert">
          <span>Notifikasi Kontrak</span>
          <strong>{notifications.length}</strong>
          <small>Perlu ditinjau pengurus</small>
        </article>
      </section>

      <section className="content-grid">
        <div className="panel stock-panel">
          <div className="section-heading">
            <p className="eyebrow">Ringkasan Stok</p>
            <h2>Komoditas dan kualitas terkini</h2>
          </div>
          <div className="stock-list">
            {stockSummaries.map((stock) => (
              <article className="stock-row" key={stock.commodity}>
                <div>
                  <strong>{stock.commodity}</strong>
                  <span>{stock.trend}</span>
                </div>
                <div className="stock-values">
                  <span>{formatKg(stock.totalKg)}</span>
                  <b>QS {stock.quality}</b>
                </div>
                <div
                  className="quality-bar"
                  aria-label={`Quality score ${stock.quality}`}
                >
                  <span style={{ width: `${stock.quality}%` }} />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel notification-panel">
          <div className="section-heading">
            <p className="eyebrow">Notifikasi Kontrak</p>
            <h2>Peluang buyer masuk</h2>
          </div>
          <div className="notification-list">
            {notifications.map((notification) => (
              <article className="notification-item" key={notification.title}>
                <div className="pulse" aria-hidden="true" />
                <div>
                  <strong>{notification.title}</strong>
                  <p>{notification.body}</p>
                  <time>{notification.time}</time>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel contracts-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Progres Kontrak</p>
            <h2>Kontrak aktif dan pemenuhan volume</h2>
          </div>
          <span>{formatKg(activeFulfilled)} terkumpul</span>
        </div>
        <div className="contract-list">
          {contracts.map((contract) => {
            const percent = progressPercent(
              contract.fulfilledKg,
              contract.targetKg,
            )

            return (
              <article className="contract-row" key={contract.id}>
                <div className="contract-main">
                  <span className={`status-pill ${contract.status.toLowerCase()}`}>
                    {contract.status}
                  </span>
                  <div>
                    <strong>{contract.buyer}</strong>
                    <p>
                      {contract.id} / {contract.commodity} / minimum QS{' '}
                      {contract.minimumQuality}
                    </p>
                  </div>
                </div>
                <div className="contract-progress">
                  <div className="progress-meta">
                    <span>
                      {formatKg(contract.fulfilledKg)} dari{' '}
                      {formatKg(contract.targetKg)}
                    </span>
                    <strong>{percent}%</strong>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <small>Tenggat {contract.deadline}</small>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="panel pools-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Status Supply Pool</p>
            <h2>Alokasi stok ke portofolio kontrak</h2>
          </div>
          <span>Real-time mock data</span>
        </div>
        <div className="pool-grid">
          {supplyPools.map((pool) => (
            <article className="pool-card" key={pool.contractId}>
              <div>
                <span>{pool.contractId}</span>
                <strong>{pool.commodity}</strong>
              </div>
              <dl>
                <div>
                  <dt>Teralokasi</dt>
                  <dd>{formatKg(pool.allocatedKg)}</dd>
                </div>
                <div>
                  <dt>Kandidat</dt>
                  <dd>{formatKg(pool.candidateKg)}</dd>
                </div>
                <div>
                  <dt>Anggota</dt>
                  <dd>{pool.contributors}</dd>
                </div>
                <div>
                  <dt>Pool QS</dt>
                  <dd>{pool.score}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function DepositHistoryPage({ records }: { records: DepositRecord[] }) {
  const [selectedDepositId, setSelectedDepositId] = useState(records[0].id)
  const totals = useMemo(
    () => ({
      totalWeight: records.reduce(
        (total, deposit) => total + deposit.weightKg,
        0,
      ),
      waitingQc: records.filter(
        (deposit) =>
          deposit.status === 'Menunggu QC' || deposit.status === 'Tercatat',
      ).length,
      ready: records.filter((deposit) => deposit.status === 'Lolos QC').length,
      allocated: records.filter((deposit) => deposit.status === 'Dialokasi')
        .length,
    }),
    [records],
  )
  const selectedDeposit =
    records.find((deposit) => deposit.id === selectedDepositId) ?? records[0]

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Pencatatan Setoran</p>
          <h1>Riwayat setoran anggota</h1>
        </div>
        <div className="operator-panel" aria-label="Ringkasan setoran hari ini">
          <span>Total setoran tercatat</span>
          <strong>{records.length} transaksi</strong>
        </div>
      </header>

      <section className="overview-grid" aria-label="Ringkasan riwayat setoran">
        <article className="metric-card">
          <span>Total Volume</span>
          <strong>{formatKg(totals.totalWeight)}</strong>
          <small>Dari semua komoditas</small>
        </article>
        <article className="metric-card">
          <span>Menunggu QC</span>
          <strong>{totals.waitingQc}</strong>
          <small>Perlu pemeriksaan kualitas</small>
        </article>
        <article className="metric-card">
          <span>Lolos QC</span>
          <strong>{totals.ready}</strong>
          <small>Siap masuk supply pool</small>
        </article>
        <article className="metric-card">
          <span>Sudah Dialokasi</span>
          <strong>{totals.allocated}</strong>
          <small>Menjadi aset kontrak</small>
        </article>
      </section>

      <section className="deposit-workspace">
        <div className="panel deposit-panel">
          <div className="section-heading inline">
            <div>
              <p className="eyebrow">Riwayat Setoran</p>
              <h2>Daftar panen yang diterima koperasi</h2>
            </div>
            <span>Data tiruan</span>
          </div>
          <div className="deposit-table" role="table" aria-label="Riwayat setoran">
            <div className="deposit-table-head" role="row">
              <span>ID</span>
              <span>Anggota</span>
              <span>Komoditas</span>
              <span>Berat</span>
              <span>Tanggal</span>
              <span>Quality</span>
              <span>Status</span>
            </div>
            {records.map((deposit) => (
              <button
                aria-pressed={selectedDeposit.id === deposit.id}
                className={`deposit-row ${
                  selectedDeposit.id === deposit.id ? 'selected' : ''
                }`}
                key={deposit.id}
                role="row"
                type="button"
                onClick={() => setSelectedDepositId(deposit.id)}
              >
                <span className="record-id">{deposit.id}</span>
                <div>
                  <strong>{deposit.member}</strong>
                  <small>Petugas {deposit.collector}</small>
                </div>
                <span>{deposit.commodity}</span>
                <span>{formatKg(deposit.weightKg)}</span>
                <time>{deposit.submittedAt}</time>
                <span>
                  {deposit.qualityScore === null
                    ? '-'
                    : `QS ${deposit.qualityScore}`}
                </span>
                <span
                  className={`status-pill deposit-status ${deposit.status
                    .toLowerCase()
                    .replaceAll(' ', '-')}`}
                >
                  {deposit.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        <aside className="panel deposit-detail" aria-label="Detail setoran">
          <div className="section-heading">
            <p className="eyebrow">Detail Setoran</p>
            <h2>{selectedDeposit.id}</h2>
          </div>
          <div className="detail-stack">
            <div>
              <span>Anggota</span>
              <strong>{selectedDeposit.member}</strong>
              <small>
                {selectedDeposit.phone} / {selectedDeposit.origin}
              </small>
            </div>
            <div>
              <span>Komoditas</span>
              <strong>{selectedDeposit.commodity}</strong>
              <small>{formatKg(selectedDeposit.weightKg)} diterima</small>
            </div>
            <div>
              <span>Status Operasional</span>
              <strong>{selectedDeposit.status}</strong>
              <small>
                Quality{' '}
                {selectedDeposit.qualityScore === null
                  ? 'belum tersedia'
                  : `QS ${selectedDeposit.qualityScore}`}
              </small>
            </div>
            <div>
              <span>Catatan</span>
              <p>{selectedDeposit.notes}</p>
            </div>
          </div>
        </aside>
      </section>
    </>
  )
}

function NewDepositPage({
  onSave,
}: {
  onSave: (record: DepositRecord) => void
}) {
  const [form, setForm] = useState<DepositFormState>({
    member: memberOptions[0],
    commodity: commodityOptions[0],
    weightKg: '250',
    submittedAt: '2026-07-10',
    collector: collectorOptions[0],
    origin: 'Dusun Cibuntu',
    notes: '',
  })
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<DepositFormErrors>({})
  const estimatedQueue = form.commodity === 'Kopi Robusta' ? 'QC kopi' : 'QC umum'

  function updateField(field: keyof DepositFormState, value: string) {
    setSaved(false)
    setErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Pencatatan Setoran</p>
          <h1>Form setoran baru</h1>
        </div>
        <div className="operator-panel" aria-label="Status form setoran">
          <span>Antrean pemeriksaan</span>
          <strong>{estimatedQueue}</strong>
        </div>
      </header>

      <section className="form-workspace">
        <form
          className="panel deposit-form"
          onSubmit={(event) => {
            event.preventDefault()
            const nextErrors = validateDepositForm(form)
            setErrors(nextErrors)
            if (Object.keys(nextErrors).length > 0) {
              setSaved(false)
              return
            }
            onSave({
              id: `STR-${Date.now().toString().slice(-6)}`,
              member: form.member,
              commodity: form.commodity,
              weightKg: Number(form.weightKg),
              submittedAt: form.submittedAt,
              qualityScore: null,
              status: 'Tercatat',
              collector: form.collector,
              phone: '0812-4400-0000',
              origin: form.origin,
              notes:
                form.notes.trim() ||
                'Setoran baru tersimpan dan siap masuk antrean Quality Check.',
            })
            setSaved(true)
          }}
        >
          <div className="section-heading">
            <p className="eyebrow">Input Setoran</p>
            <h2>Data panen anggota</h2>
          </div>

          <label>
            <span>Nama Anggota</span>
            <select
              aria-invalid={Boolean(errors.member)}
              value={form.member}
              onChange={(event) => updateField('member', event.target.value)}
            >
              {memberOptions.map((member) => (
                <option key={member}>{member}</option>
              ))}
            </select>
            {errors.member ? <small className="field-error">{errors.member}</small> : null}
          </label>

          <label>
            <span>Komoditas</span>
            <select
              aria-invalid={Boolean(errors.commodity)}
              value={form.commodity}
              onChange={(event) => updateField('commodity', event.target.value)}
            >
              {commodityOptions.map((commodity) => (
                <option key={commodity}>{commodity}</option>
              ))}
            </select>
            {errors.commodity ? (
              <small className="field-error">{errors.commodity}</small>
            ) : null}
          </label>

          <div className="form-grid">
            <label>
              <span>Berat Setoran (kg)</span>
              <input
                aria-invalid={Boolean(errors.weightKg)}
                min="1"
                type="number"
                value={form.weightKg}
                onChange={(event) => updateField('weightKg', event.target.value)}
              />
              {errors.weightKg ? (
                <small className="field-error">{errors.weightKg}</small>
              ) : null}
            </label>
            <label>
              <span>Tanggal Setor</span>
              <input
                aria-invalid={Boolean(errors.submittedAt)}
                type="date"
                value={form.submittedAt}
                onChange={(event) =>
                  updateField('submittedAt', event.target.value)
                }
              />
              {errors.submittedAt ? (
                <small className="field-error">{errors.submittedAt}</small>
              ) : null}
            </label>
          </div>

          <div className="form-grid">
            <label>
              <span>Petugas Penerima</span>
              <select
                aria-invalid={Boolean(errors.collector)}
                value={form.collector}
                onChange={(event) => updateField('collector', event.target.value)}
              >
                {collectorOptions.map((collector) => (
                  <option key={collector}>{collector}</option>
                ))}
              </select>
              {errors.collector ? (
                <small className="field-error">{errors.collector}</small>
              ) : null}
            </label>
            <label>
              <span>Asal Dusun</span>
              <input
                aria-invalid={Boolean(errors.origin)}
                value={form.origin}
                onChange={(event) => updateField('origin', event.target.value)}
              />
              {errors.origin ? (
                <small className="field-error">{errors.origin}</small>
              ) : null}
            </label>
          </div>

          <label>
            <span>Catatan Awal</span>
            <textarea
              aria-invalid={Boolean(errors.notes)}
              rows={4}
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Mis. kondisi kemasan, kadar kering awal, atau antrean QC."
            />
            {errors.notes ? <small className="field-error">{errors.notes}</small> : null}
          </label>

          <button className="primary-action" type="submit">
            Simpan Draft Setoran
          </button>
        </form>

        <aside className="panel form-preview" aria-label="Preview setoran">
          <div className="section-heading">
            <p className="eyebrow">Preview</p>
            <h2>Ringkasan setoran</h2>
          </div>
          <dl>
            <div>
              <dt>Anggota</dt>
              <dd>{form.member}</dd>
            </div>
            <div>
              <dt>Komoditas</dt>
              <dd>{form.commodity}</dd>
            </div>
            <div>
              <dt>Berat</dt>
              <dd>{form.weightKg || '0'} kg</dd>
            </div>
            <div>
              <dt>Status Awal</dt>
              <dd>Menunggu QC</dd>
            </div>
          </dl>
          {saved ? (
            <p className="success-note">
              Draft setoran siap masuk riwayat dan antrean Quality Check.
            </p>
          ) : null}
        </aside>
      </section>
    </>
  )
}

function QcHistoryPage() {
  const averageScore = Math.round(
    qcRecords.reduce((total, record) => total + record.score, 0) /
      qcRecords.length,
  )
  const passedCount = qcRecords.filter((record) => record.decision !== 'Tahan')
    .length

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Quality Check</p>
          <h1>Riwayat pemeriksaan kualitas</h1>
        </div>
        <div className="operator-panel" aria-label="Ringkasan quality check">
          <span>Rata-rata Quality Score</span>
          <strong>{averageScore}</strong>
        </div>
      </header>

      <section className="overview-grid" aria-label="Ringkasan riwayat QC">
        <article className="metric-card">
          <span>Total QC</span>
          <strong>{qcRecords.length}</strong>
          <small>Pemeriksaan tercatat</small>
        </article>
        <article className="metric-card">
          <span>Lolos Standar</span>
          <strong>{passedCount}</strong>
          <small>Siap dipertimbangkan alokasi</small>
        </article>
        <article className="metric-card">
          <span>Perlu Ditahan</span>
          <strong>{qcRecords.length - passedCount}</strong>
          <small>Butuh tindak lanjut koperasi</small>
        </article>
        <article className="metric-card">
          <span>Skor Tertinggi</span>
          <strong>{Math.max(...qcRecords.map((record) => record.score))}</strong>
          <small>Prioritas supply pool</small>
        </article>
      </section>

      <section className="panel qc-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Riwayat QC</p>
            <h2>Parameter kualitas setoran</h2>
          </div>
          <span>Data tiruan</span>
        </div>
        <div className="qc-table" role="table" aria-label="Riwayat QC">
          <div className="qc-table-head" role="row">
            <span>ID QC</span>
            <span>Setoran</span>
            <span>Komoditas</span>
            <span>Kadar Air</span>
            <span>Grade</span>
            <span>Kerusakan</span>
            <span>Skor</span>
            <span>Keputusan</span>
          </div>
          {qcRecords.map((record) => (
            <article className="qc-row" role="row" key={record.id}>
              <span className="record-id">{record.id}</span>
              <div>
                <strong>{record.depositId}</strong>
                <small>
                  {record.member} / {record.inspector}
                </small>
              </div>
              <span>{record.commodity}</span>
              <span>{record.moisturePercent}%</span>
              <span>{record.sizeGrade}</span>
              <span>{record.defectPercent}%</span>
              <strong>{record.score}</strong>
              <span
                className={`status-pill qc-status ${record.decision.toLowerCase()}`}
              >
                {record.decision}
              </span>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function QcDepositDetailPage() {
  const deposit = initialDepositRecords[2]
  const [form, setForm] = useState<QcFormState>({
    depositId: deposit.id,
    moisturePercent: '12',
    sizeGrade: 'B',
    defectPercent: '2',
    inspector: 'Dewi',
    notes: '',
  })
  const qualityScore = calculateQualityScore(form)
  const checklist = [
    'Sampel fisik sudah diterima petugas QC',
    'Berat tercatat cocok dengan nota penerimaan',
    'Belum ada quality score final',
    'Menunggu pengukuran kadar air dan kerusakan',
  ]

  function updateField(field: keyof QcFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Quality Check</p>
          <h1>Detail setoran untuk pemeriksaan</h1>
        </div>
        <div className="operator-panel" aria-label="Setoran aktif untuk QC">
          <span>Setoran aktif</span>
          <strong>{deposit.id}</strong>
        </div>
      </header>

      <section className="detail-layout">
        <article className="panel qc-detail-card">
          <div className="section-heading">
            <p className="eyebrow">Identitas Setoran</p>
            <h2>{deposit.commodity}</h2>
          </div>
          <dl className="detail-metrics">
            <div>
              <dt>Anggota</dt>
              <dd>{deposit.member}</dd>
            </div>
            <div>
              <dt>Kontak</dt>
              <dd>{deposit.phone}</dd>
            </div>
            <div>
              <dt>Asal</dt>
              <dd>{deposit.origin}</dd>
            </div>
            <div>
              <dt>Berat</dt>
              <dd>{formatKg(deposit.weightKg)}</dd>
            </div>
            <div>
              <dt>Tanggal Setor</dt>
              <dd>{deposit.submittedAt}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{deposit.status}</dd>
            </div>
          </dl>
        </article>

        <article className="panel qc-detail-card">
          <div className="section-heading">
            <p className="eyebrow">Kesiapan QC</p>
            <h2>Antrean pemeriksaan</h2>
          </div>
          <ul className="checklist">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="sample-box">
            <span>Catatan awal</span>
            <p>{deposit.notes}</p>
          </div>
        </article>

        <article className="panel qc-detail-card wide">
          <div className="section-heading inline">
            <div>
              <p className="eyebrow">Parameter Target</p>
              <h2>Standar minimum komoditas</h2>
            </div>
            <span>Data tiruan</span>
          </div>
          <div className="parameter-grid">
            <div>
              <span>Kadar air ideal</span>
              <strong>10% - 13%</strong>
            </div>
            <div>
              <span>Grade ukuran</span>
              <strong>A atau B</strong>
            </div>
            <div>
              <span>Kerusakan maksimal</span>
              <strong>3%</strong>
            </div>
            <div>
              <span>Skor lolos</span>
              <strong>Minimal 82</strong>
            </div>
          </div>
        </article>

        <article className="panel qc-detail-card wide">
          <div className="section-heading inline">
            <div>
              <p className="eyebrow">Form Pemeriksaan</p>
              <h2>Input QC untuk {deposit.id}</h2>
            </div>
            <span>Skor lokal {qualityScore}</span>
          </div>
          <div className="embedded-qc-form">
            <label>
              <span>Kadar Air (%)</span>
              <input
                min="0"
                step="0.1"
                type="number"
                value={form.moisturePercent}
                onChange={(event) =>
                  updateField('moisturePercent', event.target.value)
                }
              />
            </label>
            <label>
              <span>Grade Ukuran</span>
              <select
                value={form.sizeGrade}
                onChange={(event) => updateField('sizeGrade', event.target.value)}
              >
                {gradeOptions.map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Kerusakan (%)</span>
              <input
                min="0"
                step="0.1"
                type="number"
                value={form.defectPercent}
                onChange={(event) =>
                  updateField('defectPercent', event.target.value)
                }
              />
            </label>
            <label>
              <span>Petugas QC</span>
              <select
                value={form.inspector}
                onChange={(event) => updateField('inspector', event.target.value)}
              >
                {collectorOptions.map((collector) => (
                  <option key={collector}>{collector}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="score-preview inline-score">
            <span>Quality Score</span>
            <strong>{qualityScore}</strong>
            <div className="quality-bar" aria-label={`Quality score ${qualityScore}`}>
              <span style={{ width: `${qualityScore}%` }} />
            </div>
          </div>
        </article>
      </section>
    </>
  )
}

function QcFormPage() {
  const [form, setForm] = useState<QcFormState>({
    depositId: 'STR-1026',
    moisturePercent: '12',
    sizeGrade: 'B',
    defectPercent: '2',
    inspector: 'Dewi',
    notes: '',
  })
  const qualityScore = calculateQualityScore(form)
  const scoreDecision =
    qualityScore >= 90 ? 'Prioritas' : qualityScore >= 82 ? 'Lolos' : 'Tahan'

  function updateField(field: keyof QcFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Quality Check</p>
          <h1>Form pemeriksaan kualitas</h1>
        </div>
        <div className="operator-panel" aria-label="Setoran yang diperiksa">
          <span>Setoran dipilih</span>
          <strong>{form.depositId}</strong>
        </div>
      </header>

      <section className="form-workspace">
        <form className="panel deposit-form">
          <div className="section-heading">
            <p className="eyebrow">Input QC</p>
            <h2>Parameter pemeriksaan</h2>
          </div>

          <label>
            <span>ID Setoran</span>
            <select
              value={form.depositId}
              onChange={(event) => updateField('depositId', event.target.value)}
            >
              {initialDepositRecords.map((deposit) => (
                <option key={deposit.id}>{deposit.id}</option>
              ))}
            </select>
          </label>

          <div className="form-grid">
            <label>
              <span>Kadar Air (%)</span>
              <input
                min="0"
                step="0.1"
                type="number"
                value={form.moisturePercent}
                onChange={(event) =>
                  updateField('moisturePercent', event.target.value)
                }
              />
            </label>
            <label>
              <span>Grade Ukuran</span>
              <select
                value={form.sizeGrade}
                onChange={(event) => updateField('sizeGrade', event.target.value)}
              >
                {gradeOptions.map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              <span>Kerusakan (%)</span>
              <input
                min="0"
                step="0.1"
                type="number"
                value={form.defectPercent}
                onChange={(event) =>
                  updateField('defectPercent', event.target.value)
                }
              />
            </label>
            <label>
              <span>Petugas QC</span>
              <select
                value={form.inspector}
                onChange={(event) => updateField('inspector', event.target.value)}
              >
                {collectorOptions.map((collector) => (
                  <option key={collector}>{collector}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>Catatan Pemeriksaan</span>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Catatan visual, aroma, kebersihan, atau rekomendasi."
            />
          </label>
        </form>

        <aside className="panel form-preview" aria-label="Preview input QC">
          <div className="section-heading">
            <p className="eyebrow">Preview QC</p>
            <h2>{form.depositId}</h2>
          </div>
          <dl>
            <div>
              <dt>Kadar Air</dt>
              <dd>{form.moisturePercent || '0'}%</dd>
            </div>
            <div>
              <dt>Grade</dt>
              <dd>{form.sizeGrade}</dd>
            </div>
            <div>
              <dt>Kerusakan</dt>
              <dd>{form.defectPercent || '0'}%</dd>
            </div>
            <div>
              <dt>Petugas</dt>
              <dd>{form.inspector}</dd>
            </div>
          </dl>
          <div className="score-preview">
            <span>Quality Score</span>
            <strong>{qualityScore}</strong>
            <div className="quality-bar" aria-label={`Quality score ${qualityScore}`}>
              <span style={{ width: `${qualityScore}%` }} />
            </div>
            <p>{scoreDecision} untuk standar supply pool koperasi.</p>
          </div>
        </aside>
      </section>
    </>
  )
}

function QcResultDetailPage() {
  const record = qcRecords[0]
  const recommendation =
    record.score >= 90
      ? 'Masukkan sebagai prioritas supply pool untuk kontrak aktif.'
      : record.score >= 82
        ? 'Layak dialokasikan setelah kebutuhan prioritas terpenuhi.'
        : 'Tahan dari pool dan lakukan sortasi ulang.'

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Quality Check</p>
          <h1>Detail hasil pemeriksaan</h1>
        </div>
        <div className="operator-panel" aria-label="Skor hasil QC">
          <span>Quality Score</span>
          <strong>{record.score}</strong>
        </div>
      </header>

      <section className="detail-layout">
        <article className="panel qc-result-hero">
          <div>
            <p className="eyebrow">{record.id}</p>
            <h2>{record.decision}</h2>
            <p>{recommendation}</p>
          </div>
          <div className="score-ring" aria-label={`Quality score ${record.score}`}>
            {record.score}
          </div>
        </article>

        <article className="panel qc-detail-card">
          <div className="section-heading">
            <p className="eyebrow">Setoran</p>
            <h2>{record.depositId}</h2>
          </div>
          <dl className="detail-metrics single">
            <div>
              <dt>Anggota</dt>
              <dd>{record.member}</dd>
            </div>
            <div>
              <dt>Komoditas</dt>
              <dd>{record.commodity}</dd>
            </div>
            <div>
              <dt>Petugas QC</dt>
              <dd>{record.inspector}</dd>
            </div>
            <div>
              <dt>Tanggal</dt>
              <dd>{record.checkedAt}</dd>
            </div>
          </dl>
        </article>

        <article className="panel qc-detail-card wide">
          <div className="section-heading inline">
            <div>
              <p className="eyebrow">Hasil Parameter</p>
              <h2>Rincian pengukuran kualitas</h2>
            </div>
            <span>Audit trail QC</span>
          </div>
          <div className="parameter-grid">
            <div>
              <span>Kadar Air</span>
              <strong>{record.moisturePercent}%</strong>
            </div>
            <div>
              <span>Grade Ukuran</span>
              <strong>{record.sizeGrade}</strong>
            </div>
            <div>
              <span>Kerusakan</span>
              <strong>{record.defectPercent}%</strong>
            </div>
            <div>
              <span>Keputusan</span>
              <strong>{record.decision}</strong>
            </div>
          </div>
        </article>
      </section>
    </>
  )
}

function AllocationPage() {
  const [selectedContractId, setSelectedContractId] = useState(contracts[0].id)
  const [selectedDepositIds, setSelectedDepositIds] = useState<string[]>([])
  const [allocationSaved, setAllocationSaved] = useState(false)
  const selectedContract =
    contracts.find((contract) => contract.id === selectedContractId) ??
    contracts[0]
  const matchingCandidates = allocationCandidates.filter(
    (candidate) => candidate.commodity === selectedContract.commodity,
  )
  const recommendedKg = allocationCandidates
    .filter((candidate) => candidate.commodity === selectedContract.commodity)
    .reduce((total, candidate) => total + candidate.availableKg, 0)
  const selectedKg = allocationCandidates
    .filter((candidate) => selectedDepositIds.includes(candidate.depositId))
    .reduce((total, candidate) => total + candidate.availableKg, 0)
  const remainingKg = selectedContract.targetKg - selectedContract.fulfilledKg
  const smartRecommendation = matchingCandidates
    .toSorted((a, b) => b.qualityScore - a.qualityScore)
    .reduce<AllocationCandidate[]>((selected, candidate) => {
      const total = selected.reduce((sum, item) => sum + item.availableKg, 0)
      return total >= remainingKg ? selected : [...selected, candidate]
    }, [])
  const smartRecommendationKg = smartRecommendation.reduce(
    (total, candidate) => total + candidate.availableKg,
    0,
  )

  function toggleDeposit(depositId: string) {
    setAllocationSaved(false)
    setSelectedDepositIds((current) =>
      current.includes(depositId)
        ? current.filter((id) => id !== depositId)
        : [...current, depositId],
    )
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Alokasi Stok</p>
          <h1>Susun supply pool kontrak</h1>
        </div>
        <div className="operator-panel" aria-label="Kontrak alokasi aktif">
          <span>Kontrak dipilih</span>
          <strong>{selectedContract.id}</strong>
        </div>
      </header>

      <section className="overview-grid" aria-label="Ringkasan alokasi">
        <article className="metric-card">
          <span>Target Kontrak</span>
          <strong>{formatKg(selectedContract.targetKg)}</strong>
          <small>{selectedContract.buyer}</small>
        </article>
        <article className="metric-card">
          <span>Sudah Terpenuhi</span>
          <strong>{progressPercent(selectedContract.fulfilledKg, selectedContract.targetKg)}%</strong>
          <small>{formatKg(selectedContract.fulfilledKg)} terkumpul</small>
        </article>
        <article className="metric-card">
          <span>Sisa Kebutuhan</span>
          <strong>{formatKg(remainingKg)}</strong>
          <small>Minimum QS {selectedContract.minimumQuality}</small>
        </article>
        <article className="metric-card">
          <span>Rekomendasi Tersedia</span>
          <strong>{formatKg(recommendedKg)}</strong>
          <small>Dari setoran lolos QC</small>
        </article>
        <article className="metric-card alert">
          <span>Dipilih untuk Alokasi</span>
          <strong>{formatKg(selectedKg)}</strong>
          <small>{selectedDepositIds.length} setoran dipilih</small>
        </article>
      </section>

      <section className="allocation-grid">
        <article className="panel">
          <div className="section-heading">
            <p className="eyebrow">Pilih Kontrak</p>
            <h2>Kontrak buyer aktif</h2>
          </div>
          <div className="contract-list">
            {contracts.map((contract) => (
              <button
                aria-pressed={selectedContract.id === contract.id}
                className={`allocation-contract ${
                  selectedContract.id === contract.id ? 'selected' : ''
                }`}
                key={contract.id}
                type="button"
                onClick={() => {
                  setSelectedContractId(contract.id)
                  setSelectedDepositIds([])
                  setAllocationSaved(false)
                }}
              >
                <strong>{contract.id}</strong>
                <span>{contract.buyer}</span>
                <small>
                  {contract.commodity} / {formatKg(contract.targetKg)}
                </small>
              </button>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="eyebrow">Pilih Setoran</p>
            <h2>Kandidat lolos QC</h2>
          </div>
          <div className="candidate-list">
            {matchingCandidates.map((candidate) => (
              <button
                aria-pressed={selectedDepositIds.includes(candidate.depositId)}
                className={`candidate-card ${
                  selectedDepositIds.includes(candidate.depositId)
                    ? 'selected'
                    : ''
                }`}
                key={candidate.depositId}
                type="button"
                onClick={() => toggleDeposit(candidate.depositId)}
              >
                <div>
                  <strong>{candidate.depositId}</strong>
                  <span>{candidate.member}</span>
                </div>
                <div>
                  <span>{candidate.commodity}</span>
                  <b>{formatKg(candidate.availableKg)}</b>
                </div>
                <span className="status-pill">{candidate.recommendation}</span>
                <small>QS {candidate.qualityScore}</small>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="panel smart-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Alokasi Cerdas</p>
            <h2>Rekomendasi tiruan untuk kontrak aktif</h2>
          </div>
          <button
            className="primary-action"
            type="button"
            onClick={() =>
              {
                setSelectedDepositIds(
                  smartRecommendation.map((candidate) => candidate.depositId),
                )
                setAllocationSaved(false)
              }
            }
          >
            Pilih Rekomendasi
          </button>
        </div>
        <div className="recommendation-strip">
          <div>
            <span>Volume direkomendasikan</span>
            <strong>{formatKg(smartRecommendationKg)}</strong>
          </div>
          <div>
            <span>Rata-rata QS</span>
            <strong>
              {Math.round(
                smartRecommendation.reduce(
                  (total, candidate) => total + candidate.qualityScore,
                  0,
                ) / smartRecommendation.length,
              )}
            </strong>
          </div>
          <div>
            <span>Setoran prioritas</span>
            <strong>{smartRecommendation.length}</strong>
          </div>
        </div>
        <div className="api-submit-row">
          <div>
            <span>Payload API</span>
            <strong>
              {selectedContract.id} / {selectedDepositIds.length} setoran /{' '}
              {formatKg(selectedKg)}
            </strong>
          </div>
          <button
            className="primary-action"
            disabled={selectedDepositIds.length === 0}
            type="button"
            onClick={() => setAllocationSaved(true)}
          >
            Simpan Alokasi
          </button>
        </div>
        {allocationSaved ? (
          <p className="success-note">
            Payload alokasi mock tersimpan dan siap diganti mutation Convex.
          </p>
        ) : null}
      </section>
    </>
  )
}

function AllocationStatusPage() {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Alokasi Stok</p>
          <h1>Status alokasi per kontrak</h1>
        </div>
        <div className="operator-panel" aria-label="Jumlah supply pool aktif">
          <span>Supply pool aktif</span>
          <strong>{supplyPools.length} kontrak</strong>
        </div>
      </header>

      <section className="panel contracts-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Status Alokasi</p>
            <h2>Progres pool dan kandidat tambahan</h2>
          </div>
          <span>Data tiruan</span>
        </div>
        <div className="allocation-status-list">
          {contracts.map((contract) => {
            const pool = supplyPools.find(
              (item) => item.contractId === contract.id,
            )
            const percent = progressPercent(
              contract.fulfilledKg,
              contract.targetKg,
            )

            return (
              <article className="allocation-status-card" key={contract.id}>
                <div>
                  <span className={`status-pill ${contract.status.toLowerCase()}`}>
                    {contract.status}
                  </span>
                  <strong>{contract.id}</strong>
                  <p>{contract.buyer}</p>
                </div>
                <div className="contract-progress">
                  <div className="progress-meta">
                    <span>{contract.commodity}</span>
                    <strong>{percent}%</strong>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <small>
                    {formatKg(contract.fulfilledKg)} dari{' '}
                    {formatKg(contract.targetKg)}
                  </small>
                </div>
                <dl>
                  <div>
                    <dt>Kandidat</dt>
                    <dd>{formatKg(pool?.candidateKg ?? 0)}</dd>
                  </div>
                  <div>
                    <dt>Anggota</dt>
                    <dd>{pool?.contributors ?? 0}</dd>
                  </div>
                  <div>
                    <dt>Pool QS</dt>
                    <dd>{pool?.score ?? '-'}</dd>
                  </div>
                </dl>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}

function ContractsPage({ goToPage }: { goToPage: (page: Page) => void }) {
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [commodityFilter, setCommodityFilter] = useState('Semua')
  const totalContractValue = contracts.reduce(
    (total, contract) => total + contract.targetKg * 32000,
    0,
  )
  const filteredContracts = contracts.filter((contract) => {
    const statusMatches =
      statusFilter === 'Semua' || contract.status === statusFilter
    const commodityMatches =
      commodityFilter === 'Semua' || contract.commodity === commodityFilter
    return statusMatches && commodityMatches
  })

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Manajemen Kontrak</p>
          <h1>Daftar kontrak buyer</h1>
        </div>
        <div className="operator-panel" aria-label="Nilai kontrak aktif">
          <span>Nilai estimasi</span>
          <strong>Rp{totalContractValue.toLocaleString('id-ID')}</strong>
        </div>
      </header>

      <section className="panel contracts-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Kontrak</p>
            <h2>Permintaan industri dan status pemenuhan</h2>
          </div>
          <button
            className="primary-action"
            type="button"
            onClick={() => goToPage('newContract')}
          >
            Buat Kontrak
          </button>
        </div>
        <div className="filter-row" aria-label="Filter daftar kontrak">
          <label>
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>Semua</option>
              <option>Baru</option>
              <option>Aktif</option>
              <option>Prioritas</option>
            </select>
          </label>
          <label>
            <span>Komoditas</span>
            <select
              value={commodityFilter}
              onChange={(event) => setCommodityFilter(event.target.value)}
            >
              <option>Semua</option>
              {commodityOptions.map((commodity) => (
                <option key={commodity}>{commodity}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="contract-management-list">
          {filteredContracts.map((contract) => {
            const percent = progressPercent(
              contract.fulfilledKg,
              contract.targetKg,
            )

            return (
              <article className="managed-contract-card" key={contract.id}>
                <div>
                  <span className={`status-pill ${contract.status.toLowerCase()}`}>
                    {contract.status}
                  </span>
                  <strong>{contract.id}</strong>
                  <p>{contract.buyer}</p>
                </div>
                <dl>
                  <div>
                    <dt>Komoditas</dt>
                    <dd>{contract.commodity}</dd>
                  </div>
                  <div>
                    <dt>Target</dt>
                    <dd>{formatKg(contract.targetKg)}</dd>
                  </div>
                  <div>
                    <dt>Minimum QS</dt>
                    <dd>{contract.minimumQuality}</dd>
                  </div>
                  <div>
                    <dt>Tenggat</dt>
                    <dd>{contract.deadline}</dd>
                  </div>
                </dl>
                <div className="contract-progress">
                  <div className="progress-meta">
                    <span>Progress pemenuhan</span>
                    <strong>{percent}%</strong>
                  </div>
                <div className="progress-track">
                  <span style={{ width: `${percent}%` }} />
                </div>
                <button
                  className="text-action"
                  type="button"
                  onClick={() => goToPage('contractDetail')}
                >
                  Lihat Detail
                </button>
              </div>
            </article>
          )
          })}
        </div>
      </section>
    </>
  )
}

function NewContractPage() {
  const [form, setForm] = useState<ContractFormState>({
    buyer: 'Nusantara Foods',
    commodity: commodityOptions[0],
    targetKg: '10000',
    minimumQuality: '85',
    pricePerKg: '32000',
    deadline: '2026-08-15',
  })
  const [errors, setErrors] = useState<ContractFormErrors>({})
  const [saved, setSaved] = useState(false)

  function updateField(field: keyof ContractFormState, value: string) {
    setSaved(false)
    setErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Manajemen Kontrak</p>
          <h1>Buat kontrak buyer</h1>
        </div>
        <div className="operator-panel" aria-label="Preview nilai kontrak">
          <span>Nilai estimasi</span>
          <strong>
            Rp
            {(Number(form.targetKg) * Number(form.pricePerKg || 0)).toLocaleString(
              'id-ID',
            )}
          </strong>
        </div>
      </header>

      <section className="form-workspace">
        <form
          className="panel deposit-form"
          onSubmit={(event) => {
            event.preventDefault()
            const nextErrors = validateContractForm(form)
            setErrors(nextErrors)
            setSaved(Object.keys(nextErrors).length === 0)
          }}
        >
          <div className="section-heading">
            <p className="eyebrow">Kontrak Baru</p>
            <h2>Spesifikasi pembelian</h2>
          </div>
          <label>
            <span>Nama Buyer</span>
            <input
              aria-invalid={Boolean(errors.buyer)}
              value={form.buyer}
              onChange={(event) => updateField('buyer', event.target.value)}
            />
            {errors.buyer ? <small className="field-error">{errors.buyer}</small> : null}
          </label>
          <label>
            <span>Komoditas</span>
            <select
              aria-invalid={Boolean(errors.commodity)}
              value={form.commodity}
              onChange={(event) => updateField('commodity', event.target.value)}
            >
              {commodityOptions.map((commodity) => (
                <option key={commodity}>{commodity}</option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <label>
              <span>Target Volume (kg)</span>
              <input
                aria-invalid={Boolean(errors.targetKg)}
                min="1"
                type="number"
                value={form.targetKg}
                onChange={(event) => updateField('targetKg', event.target.value)}
              />
              {errors.targetKg ? (
                <small className="field-error">{errors.targetKg}</small>
              ) : null}
            </label>
            <label>
              <span>Quality Minimum</span>
              <input
                aria-invalid={Boolean(errors.minimumQuality)}
                max="100"
                min="0"
                type="number"
                value={form.minimumQuality}
                onChange={(event) =>
                  updateField('minimumQuality', event.target.value)
                }
              />
              {errors.minimumQuality ? (
                <small className="field-error">{errors.minimumQuality}</small>
              ) : null}
            </label>
          </div>
          <div className="form-grid">
            <label>
              <span>Harga per Kg</span>
              <input
                aria-invalid={Boolean(errors.pricePerKg)}
                min="1"
                type="number"
                value={form.pricePerKg}
                onChange={(event) => updateField('pricePerKg', event.target.value)}
              />
              {errors.pricePerKg ? (
                <small className="field-error">{errors.pricePerKg}</small>
              ) : null}
            </label>
            <label>
              <span>Tenggat</span>
              <input
                aria-invalid={Boolean(errors.deadline)}
                type="date"
                value={form.deadline}
                onChange={(event) => updateField('deadline', event.target.value)}
              />
              {errors.deadline ? (
                <small className="field-error">{errors.deadline}</small>
              ) : null}
            </label>
          </div>
          <button className="primary-action" type="submit">
            Simpan Draft Kontrak
          </button>
        </form>
        <aside className="panel form-preview">
          <div className="section-heading">
            <p className="eyebrow">Preview</p>
            <h2>{form.commodity}</h2>
          </div>
          <dl>
            <div>
              <dt>Buyer</dt>
              <dd>{form.buyer}</dd>
            </div>
            <div>
              <dt>Target</dt>
              <dd>{form.targetKg || '0'} kg</dd>
            </div>
            <div>
              <dt>Minimum QS</dt>
              <dd>{form.minimumQuality}</dd>
            </div>
          </dl>
          {saved ? <p className="success-note">Draft kontrak tersimpan.</p> : null}
        </aside>
      </section>
    </>
  )
}

function ContractDetailPage() {
  const contract = contracts[0]
  const [contractStatus, setContractStatus] =
    useState<ContractProgress['status']>(contract.status)
  const percent = progressPercent(contract.fulfilledKg, contract.targetKg)
  const allocations = allocationCandidates.filter(
    (candidate) => candidate.commodity === contract.commodity,
  )
  const contractShares = profitShares.filter(
    (share) => share.contractId === contract.id,
  )

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Manajemen Kontrak</p>
          <h1>{contract.id}</h1>
        </div>
        <div className="operator-panel" aria-label="Status kontrak">
          <span>Status</span>
          <strong>{contractStatus}</strong>
        </div>
      </header>

      <section className="panel contracts-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Detail Kontrak</p>
            <h2>{contract.buyer}</h2>
          </div>
          <span>{contract.deadline}</span>
        </div>
        <div className="contract-detail-grid">
          <dl>
            <div>
              <dt>Komoditas</dt>
              <dd>{contract.commodity}</dd>
            </div>
            <div>
              <dt>Target</dt>
              <dd>{formatKg(contract.targetKg)}</dd>
            </div>
            <div>
              <dt>Minimum QS</dt>
              <dd>{contract.minimumQuality}</dd>
            </div>
          </dl>
          <div className="contract-progress">
            <div className="progress-meta">
              <span>{formatKg(contract.fulfilledKg)} terpenuhi</span>
              <strong>{percent}%</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="panel status-update-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Ubah Status</p>
            <h2>Status operasional kontrak</h2>
          </div>
          <span>Mock update</span>
        </div>
        <div className="filter-row">
          <label>
            <span>Status Kontrak</span>
            <select
              value={contractStatus}
              onChange={(event) =>
                setContractStatus(event.target.value as ContractProgress['status'])
              }
            >
              <option>Baru</option>
              <option>Aktif</option>
              <option>Prioritas</option>
              <option>Selesai</option>
              <option>Batal</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Tabel Alokasi</p>
            <h2>Setoran dalam supply pool</h2>
          </div>
          <span>{allocations.length} setoran</span>
        </div>
        <div className="qc-table">
          <div className="qc-table-head">
            <span>Setoran</span>
            <span>Anggota</span>
            <span>Komoditas</span>
            <span>Berat</span>
            <span>QS</span>
            <span>Status</span>
          </div>
          {allocations.map((allocation) => (
            <article className="qc-row" key={allocation.depositId}>
              <span className="record-id">{allocation.depositId}</span>
              <span>{allocation.member}</span>
              <span>{allocation.commodity}</span>
              <span>{formatKg(allocation.availableKg)}</span>
              <strong>{allocation.qualityScore}</strong>
              <span className="status-pill">{allocation.recommendation}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel status-update-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Rincian Bagi Hasil</p>
            <h2>Distribusi setelah kontrak selesai</h2>
          </div>
          <span>Data tiruan</span>
        </div>
        <div className="candidate-list">
          {contractShares.map((share) => (
            <article className="candidate-card" key={share.member}>
              <div>
                <strong>{share.member}</strong>
                <span>{share.calculatedAt}</span>
              </div>
              <div>
                <span>{formatKg(share.contributedKg)}</span>
                <b>Rp{share.amount.toLocaleString('id-ID')}</b>
              </div>
              <span className="status-pill">QS {share.qualityScore}</span>
              <small>{share.commodity}</small>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function DepositReportPage({ records }: { records: DepositRecord[] }) {
  const [commodityFilter, setCommodityFilter] = useState('Semua')
  const filteredRecords = records.filter((record) =>
    commodityFilter === 'Semua' ? true : record.commodity === commodityFilter,
  )
  const totalWeight = filteredRecords.reduce(
    (total, record) => total + record.weightKg,
    0,
  )
  const memberCount = new Set(filteredRecords.map((record) => record.member)).size

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Laporan</p>
          <h1>Laporan setoran anggota</h1>
        </div>
        <div className="operator-panel" aria-label="Total volume laporan">
          <span>Total volume</span>
          <strong>{formatKg(totalWeight)}</strong>
        </div>
      </header>

      <section className="overview-grid">
        <article className="metric-card">
          <span>Setoran</span>
          <strong>{filteredRecords.length}</strong>
          <small>Transaksi dalam filter</small>
        </article>
        <article className="metric-card">
          <span>Anggota</span>
          <strong>{memberCount}</strong>
          <small>Penyetor unik</small>
        </article>
        <article className="metric-card">
          <span>Volume</span>
          <strong>{formatKg(totalWeight)}</strong>
          <small>Akumulasi setoran</small>
        </article>
        <article className="metric-card">
          <span>Komoditas</span>
          <strong>{commodityFilter}</strong>
          <small>Filter aktif</small>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Filter Laporan</p>
            <h2>Ringkasan setoran per periode</h2>
          </div>
          <button
            className="primary-action"
            type="button"
            onClick={() =>
              downloadCsv('laporan-setoran.csv', [
                ['ID', 'Anggota', 'Komoditas', 'Berat', 'Tanggal', 'Quality', 'Status'],
                ...filteredRecords.map((record) => [
                  record.id,
                  record.member,
                  record.commodity,
                  String(record.weightKg),
                  record.submittedAt,
                  String(record.qualityScore ?? ''),
                  record.status,
                ]),
              ])
            }
          >
            Unduh CSV
          </button>
        </div>
        <div className="filter-row">
          <label>
            <span>Komoditas</span>
            <select
              value={commodityFilter}
              onChange={(event) => setCommodityFilter(event.target.value)}
            >
              <option>Semua</option>
              {commodityOptions.map((commodity) => (
                <option key={commodity}>{commodity}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="deposit-table">
          <div className="deposit-table-head">
            <span>ID</span>
            <span>Anggota</span>
            <span>Komoditas</span>
            <span>Berat</span>
            <span>Tanggal</span>
            <span>Quality</span>
            <span>Status</span>
          </div>
          {filteredRecords.map((record) => (
            <article className="deposit-row" key={record.id}>
              <span className="record-id">{record.id}</span>
              <strong>{record.member}</strong>
              <span>{record.commodity}</span>
              <span>{formatKg(record.weightKg)}</span>
              <span>{record.submittedAt}</span>
              <span>{record.qualityScore ?? '-'}</span>
              <span>{record.status}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function ProfitSharesPage() {
  const [selectedMember, setSelectedMember] = useState(profitShares[0].member)
  const selectedRows = profitShares.filter((row) => row.member === selectedMember)
  const totalAmount = profitShares.reduce((total, row) => total + row.amount, 0)
  const selectedAmount = selectedRows.reduce((total, row) => total + row.amount, 0)

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Bagi Hasil</p>
          <h1>Riwayat pembagian hasil</h1>
        </div>
        <div className="operator-panel">
          <span>Total dibagikan</span>
          <strong>Rp{totalAmount.toLocaleString('id-ID')}</strong>
        </div>
      </header>

      <section className="deposit-workspace">
        <div className="panel">
          <div className="section-heading inline">
            <div>
              <p className="eyebrow">Riwayat Bagi Hasil</p>
              <h2>Distribusi per kontrak</h2>
            </div>
            <button
              className="primary-action"
              type="button"
              onClick={() =>
                downloadCsv('laporan-bagi-hasil.csv', [
                  [
                    'Anggota',
                    'Kontrak',
                    'Komoditas',
                    'Kontribusi Kg',
                    'Quality Score',
                    'Nominal',
                    'Tanggal',
                  ],
                  ...profitShares.map((row) => [
                    row.member,
                    row.contractId,
                    row.commodity,
                    String(row.contributedKg),
                    String(row.qualityScore),
                    String(row.amount),
                    row.calculatedAt,
                  ]),
                ])
              }
            >
              Unduh CSV
            </button>
          </div>
          <div className="candidate-list">
            {profitShares.map((row) => (
              <button
                className={`candidate-card ${
                  selectedMember === row.member ? 'selected' : ''
                }`}
                key={`${row.member}-${row.contractId}`}
                type="button"
                onClick={() => setSelectedMember(row.member)}
              >
                <div>
                  <strong>{row.member}</strong>
                  <span>{row.contractId}</span>
                </div>
                <div>
                  <span>{row.commodity}</span>
                  <b>Rp{row.amount.toLocaleString('id-ID')}</b>
                </div>
                <span className="status-pill">QS {row.qualityScore}</span>
                <small>{formatKg(row.contributedKg)}</small>
              </button>
            ))}
          </div>
        </div>

        <aside className="panel deposit-detail">
          <div className="section-heading">
            <p className="eyebrow">Detail Anggota</p>
            <h2>{selectedMember}</h2>
          </div>
          <div className="detail-stack">
            <div>
              <span>Total Hak</span>
              <strong>Rp{selectedAmount.toLocaleString('id-ID')}</strong>
              <small>{selectedRows.length} kontrak selesai</small>
            </div>
            <div>
              <span>Kontribusi</span>
              <strong>
                {formatKg(
                  selectedRows.reduce((total, row) => total + row.contributedKg, 0),
                )}
              </strong>
              <small>Berbasis volume dan quality score</small>
            </div>
          </div>
        </aside>
      </section>
    </>
  )
}

function LoginPage({ onLogin }: { onLogin: (user: MockUser) => void }) {
  const [email, setEmail] = useState('operator@koperasi.id')
  const [password, setPassword] = useState('password')
  const [role, setRole] = useState<MockUser['role']>('Koperasi')
  const [error, setError] = useState('')

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Autentikasi</p>
          <h1>Masuk ke ruang operasional</h1>
        </div>
      </header>
      <section className="form-workspace">
        <form
          className="panel deposit-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (!email.includes('@') || password.length < 6) {
              setError('Email harus valid dan password minimal 6 karakter.')
              return
            }
            onLogin({
              name: role === 'Buyer' ? 'Buyer Nusantara' : 'Operator Koperasi',
              email,
              role,
            })
            setError('')
          }}
        >
          <div className="section-heading">
            <p className="eyebrow">Login</p>
            <h2>Identitas pengguna</h2>
          </div>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label>
            <span>Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as MockUser['role'])}
            >
              <option>Admin</option>
              <option>Koperasi</option>
              <option>Buyer</option>
            </select>
          </label>
          {error ? <small className="field-error">{error}</small> : null}
          <button className="primary-action" type="submit">
            Masuk
          </button>
        </form>
      </section>
    </>
  )
}

function RegisterPage() {
  const [name, setName] = useState('Admin Koperasi')
  const [email, setEmail] = useState('admin@koperasi.id')
  const [role, setRole] = useState<MockUser['role']>('Admin')
  const [password, setPassword] = useState('password')
  const [confirmPassword, setConfirmPassword] = useState('password')
  const [message, setMessage] = useState('')

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Autentikasi</p>
          <h1>Pendaftaran akun</h1>
        </div>
      </header>
      <section className="form-workspace">
        <form
          className="panel deposit-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (name.trim().length < 3 || !email.includes('@')) {
              setMessage('Nama dan email harus valid.')
              return
            }
            if (password.length < 6 || password !== confirmPassword) {
              setMessage('Password minimal 6 karakter dan konfirmasi harus sama.')
              return
            }
            setMessage('Akun mock berhasil dibuat.')
          }}
        >
          <div className="section-heading">
            <p className="eyebrow">Daftar Akun</p>
            <h2>Identitas pengguna baru</h2>
          </div>
          <label>
            <span>Nama</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as MockUser['role'])}
            >
              <option>Admin</option>
              <option>Koperasi</option>
              <option>Buyer</option>
            </select>
          </label>
          <div className="form-grid">
            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <label>
              <span>Konfirmasi</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
          </div>
          {message ? <small className="field-error">{message}</small> : null}
          <button className="primary-action" type="submit">
            Buat Akun
          </button>
        </form>
      </section>
    </>
  )
}

function ResetPasswordPage() {
  const [email, setEmail] = useState('operator@koperasi.id')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Autentikasi</p>
          <h1>Lupa dan reset password</h1>
        </div>
      </header>
      <section className="form-workspace">
        <form
          className="panel deposit-form"
          onSubmit={(event) => {
            event.preventDefault()
            if (!email.includes('@')) {
              setMessage('Masukkan email yang valid.')
              return
            }
            if (newPassword && newPassword !== confirmPassword) {
              setMessage('Konfirmasi password belum sama.')
              return
            }
            setMessage(
              newPassword
                ? 'Password mock berhasil diperbarui.'
                : 'Link reset mock dikirim ke email.',
            )
          }}
        >
          <div className="section-heading">
            <p className="eyebrow">Reset Password</p>
            <h2>Pemulihan akun</h2>
          </div>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <div className="form-grid">
            <label>
              <span>Password Baru</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>
            <label>
              <span>Konfirmasi</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
          </div>
          {message ? <small className="field-error">{message}</small> : null}
          <button className="primary-action" type="submit">
            Proses Reset
          </button>
        </form>
      </section>
    </>
  )
}

function ProfilePage({
  user,
  onSave,
}: {
  user: MockUser | null
  onSave: (user: MockUser) => void
}) {
  const [name, setName] = useState(user?.name ?? 'Operator Koperasi')
  const [email, setEmail] = useState(user?.email ?? 'operator@koperasi.id')
  const [role, setRole] = useState<MockUser['role']>(user?.role ?? 'Koperasi')
  const [saved, setSaved] = useState(false)

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Profil</p>
          <h1>Pengaturan profil</h1>
        </div>
      </header>
      <section className="form-workspace">
        <form
          className="panel deposit-form"
          onSubmit={(event) => {
            event.preventDefault()
            onSave({ name, email, role })
            setSaved(true)
          }}
        >
          <div className="section-heading">
            <p className="eyebrow">Profil Pengguna</p>
            <h2>Data akun aktif</h2>
          </div>
          <label>
            <span>Nama</span>
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as MockUser['role'])}
            >
              <option>Admin</option>
              <option>Koperasi</option>
              <option>Buyer</option>
            </select>
          </label>
          <button className="primary-action" type="submit">
            Simpan Profil
          </button>
          {saved ? <p className="success-note">Profil mock diperbarui.</p> : null}
        </form>
      </section>
    </>
  )
}

type MemberFormState = {
  _id?: string
  name: string
  phone: string
  village: string
  primaryCommodityId: string
}

function MembersPage() {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const koperasiId = defaultKoperasi?._id

  const commodities = useQuery(api.masterData.searchCommodities, { searchTerm: '' })

  const [searchTerm, setSearchTerm] = useState('')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<MemberFormState>({
    name: '',
    phone: '',
    village: '',
    primaryCommodityId: '',
  })

  const memberList = useQuery(
    api.masterData.searchMembers,
    koperasiId ? { koperasiId, searchTerm } : 'skip',
  )

  const createMember = useMutation(api.masterData.createMember)
  const updateMember = useMutation(api.masterData.updateMember)
  const deleteMember = useMutation(api.masterData.deleteMember)

  function updateField(field: keyof MemberFormState, value: string) {
    setSaved(false)
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Data Master</p>
          <h1>Manajemen anggota</h1>
        </div>
        <div className="operator-panel">
          <span>Total anggota</span>
          <strong>{memberList?.length ?? 0}</strong>
        </div>
      </header>
      <section className="panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Anggota Koperasi</p>
            <h2>Data petani penyetor</h2>
          </div>
          <span>Database Terkoneksi</span>
        </div>
        <div className="filter-row">
          <label>
            <span>Cari Nama</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari anggota"
            />
          </label>
        </div>
        <div className="candidate-list">
          {memberList === undefined ? (
            <p className="success-note">Memuat data anggota...</p>
          ) : memberList.length === 0 ? (
            <p className="success-note">Belum ada anggota terdaftar.</p>
          ) : (
            memberList.map((member) => {
              const commodityName =
                commodities?.find((c) => c._id === member.primaryCommodityId)?.name || '-'

              return (
                <button
                  className="candidate-card"
                  key={member._id}
                  type="button"
                  onClick={() => {
                    setForm({
                      _id: member._id,
                      name: member.name,
                      phone: member.phone,
                      village: member.village || '',
                      primaryCommodityId: member.primaryCommodityId || '',
                    })
                    setSaved(false)
                  }}
                >
                  <div>
                    <strong>{member.name}</strong>
                    <span>{member.phone}</span>
                  </div>
                  <div>
                    <span>{member.village || '-'}</span>
                    <b>{commodityName}</b>
                  </div>
                  <span className="status-pill">
                    {member.status === 'active' ? 'Aktif' : 'Perlu Verifikasi'}
                  </span>
                  <small
                    onClick={async (event) => {
                      event.stopPropagation()
                      if (window.confirm(`Hapus ${member.name}?`)) {
                        try {
                          await deleteMember({ memberId: member._id })
                          if (form._id === member._id) {
                            setForm({ name: '', phone: '', village: '', primaryCommodityId: '' })
                          }
                        } catch (err) {
                          alert('Gagal menghapus anggota: ' + (err as Error).message)
                        }
                      }
                    }}
                  >
                    Hapus
                  </small>
                </button>
              )
            })
          )}
        </div>
      </section>
      <section className="panel status-update-panel">
        <div className="section-heading">
          <p className="eyebrow">Tambah / Ubah Anggota</p>
          <h2>Form data anggota</h2>
        </div>
        <form
          className="deposit-form"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!koperasiId) {
              alert('Profil Koperasi belum siap.')
              return
            }

            try {
              if (form._id) {
                await updateMember({
                  memberId: form._id as any,
                  name: form.name,
                  phone: form.phone,
                  village: form.village || undefined,
                  primaryCommodityId: form.primaryCommodityId
                    ? (form.primaryCommodityId as any)
                    : undefined,
                })
              } else {
                await createMember({
                  koperasiId,
                  name: form.name,
                  phone: form.phone,
                  village: form.village || undefined,
                  primaryCommodityId: form.primaryCommodityId
                    ? (form.primaryCommodityId as any)
                    : undefined,
                })
              }
              setSaved(true)
              setForm({ name: '', phone: '', village: '', primaryCommodityId: '' })
            } catch (err) {
              alert('Gagal menyimpan data: ' + (err as Error).message)
            }
          }}
        >
          <div className="form-grid">
            <label>
              <span>Nama</span>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />
            </label>
            <label>
              <span>Telepon</span>
              <input
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                required
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              <span>Dusun</span>
              <input
                value={form.village}
                onChange={(event) => updateField('village', event.target.value)}
              />
            </label>
            <label>
              <span>Komoditas</span>
              <select
                value={form.primaryCommodityId}
                onChange={(event) => updateField('primaryCommodityId', event.target.value)}
              >
                <option value="">Pilih Komoditas</option>
                {commodities?.map((commodity) => (
                  <option key={commodity._id} value={commodity._id}>
                    {commodity.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="primary-action" type="submit">
              {form._id ? 'Simpan Perubahan' : 'Tambah Anggota'}
            </button>
            {form._id || form.name || form.phone || form.village || form.primaryCommodityId ? (
              <button
                className="text-action"
                type="button"
                onClick={() => {
                  setForm({ name: '', phone: '', village: '', primaryCommodityId: '' })
                  setSaved(false)
                }}
              >
                Batal
              </button>
            ) : null}
          </div>
          {saved ? <p className="success-note">Data anggota berhasil disimpan.</p> : null}
        </form>
      </section>
    </>
  )
}

type CommodityFormState = {
  _id?: string
  name: string
  unit: string
  minimumQualityScore: number
  qualityParameters: string
}

function CommoditiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<CommodityFormState>({
    name: '',
    unit: 'kg',
    minimumQualityScore: 85,
    qualityParameters: 'Kadar air, grade, kerusakan',
  })

  const commodityList = useQuery(api.masterData.searchCommodities, { searchTerm })

  const createCommodity = useMutation(api.masterData.createCommodity)
  const updateCommodity = useMutation(api.masterData.updateCommodity)
  const deleteCommodity = useMutation(api.masterData.deleteCommodity)

  function updateField(field: keyof CommodityFormState, value: any) {
    setSaved(false)
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Data Master</p>
          <h1>Manajemen komoditas</h1>
        </div>
        <div className="operator-panel">
          <span>Total komoditas</span>
          <strong>{commodityList?.length ?? 0}</strong>
        </div>
      </header>
      <section className="pool-grid">
        {commodityList === undefined ? (
          <p className="success-note">Memuat data komoditas...</p>
        ) : commodityList.length === 0 ? (
          <p className="success-note">Belum ada komoditas terdaftar.</p>
        ) : (
          commodityList.map((commodity) => (
            <article className="pool-card" key={commodity._id}>
              <div>
                <span>{commodity._id}</span>
                <strong>{commodity.name}</strong>
              </div>
              <dl>
                <div>
                  <dt>Unit</dt>
                  <dd>{commodity.unit}</dd>
                </div>
                <div>
                  <dt>Minimum QS</dt>
                  <dd>{commodity.minimumQualityScore}</dd>
                </div>
                <div>
                  <dt>Parameter</dt>
                  <dd>{commodity.qualityParameters.join(', ')}</dd>
                </div>
              </dl>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  className="text-action"
                  type="button"
                  onClick={() => {
                    setForm({
                      _id: commodity._id,
                      name: commodity.name,
                      unit: commodity.unit,
                      minimumQualityScore: commodity.minimumQualityScore,
                      qualityParameters: commodity.qualityParameters.join(', '),
                    })
                    setSaved(false)
                  }}
                >
                  Ubah
                </button>
                <button
                  className="text-action text-danger"
                  type="button"
                  onClick={async () => {
                    if (window.confirm(`Hapus ${commodity.name}?`)) {
                      try {
                        await deleteCommodity({ commodityId: commodity._id })
                        if (form._id === commodity._id) {
                          setForm({
                            name: '',
                            unit: 'kg',
                            minimumQualityScore: 85,
                            qualityParameters: '',
                          })
                        }
                      } catch (err) {
                        alert('Gagal menghapus komoditas: ' + (err as Error).message)
                      }
                    }
                  }}
                >
                  Hapus
                </button>
              </div>
            </article>
          ))
        )}
      </section>
      <section className="panel status-update-panel">
        <div className="filter-row">
          <label>
            <span>Cari Komoditas</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari komoditas"
            />
          </label>
        </div>
        <div className="section-heading">
          <p className="eyebrow">Tambah / Ubah Komoditas</p>
          <h2>Parameter kualitas</h2>
        </div>
        <form
          className="deposit-form"
          onSubmit={async (event) => {
            event.preventDefault()
            const paramsArray = form.qualityParameters
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean)

            try {
              if (form._id) {
                await updateCommodity({
                  commodityId: form._id as any,
                  name: form.name,
                  unit: form.unit,
                  minimumQualityScore: Number(form.minimumQualityScore),
                  qualityParameters: paramsArray,
                })
              } else {
                await createCommodity({
                  name: form.name,
                  unit: form.unit,
                  minimumQualityScore: Number(form.minimumQualityScore),
                  qualityParameters: paramsArray,
                })
              }
              setSaved(true)
              setForm({
                name: '',
                unit: 'kg',
                minimumQualityScore: 85,
                qualityParameters: 'Kadar air, grade, kerusakan',
              })
            } catch (err) {
              alert('Gagal menyimpan data: ' + (err as Error).message)
            }
          }}
        >
          <div className="form-grid">
            <label>
              <span>Nama Komoditas</span>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />
            </label>
            <label>
              <span>Minimum QS</span>
              <input
                max="100"
                min="0"
                type="number"
                value={form.minimumQualityScore}
                onChange={(event) => updateField('minimumQualityScore', Number(event.target.value))}
                required
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              <span>Unit</span>
              <input
                value={form.unit}
                onChange={(event) => updateField('unit', event.target.value)}
                required
              />
            </label>
            <label>
              <span>Parameter Kualitas (pisahkan dengan koma)</span>
              <input
                value={form.qualityParameters}
                onChange={(event) => updateField('qualityParameters', event.target.value)}
                placeholder="Kadar air, grade, kerusakan"
                required
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="primary-action" type="submit">
              {form._id ? 'Simpan Perubahan' : 'Tambah Komoditas'}
            </button>
            {form._id || form.name || form.unit !== 'kg' || form.minimumQualityScore !== 85 ? (
              <button
                className="text-action"
                type="button"
                onClick={() => {
                  setForm({
                    name: '',
                    unit: 'kg',
                    minimumQualityScore: 85,
                    qualityParameters: 'Kadar air, grade, kerusakan',
                  })
                  setSaved(false)
                }}
              >
                Batal
              </button>
            ) : null}
          </div>
          {saved ? <p className="success-note">Data komoditas berhasil disimpan.</p> : null}
        </form>
      </section>
    </>
  )
}

function CooperativeProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const saveDefaultKoperasi = useMutation(api.koperasi.saveDefaultKoperasi)

  const memberList = useQuery(
    api.masterData.searchMembers,
    defaultKoperasi?._id ? { koperasiId: defaultKoperasi._id, searchTerm: '' } : 'skip',
  )
  const commodityList = useQuery(api.masterData.searchCommodities, { searchTerm: '' })

  const [form, setForm] = useState({
    name: '',
    location: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    leaderName: '',
  })

  const activeProfile = defaultKoperasi || {
    name: 'Koperasi Tani Makmur',
    location: 'Jawa Barat',
    address: 'Jl. Desa Agri No. 12, Kabupaten Bandung',
    contactEmail: 'koperasi@tanmakmur.id',
    contactPhone: '022-7788-9900',
    leaderName: 'Ibu Ratna Permata',
  }

  const startEditing = () => {
    setForm({
      name: activeProfile.name,
      location: activeProfile.location,
      address: activeProfile.address || '',
      contactEmail: activeProfile.contactEmail || '',
      contactPhone: activeProfile.contactPhone || '',
      leaderName: activeProfile.leaderName || '',
    })
    setIsEditing(true)
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Data Master</p>
          <h1>Profil {activeProfile.name}</h1>
        </div>
        <div className="operator-panel">
          <span>Wilayah</span>
          <strong>{activeProfile.location}</strong>
        </div>
      </header>
      <section className="detail-layout">
        <article className="panel qc-detail-card">
          <div className="section-heading">
            <p className="eyebrow">Identitas</p>
            <h2>{activeProfile.name}</h2>
          </div>
          {isEditing ? (
            <form
              className="deposit-form"
              onSubmit={async (event) => {
                event.preventDefault()
                try {
                  await saveDefaultKoperasi({
                    name: form.name,
                    location: form.location,
                    address: form.address || undefined,
                    contactEmail: form.contactEmail || undefined,
                    contactPhone: form.contactPhone || undefined,
                    leaderName: form.leaderName || undefined,
                  })
                  setIsEditing(false)
                } catch (err) {
                  alert('Gagal menyimpan profil: ' + (err as Error).message)
                }
              }}
            >
              <div className="form-grid">
                <label>
                  <span>Nama Koperasi</span>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>Wilayah</span>
                  <input
                    value={form.location}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, location: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  <span>Alamat</span>
                  <input
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, address: event.target.value }))
                    }
                  />
                </label>
                <label>
                  <span>Nama Ketua</span>
                  <input
                    value={form.leaderName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, leaderName: event.target.value }))
                    }
                  />
                </label>
              </div>
              <div className="form-grid">
                <label>
                  <span>Email Kontak</span>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contactEmail: event.target.value }))
                    }
                  />
                </label>
                <label>
                  <span>Telepon Kontak</span>
                  <input
                    value={form.contactPhone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contactPhone: event.target.value }))
                    }
                  />
                </label>
              </div>
              <button className="primary-action" type="submit">
                Simpan Profil
              </button>
            </form>
          ) : (
            <dl className="detail-metrics single">
              <div>
                <dt>Alamat</dt>
                <dd>{activeProfile.address || '-'}</dd>
              </div>
              <div>
                <dt>Kontak</dt>
                <dd>
                  {activeProfile.contactEmail || activeProfile.contactPhone
                    ? `${activeProfile.contactEmail || '-'} / ${activeProfile.contactPhone || '-'}`
                    : '-'}
                </dd>
              </div>
              <div>
                <dt>Ketua</dt>
                <dd>{activeProfile.leaderName || '-'}</dd>
              </div>
            </dl>
          )}
          <button
            className="text-action"
            type="button"
            onClick={() => {
              if (isEditing) {
                setIsEditing(false)
              } else {
                startEditing()
              }
            }}
          >
            {isEditing ? 'Batal Edit' : 'Edit Profil'}
          </button>
        </article>
        <article className="panel qc-detail-card">
          <div className="section-heading">
            <p className="eyebrow">Operasional</p>
            <h2>Kapasitas koperasi</h2>
          </div>
          <div className="parameter-grid">
            <div>
              <span>Anggota</span>
              <strong>{memberList?.length ?? 0}</strong>
            </div>
            <div>
              <span>Komoditas</span>
              <strong>{commodityList?.length ?? 0}</strong>
            </div>
          </div>
        </article>
      </section>
    </>
  )
}

function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [records, setRecords] = useState<DepositRecord[]>(initialDepositRecords)
  const [user, setUser] = useState<MockUser | null>(null)

  return (
    <main className="dashboard-shell">
      <nav className="app-nav" aria-label="Navigasi utama">
        <strong>{user ? `${user.name} / ${user.role}` : 'AGREGO'}</strong>
        <div>
          {navItems.map((item) => (
            <button
              aria-current={page === item.page ? 'page' : undefined}
              className={page === item.page ? 'active' : ''}
              key={item.page}
              type="button"
              onClick={() => setPage(item.page)}
            >
              {item.label}
            </button>
          ))}
          {user ? (
            <button
              type="button"
              onClick={() => {
                setUser(null)
                setPage('login')
              }}
            >
              Logout
            </button>
          ) : null}
        </div>
      </nav>
      {page === 'dashboard' ? <DashboardPage /> : null}
      {page === 'deposits' ? <DepositHistoryPage records={records} /> : null}
      {page === 'newDeposit' ? (
        <NewDepositPage
          onSave={(record) => {
            setRecords((current) => [record, ...current])
            setPage('deposits')
          }}
        />
      ) : null}
      {page === 'qcHistory' ? <QcHistoryPage /> : null}
      {page === 'qcDepositDetail' ? <QcDepositDetailPage /> : null}
      {page === 'qcForm' ? <QcFormPage /> : null}
      {page === 'qcResultDetail' ? <QcResultDetailPage /> : null}
      {page === 'allocation' ? <AllocationPage /> : null}
      {page === 'allocationStatus' ? <AllocationStatusPage /> : null}
      {page === 'contracts' ? <ContractsPage goToPage={setPage} /> : null}
      {page === 'newContract' ? <NewContractPage /> : null}
      {page === 'contractDetail' ? <ContractDetailPage /> : null}
      {page === 'depositReport' ? <DepositReportPage records={records} /> : null}
      {page === 'profitShares' ? <ProfitSharesPage /> : null}
      {page === 'login' ? (
        <LoginPage
          onLogin={(nextUser) => {
            setUser(nextUser)
            setPage('dashboard')
          }}
        />
      ) : null}
      {page === 'register' ? <RegisterPage /> : null}
      {page === 'resetPassword' ? <ResetPasswordPage /> : null}
      {page === 'profile' ? <ProfilePage user={user} onSave={setUser} /> : null}
      {page === 'members' ? <MembersPage /> : null}
      {page === 'commodities' ? <CommoditiesPage /> : null}
      {page === 'cooperativeProfile' ? <CooperativeProfilePage /> : null}
    </main>
  )
}

export default App
