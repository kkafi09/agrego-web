import PageHeader from '../components/layout/page-header'
import MetricCard from '../components/dashboard/kpi-tile'
import CommodityStockList from '../components/dashboard/commodity-stock-list'
import ActionRequiredList from '../components/dashboard/action-required-list'
import ContractProgressCard from '../components/dashboard/contract-progress-card'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Wheat, TrendingUp, LayoutDashboard, AlertTriangle } from 'lucide-react'
import {
  formatDate,
  formatKg,
} from './shared'

export function DashboardPage() {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const koperasiId = defaultKoperasi?._id
  const stockSummaries = useQuery(api.dashboard.stockSummaries, koperasiId ? { koperasiId } : 'skip')
  const contracts = useQuery(api.dashboard.activeContractProgress, koperasiId ? { koperasiId } : 'skip')
  const supplyPools = useQuery(api.dashboard.supplyPoolStatuses, koperasiId ? { koperasiId } : 'skip')
  const notifications = useQuery(
    api.notifications.listContractNotifications,
    koperasiId ? { koperasiId, unreadOnly: true } : 'skip',
  )
  const stocks = stockSummaries ?? []
  const activeContracts = contracts ?? []
  const pools = supplyPools ?? []
  const alerts = notifications ?? []
  const totalStock = stocks.reduce((total, item) => total + item.totalKg, 0)
  const totalReady = stocks.reduce((total, item) => total + item.readyKg, 0)
  const qualityValues = stocks
    .map((item) => item.averageQualityScore)
    .filter((score): score is number => typeof score === 'number')
  const averageQuality =
    qualityValues.length > 0
      ? Math.round(qualityValues.reduce((total, score) => total + score, 0) / qualityValues.length)
      : 0
  const activeFulfilled = activeContracts.reduce((total, contract) => total + contract.fulfilledKg, 0)
  const activeTargets = activeContracts.reduce((total, contract) => total + contract.targetVolumeKg, 0)
  const overallProgress = activeTargets > 0 ? Math.round((activeFulfilled / activeTargets) * 100) : 0

  return (
    <>
      <PageHeader
        title="Dashboard Koperasi"
        subtitle="Kapasitas pasok dan progres kontrak hari ini"
      />

      <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100 xl:grid-cols-4">
        <MetricCard
          title="Total Stok Tercatat"
          value={formatKg(totalStock)}
          description={`${formatKg(totalReady)} siap dialokasi`}
          icon={Wheat}
        />
        <MetricCard
          title="Quality Score Rata-rata"
          value={averageQuality}
          description="Di atas standar kontrak aktif"
          icon={TrendingUp}
        />
        <MetricCard
          title="Progres Kontrak Aktif"
          value={`${overallProgress}%`}
          description={`${activeContracts.length} kontrak dalam pemenuhan`}
          icon={LayoutDashboard}
        />
        <MetricCard
          title="Notifikasi Kontrak"
          value={alerts.length}
          description="Perlu ditinjau pengurus"
          icon={AlertTriangle}
          isAlert={alerts.length > 0}
        />
      </div>

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

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">Notifikasi Kontrak</span>
            <h2 className="mt-1 text-lg font-black text-slate-950">Peluang buyer masuk</h2>
          </div>
          <div className="mt-4">
          <ActionRequiredList
            notifications={alerts.map((item) => ({
              id: item.id,
              title: item.title,
              body: item.message,
              time: formatDate(item.createdAt),
            }))}
          />
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
        
        <div className="mt-4 grid gap-4 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100 [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:font-semibold [&_textarea]:outline-none [&_textarea:focus]:border-emerald-500 [&_textarea:focus]:ring-4 [&_textarea:focus]:ring-emerald-100 lg:grid-cols-2">
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
              minimumQuality={contract.minimumQualityScore}
              deadline={formatDate(contract.deadlineAt)}
              status="Aktif"
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Status Supply Pool</span>
          <h2 className="mt-1 text-lg font-black text-slate-950">Alokasi stok ke portofolio kontrak</h2>
        </div>
        <div className="mt-4 grid gap-4 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100 [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:font-semibold [&_textarea]:outline-none [&_textarea:focus]:border-emerald-500 [&_textarea:focus]:ring-4 [&_textarea:focus]:ring-emerald-100 sm:grid-cols-2 xl:grid-cols-4">
          {pools.length === 0 ? (
            <p className="text-sm font-bold text-emerald-700">Belum ada supply pool aktif.</p>
          ) : pools.map((pool) => (
            <article className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4" key={pool.contractId}>
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
                  <dd className="mt-1 text-sm font-black text-emerald-700">{pool.poolQualityScore ?? '-'}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
