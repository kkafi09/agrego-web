import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { formatKg } from './shared'

export function AllocationStatusPage() {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const koperasiId = defaultKoperasi?._id
  const supplyPools = useQuery(api.dashboard.supplyPoolStatuses, koperasiId ? { koperasiId } : 'skip')
  const pools = supplyPools ?? []

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Alokasi Stok</p>
          <h1>Status alokasi per kontrak</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950" aria-label="Jumlah supply pool aktif">
          <span>Supply pool aktif</span>
          <strong>{pools.length} kontrak</strong>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Status Alokasi</p>
            <h2>Progres pool dan kandidat tambahan</h2>
          </div>
          <span>Database terkoneksi</span>
        </div>
        <div className="mt-5 grid gap-4">
          {supplyPools === undefined && koperasiId ? (
            <p className="text-sm font-bold text-emerald-700">Memuat status alokasi...</p>
          ) : pools.length === 0 ? (
            <p className="text-sm font-bold text-emerald-700">Belum ada supply pool aktif.</p>
          ) : pools.map((pool) => (
            <article className="grid gap-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_1fr_0.9fr] lg:items-center" key={pool.contractId}>
              <div className="grid gap-2">
                <strong className="text-base font-black text-slate-950">{pool.contractNumber}</strong>
                <p className="text-sm font-semibold text-slate-500">{pool.commodityName}</p>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span>{pool.commodityName}</span>
                  <strong>{pool.percentAllocated}%</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <span className="block h-full rounded-full bg-emerald-600" style={{ width: `${pool.percentAllocated}%` }} />
                </div>
                <small className="text-xs font-semibold text-slate-500">{formatKg(pool.allocatedWeightKg)} dari {formatKg(pool.targetVolumeKg)}</small>
              </div>
              <dl className="grid grid-cols-3 gap-3">
                <div><dt className="text-xs font-semibold text-slate-500">Kandidat</dt><dd className="mt-1 text-sm font-black text-slate-950">{formatKg(pool.candidateWeightKg)}</dd></div>
                <div><dt className="text-xs font-semibold text-slate-500">Anggota</dt><dd className="mt-1 text-sm font-black text-slate-950">{pool.contributors}</dd></div>
                <div><dt className="text-xs font-semibold text-slate-500">Pool QS</dt><dd className="mt-1 text-sm font-black text-emerald-700">{pool.poolQualityScore ?? '-'}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
