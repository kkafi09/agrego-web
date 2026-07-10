import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Page } from '../config/navigation'
import { getStatusStyle } from '../config/status-config'
import {
  type ContractStatus,
  formatDate,
  formatKg,
  mapContractStatus,
  progressPercent,
} from './shared'

export function ContractsPage({ goToPage }: { goToPage: (page: Page) => void }) {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const koperasiId = defaultKoperasi?._id
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [commodityFilter, setCommodityFilter] = useState('Semua')
  const commodityList = useQuery(api.masterData.searchCommodities, { searchTerm: '' })
  const contracts = useQuery(api.contracts.listContracts, koperasiId ? { koperasiId } : 'skip')
  const rows = contracts ?? []
  const totalContractValue = rows.reduce(
    (total, contract) => total + contract.targetVolumeKg * contract.pricePerKg,
    0,
  )
  const filteredContracts = rows.filter((contract) => {
    const statusLabel = mapContractStatus(contract.status as ContractStatus)
    const statusMatches = statusFilter === 'Semua' || statusLabel === statusFilter
    const commodityMatches = commodityFilter === 'Semua' || contract.commodityName === commodityFilter
    return statusMatches && commodityMatches
  })

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Manajemen Kontrak</p>
          <h1>Daftar kontrak buyer</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950" aria-label="Nilai kontrak aktif">
          <span>Nilai estimasi</span>
          <strong>Rp{totalContractValue.toLocaleString('id-ID')}</strong>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Kontrak</p>
            <h2>Permintaan industri dan status pemenuhan</h2>
          </div>
          <button className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50" type="button" onClick={() => goToPage('newContract')}>
            Buat Kontrak
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100" aria-label="Filter daftar kontrak">
          <label>
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option>Semua</option>
              <option>Baru</option>
              <option>Aktif</option>
              <option>Selesai</option>
              <option>Batal</option>
            </select>
          </label>
          <label>
            <span>Komoditas</span>
            <select value={commodityFilter} onChange={(event) => setCommodityFilter(event.target.value)}>
              <option>Semua</option>
              {commodityList?.map((commodity) => (
                <option key={commodity._id}>{commodity.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 grid gap-4">
          {contracts === undefined && koperasiId ? (
            <p className="text-sm font-bold text-emerald-700">Memuat data kontrak...</p>
          ) : filteredContracts.length === 0 ? (
            <p className="text-sm font-bold text-emerald-700">Belum ada kontrak buyer.</p>
          ) : filteredContracts.map((contract) => {
            const percent = progressPercent(contract.fulfilledVolumeKg, contract.targetVolumeKg)
            const statusLabel = mapContractStatus(contract.status as ContractStatus)
            const statusStyle = getStatusStyle(statusLabel)

            return (
              <article className="grid gap-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:grid-cols-[1fr_1.4fr_0.9fr] xl:items-center" key={contract.contractId}>
                <div className="grid gap-2">
                  <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-black ${statusStyle.className}`}>{statusStyle.label}</span>
                  <strong className="text-base font-black text-slate-950">{contract.contractNumber}</strong>
                  <p className="text-sm font-semibold text-slate-500">{contract.buyerName}</p>
                </div>
                <dl className="grid gap-3 sm:grid-cols-4">
                  <div><dt className="text-xs font-semibold text-slate-500">Komoditas</dt><dd className="mt-1 text-sm font-black text-slate-950">{contract.commodityName}</dd></div>
                  <div><dt className="text-xs font-semibold text-slate-500">Target</dt><dd className="mt-1 text-sm font-black text-slate-950">{formatKg(contract.targetVolumeKg)}</dd></div>
                  <div><dt className="text-xs font-semibold text-slate-500">Minimum QS</dt><dd className="mt-1 text-sm font-black text-slate-950">{contract.minimumQualityScore}</dd></div>
                  <div><dt className="text-xs font-semibold text-slate-500">Tenggat</dt><dd className="mt-1 text-sm font-black text-slate-950">{formatDate(contract.deadlineAt)}</dd></div>
                </dl>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-3 text-sm"><span>Progress pemenuhan</span><strong>{percent}%</strong></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-emerald-600" style={{ width: `${percent}%` }} /></div>
                  <button
                    className="text-sm font-black text-emerald-700 transition hover:text-emerald-800"
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem('agrego_selected_contract_id', contract.contractId)
                      goToPage('contractDetail')
                    }}
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
