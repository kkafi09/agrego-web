import PageHeader from '../components/layout/page-header'
import MetricCard from '../components/dashboard/kpi-tile'
import CommodityStockList from '../components/dashboard/commodity-stock-list'
import ContractProgressCard from '../components/dashboard/contract-progress-card'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Page } from '../config/navigation'
import type { AuthUser } from '../lib/auth'
import { getAuthToken } from '../lib/auth'
import { Wheat, TrendingUp, LayoutDashboard } from 'lucide-react'
import {
  formatDate,
  formatKg,
} from './shared'

export function DashboardPage({ goToPage, user }: { goToPage: (page: Page) => void; user: AuthUser | null }) {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const currentKoperasi = useQuery(api.koperasi.getCurrentKoperasi, user?.role === 'Koperasi' ? { token: getAuthToken() } : 'skip')
  const koperasiId = user?.role === 'Koperasi' ? currentKoperasi?._id : defaultKoperasi?._id
  const stockSummaries = useQuery(api.dashboard.stockSummaries, koperasiId ? { koperasiId } : 'skip')
  const contracts = useQuery(api.dashboard.activeContractProgress, user ? { token: getAuthToken() } : 'skip')
  const supplyPools = useQuery(api.dashboard.supplyPoolStatuses, user?.role === 'Koperasi' ? { token: getAuthToken() } : 'skip')
  const inventory = useQuery(api.dashboard.inventoryBalance, user?.role === 'Koperasi' ? { token: getAuthToken() } : 'skip')
  const stocks = stockSummaries ?? []
  const activeContracts = contracts ?? []
  const pools = supplyPools ?? []
  const inventoryRows = inventory ?? []
  const totalInbound = inventoryRows.reduce((total, row) => total + row.inboundKg, 0)
  const totalOutbound = inventoryRows.reduce((total, row) => total + row.outboundKg, 0)
  const totalBalance = inventoryRows.reduce((total, row) => total + row.balanceKg, 0)
  const totalStock = stocks.reduce((total, item) => total + item.totalKg, 0)
  const totalReady = stocks.reduce((total, item) => total + item.readyKg, 0)
  const qualityGrades = stocks.map((item) => item.qualityGrade).filter(Boolean)
  const activeFulfilled = activeContracts.reduce((total, contract) => total + contract.fulfilledKg, 0)
  const activeTargets = activeContracts.reduce((total, contract) => total + contract.targetVolumeKg, 0)
  const overallProgress = activeTargets > 0 ? Math.round((activeFulfilled / activeTargets) * 100) : 0

  return (
    <>
      <PageHeader
        title="Dashboard Koperasi"
        subtitle="Kapasitas pasok dan progres kontrak hari ini"
      />

      <div className="grid gap-4 sm:grid-cols-2-slate-200-slate-200 xl:grid-cols-4">
        <MetricCard
          title="Total Stok Tercatat"
          value={formatKg(totalStock)}
          description={`${formatKg(totalReady)} siap dialokasi`}
          icon={Wheat}
        />
        <MetricCard
          title="Grade QS Terbaik"
          value={qualityGrades[0] ?? '-'}
          description="Berdasarkan stok yang tercatat"
          icon={TrendingUp}
        />
        <MetricCard
          title="Progres Kontrak Aktif"
          value={`${overallProgress}%`}
          description={`${activeContracts.length} kontrak dalam pemenuhan`}
          icon={LayoutDashboard}
        />
      </div>

      {user?.role === 'Koperasi' ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div><span className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Neraca Barang</span><h2 className="mt-1 text-lg font-black text-slate-950">Barang masuk, keluar, dan saldo koperasi</h2></div>
            <span className="text-sm font-bold text-slate-500">Supply pool dihitung sebagai barang keluar</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <article className="rounded-xl border border-emerald-100 bg-emerald-50 p-4"><span className="text-xs font-bold text-emerald-700">Barang masuk</span><strong className="mt-1 block text-xl font-black text-slate-950">{formatKg(totalInbound)}</strong></article>
            <article className="rounded-xl border border-orange-100 bg-orange-50 p-4"><span className="text-xs font-bold text-orange-700">Barang keluar</span><strong className="mt-1 block text-xl font-black text-slate-950">{formatKg(totalOutbound)}</strong></article>
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-xs font-bold text-slate-600">Saldo barang</span><strong className="mt-1 block text-xl font-black text-slate-950">{formatKg(totalBalance)}</strong></article>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Komoditas</th><th className="px-4 py-3">Masuk</th><th className="px-4 py-3">Keluar</th><th className="px-4 py-3">Saldo</th><th className="px-4 py-3">Grade QS</th></tr></thead><tbody className="divide-y divide-slate-100">{inventoryRows.length === 0 ? <tr><td className="px-4 py-6 text-center font-semibold text-slate-500" colSpan={5}>Belum ada neraca barang.</td></tr> : inventoryRows.map((row) => <tr key={row.commodityId}><td className="px-4 py-3 font-black text-slate-950">{row.commodityName}</td><td className="px-4 py-3 font-semibold text-slate-700">{formatKg(row.inboundKg)}</td><td className="px-4 py-3 font-semibold text-slate-700">{formatKg(row.outboundKg)}</td><td className="px-4 py-3 font-black text-emerald-700">{formatKg(row.balanceKg)}</td><td className="px-4 py-3 font-semibold text-slate-700">{row.qualityGrade ?? '-'}</td></tr>)}</tbody></table>
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Ringkasan Stok</span>
            <h2 className="mt-1 text-lg font-black text-slate-950">Komoditas dan kualitas terkini</h2>
          </div>
          <div className="mt-4">
          {stockSummaries === undefined && koperasiId ? (
            <p className="text-sm font-bold text-emerald-700">Memuat ringkasan stok...</p>
          ) : (
            <CommodityStockList stocks={stocks} />
          )}
          </div>
        </section>

      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Progres Kontrak</span>
            <h2 className="mt-1 text-lg font-black text-slate-950">Kontrak aktif dan pemenuhan volume</h2>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-black text-emerald-700">
            {formatKg(activeFulfilled)} terkumpul
          </span>
        </div>
        
        <div className="mt-4 grid gap-4-slate-200-slate-200-slate-200 lg:grid-cols-2">
          {activeContracts.length === 0 ? (
            <p className="text-sm font-bold text-emerald-700">Belum ada kontrak aktif.</p>
          ) : activeContracts.map((contract) => (
            <ContractProgressCard
              key={contract.contractId}
              id={contract.contractNumber}
              buyer={contract.buyerName}
              commodity={contract.commodityName}
              fulfilledKg={contract.fulfilledKg}
              targetKg={contract.targetVolumeKg}
              minimumQuality={contract.minimumQualityGrade}
              deadline={formatDate(contract.deadlineAt)}
              status="Aktif"
              onClick={() => {
                sessionStorage.setItem('agrego_selected_contract_id', contract.contractId)
                goToPage('contractDetail')
              }}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Status Supply Pool</span>
          <h2 className="mt-1 text-lg font-black text-slate-950">Alokasi stok ke portofolio kontrak</h2>
        </div>
        <div className="mt-4 grid gap-4-slate-200-slate-200-slate-200 sm:grid-cols-2 xl:grid-cols-4">
          {pools.length === 0 ? (
            <p className="text-sm font-bold text-emerald-700">Belum ada supply pool aktif.</p>
          ) : pools.map((pool) => (
            <article
              className="grid cursor-pointer gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-md"
              key={pool.contractId}
              onClick={() => {
                sessionStorage.setItem('agrego_selected_contract_id', pool.contractId)
                goToPage('contractDetail')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  sessionStorage.setItem('agrego_selected_contract_id', pool.contractId)
                  goToPage('contractDetail')
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Buka supply pool kontrak ${pool.contractNumber}`}
            >
              <div>
                <span className="text-xs font-black text-slate-500">{pool.contractNumber}</span>
                <strong className="mt-1 block text-sm font-black text-slate-950">{pool.commodityName}</strong>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs font-semibold text-slate-500">Teralokasi</dt>
                  <dd className="mt-1 text-sm font-black text-slate-950">{formatKg(pool.allocatedWeightKg)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-500">Kandidat</dt>
                  <dd className="mt-1 text-sm font-black text-slate-950">{formatKg(pool.candidateWeightKg)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-500">Anggota</dt>
                  <dd className="mt-1 text-sm font-black text-slate-950">{pool.contributors}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-500">Pool QS</dt>
                  <dd className="mt-1 text-sm font-black text-emerald-700">{pool.poolQualityGrade ?? '-'}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
