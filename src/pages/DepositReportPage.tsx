import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from '../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  type DepositStatus,
  downloadCsv,
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
  status: DepositStatus
  qualityScore: number | null
}

export function DepositReportPage() {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const koperasiId = defaultKoperasi?._id
  const records = useQuery(api.deposits.listDeposits, koperasiId ? { koperasiId } : 'skip') as DepositRow[] | undefined
  const deposits = records ?? []
  const commodities = useQuery(api.masterData.searchCommodities, { searchTerm: '' })
  const [commodityFilter, setCommodityFilter] = useState('Semua')
  const filteredRecords = deposits.filter((record) =>
    commodityFilter === 'Semua' ? true : record.commodityName === commodityFilter,
  )
  const totalWeight = filteredRecords.reduce((total, record) => total + record.weightKg, 0)
  const memberCount = new Set(filteredRecords.map((record) => record.memberName)).size

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Laporan</p>
          <h1>Laporan setoran anggota</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950" aria-label="Total volume laporan">
          <span>Total volume</span>
          <strong>{formatKg(totalWeight)}</strong>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500">
          <span>Setoran</span>
          <strong>{filteredRecords.length}</strong>
          <small>Transaksi dalam filter</small>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500">
          <span>Anggota</span>
          <strong>{memberCount}</strong>
          <small>Penyetor unik</small>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500">
          <span>Volume</span>
          <strong>{formatKg(totalWeight)}</strong>
          <small>Akumulasi setoran</small>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500">
          <span>Komoditas</span>
          <strong>{commodityFilter}</strong>
          <small>Filter aktif</small>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Filter Laporan</p>
            <h2>Ringkasan setoran per periode</h2>
          </div>
          <Button
            className="h-11 rounded-lg bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800"
            disabled={filteredRecords.length === 0}
            type="button"
            onClick={() =>
              downloadCsv('laporan-setoran.csv', [
                ['ID', 'Anggota', 'Komoditas', 'Berat', 'Tanggal', 'Quality', 'Status'],
                ...filteredRecords.map((record) => [
                  record.depositNumber,
                  record.memberName,
                  record.commodityName,
                  String(record.weightKg),
                  formatDate(record.submittedAt),
                  String(record.qualityScore ?? ''),
                  mapDepositStatus(record.status),
                ]),
              ])
            }
          >
            Unduh CSV
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100">
          <label>
            <span>Komoditas</span>
            <Select value={commodityFilter} onValueChange={setCommodityFilter}>
              <SelectTrigger className="h-11 w-full rounded-lg bg-white text-sm font-semibold text-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semua">Semua</SelectItem>
                {commodities?.map((commodity) => (
                  <SelectItem key={commodity._id} value={commodity.name}>{commodity.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          {records === undefined && koperasiId ? (
            <p className="p-4 text-sm font-bold text-emerald-700">Memuat laporan setoran...</p>
          ) : filteredRecords.length === 0 ? (
            <p className="p-4 text-sm font-bold text-emerald-700">Belum ada data setoran untuk laporan.</p>
          ) : filteredRecords.map((record) => (
            <article className="deposit-row" key={record.id}>
              <span className="font-mono text-xs font-black text-emerald-700">{record.depositNumber}</span>
              <strong>{record.memberName}</strong>
              <span>{record.commodityName}</span>
              <span>{formatKg(record.weightKg)}</span>
              <span>{formatDate(record.submittedAt)}</span>
              <span>{record.qualityScore ?? '-'}</span>
              <span>{mapDepositStatus(record.status)}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
