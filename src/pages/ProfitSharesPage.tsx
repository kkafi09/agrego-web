import { useEffect, useMemo, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { cn } from '../lib/utils'
import { downloadCsv, formatDate, formatKg } from './shared'

type ProfitShareRow = {
  shareId: string
  contractNumber: string | null
  memberName: string
  contributedWeightKg: number
  qualityScore: number
  amountEarned: number
  calculatedAt: number
}

export function ProfitSharesPage() {
  const rows = useQuery(api.reports.profitShareHistory, {}) as ProfitShareRow[] | undefined
  const profitRows = useMemo(() => rows ?? [], [rows])
  const [selectedMember, setSelectedMember] = useState('')

  useEffect(() => {
    if (!selectedMember && profitRows[0]) {
      setSelectedMember(profitRows[0].memberName)
    }
  }, [profitRows, selectedMember])

  const selectedRows = profitRows.filter((row) => row.memberName === selectedMember)
  const totalAmount = profitRows.reduce((total, row) => total + row.amountEarned, 0)
  const selectedAmount = selectedRows.reduce((total, row) => total + row.amountEarned, 0)

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Bagi Hasil</p>
          <h1>Riwayat pembagian hasil</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950">
          <span>Total dibagikan</span>
          <strong>Rp{totalAmount.toLocaleString('id-ID')}</strong>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Riwayat Bagi Hasil</p>
              <h2>Distribusi per kontrak</h2>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={profitRows.length === 0}
              type="button"
              onClick={() =>
                downloadCsv('laporan-bagi-hasil.csv', [
                  ['Anggota', 'Kontrak', 'Kontribusi Kg', 'Quality Score', 'Nominal', 'Tanggal'],
                  ...profitRows.map((row) => [
                    row.memberName,
                    row.contractNumber ?? '',
                    String(row.contributedWeightKg),
                    String(row.qualityScore),
                    String(row.amountEarned),
                    formatDate(row.calculatedAt),
                  ]),
                ])
              }
            >
              Unduh CSV
            </button>
          </div>
          <div className="grid gap-3">
            {rows === undefined ? (
              <p className="text-sm font-bold text-emerald-700">Memuat riwayat bagi hasil...</p>
            ) : profitRows.length === 0 ? (
              <p className="text-sm font-bold text-emerald-700">Belum ada pembagian hasil. Jalankan perhitungan dari kontrak yang sudah dialokasikan.</p>
            ) : profitRows.map((row) => (
              <button
                className={cn(
                  'grid gap-3 rounded-xl border p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center',
                  selectedMember === row.memberName
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                    : 'border-slate-200 bg-white',
                )}
                key={row.shareId}
                type="button"
                onClick={() => setSelectedMember(row.memberName)}
              >
                <div>
                  <strong>{row.memberName}</strong>
                  <span>{row.contractNumber ?? '-'}</span>
                </div>
                <div>
                  <span>{formatDate(row.calculatedAt)}</span>
                  <b>Rp{row.amountEarned.toLocaleString('id-ID')}</b>
                </div>
                <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">QS {row.qualityScore}</span>
                <small>{formatKg(row.contributedWeightKg)}</small>
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Detail Anggota</p>
            <h2>{selectedMember || '-'}</h2>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-semibold text-slate-500">Total Hak</span>
              <strong className="mt-1 block text-xl font-black text-slate-950">Rp{selectedAmount.toLocaleString('id-ID')}</strong>
              <small className="mt-1 block text-xs font-semibold text-slate-500">{selectedRows.length} kontrak selesai</small>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-semibold text-slate-500">Kontribusi</span>
              <strong className="mt-1 block text-xl font-black text-slate-950">
                {formatKg(selectedRows.reduce((total, row) => total + row.contributedWeightKg, 0))}
              </strong>
              <small className="mt-1 block text-xs font-semibold text-slate-500">Berbasis volume dan quality score</small>
            </div>
          </div>
        </aside>
      </section>
    </>
  )
}
