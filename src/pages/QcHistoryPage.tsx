import { useQuery } from 'convex/react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../convex/_generated/api'
import { getAuthToken } from '../lib/auth'
import { getPagePath } from '../config/routes'
import { getStatusStyle } from '../config/status-config'
import { mapQualityDecision } from './shared'

export function QcHistoryPage() {
  const currentKoperasi = useQuery(api.koperasi.getCurrentKoperasi, { token: getAuthToken() })
  const navigate = useNavigate()
  const koperasiId = currentKoperasi?._id
  const qualityChecks = useQuery(api.qualityChecks.listQualityChecks, koperasiId ? { koperasiId } : 'skip')
  const records = qualityChecks ?? []
  const bestGrade = records.reduce((best, record) => {
    const order = ['A', 'B', 'C', 'D']
    return order.indexOf(record.qualityGrade) < order.indexOf(best) ? record.qualityGrade : best
  }, records[0]?.qualityGrade ?? '-')
  const passedCount = records.filter((record) => record.decision !== 'held').length

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Quality Check</p>
          <h1>Riwayat pemeriksaan kualitas</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950" aria-label="Ringkasan quality check">
          <span>Grade Terbaik</span>
          <strong>{bestGrade}</strong>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2-slate-200-slate-200 xl:grid-cols-4" aria-label="Ringkasan riwayat QC">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500"><span>Total QC</span><strong>{records.length}</strong><small>Pemeriksaan tercatat</small></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500"><span>Lolos Standar</span><strong>{passedCount}</strong><small>Siap dipertimbangkan alokasi</small></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500"><span>Perlu Ditahan</span><strong>{records.length - passedCount}</strong><small>Butuh tindak lanjut koperasi</small></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500"><span>Grade Terendah</span><strong>{records.length > 0 ? records.reduce((worst, record) => ['A', 'B', 'C', 'D'].indexOf(record.qualityGrade) > ['A', 'B', 'C', 'D'].indexOf(worst) ? record.qualityGrade : worst, records[0].qualityGrade) : '-'}</strong><small>Perlu perhatian QC</small></article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Riwayat QC</p>
            <h2>Parameter kualitas setoran</h2>
          </div>
          <span>Database terkoneksi</span>
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white" aria-label="Riwayat QC">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Setoran</th>
                  <th className="px-4 py-3">Komoditas</th>
                  <th className="px-4 py-3">Grade QS</th>
                  <th className="px-4 py-3">Kerusakan</th>
                  <th className="px-4 py-3">Grade QS</th>
                  <th className="px-4 py-3">Keputusan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {qualityChecks === undefined && koperasiId ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">Memuat riwayat QC...</td></tr>
                ) : records.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">Belum ada pemeriksaan kualitas.</td></tr>
                ) : records.map((record) => {
                  const decision = mapQualityDecision(record.decision)
                  return (
                    <tr
                      className="cursor-pointer transition hover:bg-emerald-50/50"
                      key={record.id}
                      onClick={() => {
                        sessionStorage.setItem('agrego_selected_quality_check_id', record.id)
                        navigate(getPagePath('qcResultDetail'))
                      }}
                    >
                      <td className="px-4 py-3"><strong className="block text-slate-950">{record.depositNumber ?? '-'}</strong><small className="font-semibold text-slate-500">{record.memberName} / {record.inspectorName}</small></td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{record.commodityName}</td>
                      <td className="px-4 py-3 font-black text-slate-950">{record.qualityGrade}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{record.defectPercent}%</td>
                      <td className="px-4 py-3"><span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-black ${getStatusStyle(decision).className}`}>{getStatusStyle(decision).label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}
