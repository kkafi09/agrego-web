import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Page } from '../config/navigation'
import type { AuthUser } from '../lib/auth'
import { getAuthToken } from '../lib/auth'
import { getStatusStyle } from '../config/status-config'
import { Button } from '../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  type ContractStatus,
  formatDate,
  formatKg,
  mapContractStatus,
  progressPercent,
} from './shared'

export function ContractsPage({ goToPage, user }: { goToPage: (page: Page) => void; user: AuthUser | null }) {
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [commodityFilter, setCommodityFilter] = useState('Semua')
  const commodityList = useQuery(api.masterData.searchCommodities, { searchTerm: '' })
  const adminContracts = useQuery(api.contracts.listAllContracts, user?.role === 'Admin' ? { token: getAuthToken() } : 'skip')
  const contracts = useQuery(api.contracts.listContracts, user?.role !== 'Admin' ? { token: getAuthToken() } : 'skip')
  const rows = user?.role === 'Admin' ? (adminContracts ?? []) : (contracts ?? [])
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
          {user?.role === 'Buyer' ? <Button className="h-11 rounded-lg bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800" type="button" onClick={() => goToPage('newContract')}>Buat Kontrak</Button> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Filter daftar kontrak">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Status</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Semua">Semua</SelectItem>
                <SelectItem value="Baru">Baru</SelectItem>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
                <SelectItem value="Batal">Batal</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">Komoditas</span>
            <Select value={commodityFilter} onValueChange={setCommodityFilter}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Semua">Semua</SelectItem>
                {commodityList?.map((commodity) => (
                  <SelectItem key={commodity._id} value={commodity.name}>{commodity.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Kontrak</th>
                  <th className="px-4 py-3">Komoditas</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Minimum Grade</th>
                  <th className="px-4 py-3">Tenggat</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(user?.role === 'Admin' ? adminContracts : contracts) === undefined ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">Memuat data kontrak...</td></tr>
                ) : filteredContracts.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">Belum ada kontrak buyer.</td></tr>
                ) : filteredContracts.map((contract) => {
                  const percent = progressPercent(contract.fulfilledVolumeKg, contract.targetVolumeKg)
                  const statusLabel = mapContractStatus(contract.status as ContractStatus)
                  const statusStyle = getStatusStyle(statusLabel)

                  return (
                    <tr className="transition hover:bg-emerald-50/50" key={contract.contractId}>
                      <td className="px-4 py-3">
                        <span className={`mb-2 inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-black ${statusStyle.className}`}>{statusStyle.label}</span>
                        <strong className="block text-sm font-black text-slate-950">{contract.contractNumber}</strong>
                        <span className="text-xs font-semibold text-slate-500">{contract.buyerName}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{contract.commodityName}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{formatKg(contract.targetVolumeKg)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{contract.minimumQualityGrade}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{formatDate(contract.deadlineAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-36 items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-emerald-600" style={{ width: `${percent}%` }} /></div>
                          <strong className="text-xs">{percent}%</strong>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="text-emerald-700 hover:text-emerald-800"
                          onClick={() => {
                            sessionStorage.setItem('agrego_selected_contract_id', contract.contractId)
                            goToPage('contractDetail')
                          }}
                        >
                          Detail
                        </Button>
                      </td>
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
