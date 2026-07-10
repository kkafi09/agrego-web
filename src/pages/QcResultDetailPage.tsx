import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { formatDate, mapQualityDecision } from './shared'

export function QcResultDetailPage() {
  const [selectedQualityCheckId] = useState(() => sessionStorage.getItem('agrego_selected_quality_check_id'))
  const record = useQuery(
    api.qualityChecks.getQualityCheckById,
    selectedQualityCheckId ? { qualityCheckId: selectedQualityCheckId as any } : 'skip',
  )

  if (!selectedQualityCheckId) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-emerald-700 shadow-sm">Pilih hasil QC dari riwayat pemeriksaan terlebih dahulu.</p>
  }

  if (record === undefined) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-emerald-700 shadow-sm">Memuat detail hasil QC...</p>
  }

  if (!record) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-emerald-700 shadow-sm">Hasil QC tidak ditemukan.</p>
  }

  const decision = mapQualityDecision(record.decision)
  const recommendation =
    record.qualityScore >= 90
      ? 'Masukkan sebagai prioritas supply pool untuk kontrak aktif.'
      : record.qualityScore >= 82
        ? 'Layak dialokasikan setelah kebutuhan prioritas terpenuhi.'
        : 'Tahan dari pool dan lakukan sortasi ulang.'

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Quality Check</p>
          <h1>Detail hasil pemeriksaan</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950" aria-label="Skor hasil QC">
          <span>Quality Score</span>
          <strong>{record.qualityScore}</strong>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">{record.id}</p>
            <h2>{decision}</h2>
            <p>{recommendation}</p>
          </div>
          <div className="score-ring" aria-label={`Quality score ${record.qualityScore}`}>
            {record.qualityScore}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Setoran</p>
            <h2>{record.depositNumber ?? '-'}</h2>
          </div>
          <dl className="grid gap-3">
            <div><dt>Anggota</dt><dd>{record.memberName}</dd></div>
            <div><dt>Komoditas</dt><dd>{record.commodityName}</dd></div>
            <div><dt>Petugas QC</dt><dd>{record.inspectorName}</dd></div>
            <div><dt>Tanggal</dt><dd>{formatDate(record.checkedAt)}</dd></div>
          </dl>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Hasil Parameter</p>
              <h2>Rincian pengukuran kualitas</h2>
            </div>
            <span>Audit trail QC</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div><dt>Kadar Air</dt><strong>{record.moisturePercent}%</strong></div>
            <div><dt>Grade Ukuran</dt><strong>{record.sizeGrade}</strong></div>
            <div><dt>Kerusakan</dt><strong>{record.defectPercent}%</strong></div>
            <div><dt>Keputusan</dt><strong>{decision}</strong></div>
          </div>
        </article>
      </section>
    </>
  )
}
