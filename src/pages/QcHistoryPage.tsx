import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { getStatusStyle } from '../config/status-config'
import { formatDate, mapQualityDecision } from './shared'

export function QcHistoryPage() {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const koperasiId = defaultKoperasi?._id
  const qcRecords = useQuery(api.qualityChecks.listQualityChecks, koperasiId ? { koperasiId } : 'skip')
  const records = qcRecords ?? []
  const averageScore =
    records.length > 0
      ? Math.round(records.reduce((total, record) => total + record.qualityScore, 0) / records.length)
      : 0
  const passedCount = records.filter((record) => record.decision !== 'held').length

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Quality Check</p>
          <h1>Riwayat pemeriksaan kualitas</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950" aria-label="Ringkasan quality check">
          <span>Rata-rata Quality Score</span>
          <strong>{averageScore}</strong>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100 xl:grid-cols-4" aria-label="Ringkasan riwayat QC">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500"><span>Total QC</span><strong>{records.length}</strong><small>Pemeriksaan tercatat</small></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500"><span>Lolos Standar</span><strong>{passedCount}</strong><small>Siap dipertimbangkan alokasi</small></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500"><span>Perlu Ditahan</span><strong>{records.length - passedCount}</strong><small>Butuh tindak lanjut koperasi</small></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500"><span>Skor Tertinggi</span><strong>{records.length > 0 ? Math.max(...records.map((record) => record.qualityScore)) : 0}</strong><small>Prioritas supply pool</small></article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Riwayat QC</p>
            <h2>Parameter kualitas setoran</h2>
          </div>
          <span>Database terkoneksi</span>
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200" role="table" aria-label="Riwayat QC">
          <div className="grid min-w-[900px] grid-cols-8 gap-3 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500" role="row">
            <span>ID QC</span><span>Setoran</span><span>Komoditas</span><span>Kadar Air</span><span>Grade</span><span>Kerusakan</span><span>Skor</span><span>Keputusan</span>
          </div>
          {qcRecords === undefined && koperasiId ? (
            <p className="p-4 text-sm font-bold text-emerald-700">Memuat riwayat QC...</p>
          ) : records.length === 0 ? (
            <p className="p-4 text-sm font-bold text-emerald-700">Belum ada pemeriksaan kualitas.</p>
          ) : records.map((record) => {
            const decision = mapQualityDecision(record.decision)
            return (
              <button
                className="grid min-w-[900px] grid-cols-8 gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm text-slate-700"
                role="row"
                key={record.id}
                type="button"
                onClick={() => sessionStorage.setItem('agrego_selected_quality_check_id', record.id)}
              >
                <span className="font-mono text-xs font-black text-emerald-700">{record.id}</span>
                <div><strong>{record.depositNumber ?? '-'}</strong><small>{record.memberName} / {record.inspectorName}</small></div>
                <span>{record.commodityName}</span>
                <span>{record.moisturePercent}%</span>
                <span>{record.sizeGrade}</span>
                <span>{record.defectPercent}%</span>
                <strong>{record.qualityScore}</strong>
                <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-black ${getStatusStyle(decision).className}`}>{getStatusStyle(decision).label}</span>
              </button>
            )
          })}
        </div>
      </section>
    </>
  )
}
