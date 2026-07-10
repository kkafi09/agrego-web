import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import PageHeader from '../components/layout/page-header'
import MetricCard from '../components/dashboard/kpi-tile'
import DataTable from '../components/data-display/record-grid'
import StatusBadge from '../components/data-display/state-chip'
import { Wheat, AlertTriangle, TrendingUp, LayoutDashboard } from 'lucide-react'
import {
  type DepositStatus,
  formatDate,
  formatKg,
  mapDepositStatus,
} from './shared'

type DepositRow = {
  id: string
  depositNumber: string
  memberName: string
  commodityName: string
  weightKg: number
  submittedAt: number
  origin: string
  collectorName: string
  status: DepositStatus
  qualityScore: number | null
}

export function DepositHistoryPage() {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const koperasiId = defaultKoperasi?._id
  const records = useQuery(api.deposits.listDeposits, koperasiId ? { koperasiId } : 'skip') as DepositRow[] | undefined
  const deposits = useMemo(() => records ?? [], [records])
  const [selectedDepositId, setSelectedDepositId] = useState<string | undefined>()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!selectedDepositId && deposits[0]) {
      setSelectedDepositId(deposits[0].id)
    }
  }, [deposits, selectedDepositId])

  const totals = useMemo(
    () => ({
      totalWeight: deposits.reduce((total, deposit) => total + deposit.weightKg, 0),
      waitingQc: deposits.filter((deposit) => deposit.status === 'recorded').length,
      ready: deposits.filter((deposit) => deposit.status === 'quality_checked').length,
      allocated: deposits.filter((deposit) => deposit.status === 'allocated').length,
    }),
    [deposits],
  )

  const selectedDeposit =
    deposits.find((deposit) => deposit.id === selectedDepositId) ?? deposits[0]

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return deposits
    const term = searchTerm.toLowerCase()
    return deposits.filter(
      (deposit) =>
        deposit.depositNumber.toLowerCase().includes(term) ||
        deposit.memberName.toLowerCase().includes(term) ||
        deposit.commodityName.toLowerCase().includes(term) ||
        mapDepositStatus(deposit.status).toLowerCase().includes(term),
    )
  }, [deposits, searchTerm])

  const columns = [
    {
      header: 'ID',
      render: (deposit: DepositRow) => <span className="font-mono text-xs font-black text-emerald-700">{deposit.depositNumber}</span>,
    },
    {
      header: 'Anggota',
      render: (deposit: DepositRow) => (
        <div>
          <strong className="text-sm font-black text-slate-950">{deposit.memberName}</strong>
          <div className="mt-1 text-xs font-semibold text-slate-500">
            Petugas: {deposit.collectorName}
          </div>
        </div>
      ),
    },
    {
      header: 'Komoditas',
      render: (deposit: DepositRow) => <span>{deposit.commodityName}</span>,
    },
    {
      header: 'Berat',
      render: (deposit: DepositRow) => <span>{formatKg(deposit.weightKg)}</span>,
    },
    {
      header: 'Tanggal',
      render: (deposit: DepositRow) => <time className="text-xs font-semibold">{formatDate(deposit.submittedAt)}</time>,
    },
    {
      header: 'Quality',
      render: (deposit: DepositRow) => (
        <span>{deposit.qualityScore === null ? '-' : `QS ${deposit.qualityScore}`}</span>
      ),
    },
    {
      header: 'Status',
      render: (deposit: DepositRow) => <StatusBadge status={mapDepositStatus(deposit.status)} />,
    },
  ]

  return (
    <>
      <PageHeader
        title="Riwayat Setoran Anggota"
        subtitle={`Total setoran tercatat: ${deposits.length} transaksi`}
      />

      <section className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100 xl:grid-cols-4" aria-label="Ringkasan riwayat setoran">
        <MetricCard title="Total Volume" value={formatKg(totals.totalWeight)} description="Dari semua komoditas" icon={Wheat} />
        <MetricCard title="Menunggu QC" value={totals.waitingQc} description="Perlu pemeriksaan kualitas" icon={AlertTriangle} isAlert={totals.waitingQc > 0} />
        <MetricCard title="Lolos QC" value={totals.ready} description="Siap masuk supply pool" icon={TrendingUp} />
        <MetricCard title="Sudah Dialokasi" value={totals.allocated} description="Menjadi aset kontrak" icon={LayoutDashboard} />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Daftar Panen</span>
            <h2 className="text-lg font-black text-slate-950">Daftar panen yang diterima koperasi</h2>
          </div>

          {records === undefined && koperasiId ? (
            <p className="text-sm font-bold text-emerald-700">Memuat data setoran...</p>
          ) : deposits.length === 0 ? (
            <p className="text-sm font-bold text-emerald-700">Belum ada setoran. Tambahkan anggota dan komoditas terlebih dahulu.</p>
          ) : (
            <DataTable
              data={filteredRecords}
              columns={columns}
              keyExtractor={(item) => item.id}
              onRowClick={(item) => setSelectedDepositId(item.id)}
              selectedRowKey={selectedDeposit?.id}
              searchPlaceholder="Cari ID, anggota, komoditas..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
            />
          )}
        </div>

        {selectedDeposit ? (
          <aside className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Detail setoran">
            <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Detail Setoran</span>
              <h2 className="text-lg font-black text-slate-950">{selectedDeposit.depositNumber}</h2>
            </div>
            <div className="mt-3 grid gap-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="block text-xs font-black uppercase tracking-wide text-slate-500">Anggota</span>
                <strong className="mt-1 block text-sm font-black text-slate-950">{selectedDeposit.memberName}</strong>
                <span className="mt-1 block text-xs font-semibold text-slate-500">{selectedDeposit.origin}</span>
              </div>
              <div className="border-b border-slate-200 pb-3">
                <span className="block text-xs font-black uppercase tracking-wide text-slate-500">Komoditas</span>
                <strong className="mt-1 block text-sm font-black text-slate-950">{selectedDeposit.commodityName}</strong>
                <span className="mt-1 block text-xs font-semibold text-slate-500">{formatKg(selectedDeposit.weightKg)} diterima</span>
              </div>
              <div>
                <span className="block text-xs font-black uppercase tracking-wide text-slate-500">Status Operasional</span>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={mapDepositStatus(selectedDeposit.status)} />
                  <span className="text-xs font-semibold text-slate-500">
                    {selectedDeposit.qualityScore === null ? 'Quality belum tersedia' : `QS ${selectedDeposit.qualityScore}`}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </>
  )
}
