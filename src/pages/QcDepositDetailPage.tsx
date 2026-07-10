import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { formatDate, formatKg, mapDepositStatus } from './shared'

export function QcDepositDetailPage() {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const koperasiId = defaultKoperasi?._id
  const deposits = useQuery(api.deposits.listDeposits, koperasiId ? { koperasiId, status: 'recorded' } : 'skip')
  const [selectedDepositId, setSelectedDepositId] = useState('')
  const deposit = deposits?.find((item) => item.id === selectedDepositId)

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Quality Check</p>
          <h1>Detail setoran untuk pemeriksaan</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950" aria-label="Setoran aktif untuk QC">
          <span>Setoran aktif</span>
          <strong>{deposit?.depositNumber ?? '-'}</strong>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">Pilih setoran menunggu QC</span>
          <Select value={selectedDepositId} onValueChange={setSelectedDepositId}>
            <SelectTrigger className="h-11 w-full rounded-lg bg-white text-sm font-semibold text-slate-800">
              <SelectValue placeholder="Pilih setoran" />
            </SelectTrigger>
            <SelectContent position="popper">
              {deposits?.map((item) => (
                <SelectItem key={item.id} value={item.id}>{item.depositNumber} / {item.memberName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </section>

      {!deposit ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-emerald-700 shadow-sm">Belum ada setoran dipilih atau belum ada setoran yang menunggu QC.</p>
      ) : (
        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Identitas Setoran</p>
              <h2>{deposit.commodityName}</h2>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div><dt>Anggota</dt><dd>{deposit.memberName}</dd></div>
              <div><dt>Asal</dt><dd>{deposit.origin}</dd></div>
              <div><dt>Berat</dt><dd>{formatKg(deposit.weightKg)}</dd></div>
              <div><dt>Tanggal Setor</dt><dd>{formatDate(deposit.submittedAt)}</dd></div>
              <div><dt>Status</dt><dd>{mapDepositStatus(deposit.status as any)}</dd></div>
              <div><dt>Petugas</dt><dd>{deposit.collectorName}</dd></div>
            </dl>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Kesiapan QC</p>
              <h2>Antrean pemeriksaan</h2>
            </div>
            <ul className="mt-4 grid gap-2">
              <li className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">Setoran tercatat di Convex</li>
              <li className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">Belum memiliki quality score final</li>
              <li className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">Siap diproses lewat form QC</li>
            </ul>
          </article>
        </section>
      )}
    </>
  )
}
