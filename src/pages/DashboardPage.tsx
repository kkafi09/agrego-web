import PageHeader from '../components/layout/page-header'
import MetricCard from '../components/dashboard/metric-card'
import CommodityStockList from '../components/dashboard/commodity-stock-list'
import ActionRequiredList from '../components/dashboard/action-required-list'
import ContractProgressCard from '../components/dashboard/contract-progress-card'
import { Wheat, TrendingUp, LayoutDashboard, AlertTriangle } from 'lucide-react'
import {
  totalStock,
  totalReady,
  averageQuality,
  overallProgress,
  contracts,
  notifications,
  stockSummaries,
  activeFulfilled,
  supplyPools,
  formatKg,
} from './shared'

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard Koperasi"
        subtitle="Kapasitas pasok dan progres kontrak hari ini"
      />

      <div className="dashboard-metric-grid">
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
          description={`${contracts.length} kontrak dalam pemenuhan`}
          icon={LayoutDashboard}
        />
        <MetricCard
          title="Notifikasi Kontrak"
          value={notifications.length}
          description="Perlu ditinjau pengurus"
          icon={AlertTriangle}
          isAlert={notifications.length > 0}
        />
      </div>

      <div className="dashboard-sections-container">
        {/* Commodity Stock summary panel */}
        <section className="dashboard-panel">
          <div className="panel-title-container">
            <span className="panel-eyebrow">Ringkasan Stok</span>
            <h2 className="panel-title">Komoditas dan kualitas terkini</h2>
          </div>
          <CommodityStockList stocks={stockSummaries} />
        </section>

        {/* Action required / Notification panel */}
        <section className="dashboard-panel">
          <div className="panel-title-container">
            <span className="panel-eyebrow">Notifikasi Kontrak</span>
            <h2 className="panel-title">Peluang buyer masuk</h2>
          </div>
          <ActionRequiredList notifications={notifications} />
        </section>
      </div>

      <section className="dashboard-panel" style={{ marginBottom: '20px' }}>
        <div className="panel-title-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="panel-eyebrow">Progres Kontrak</span>
            <h2 className="panel-title">Kontrak aktif dan pemenuhan volume</h2>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>
            {formatKg(activeFulfilled)} terkumpul
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '12px' }}>
          {contracts.map((contract) => (
            <ContractProgressCard
              key={contract.id}
              id={contract.id}
              buyer={contract.buyer}
              commodity={contract.commodity}
              fulfilledKg={contract.fulfilledKg}
              targetKg={contract.targetKg}
              minimumQuality={contract.minimumQuality}
              deadline={contract.deadline}
              status={contract.status}
            />
          ))}
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="panel-title-container">
          <span className="panel-eyebrow">Status Supply Pool</span>
          <h2 className="panel-title">Alokasi stok ke portofolio kontrak</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '12px' }}>
          {supplyPools.map((pool) => (
            <article className="pool-card" key={pool.contractId} style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', boxShadow: 'none' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700 }}>{pool.contractId}</span>
                <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-strong)', marginTop: '2px' }}>{pool.commodity}</strong>
              </div>
              <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 8px', margin: 0 }}>
                <div>
                  <dt style={{ fontSize: '11px', color: 'var(--muted)' }}>Teralokasi</dt>
                  <dd style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-strong)' }}>{formatKg(pool.allocatedKg)}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '11px', color: 'var(--muted)' }}>Kandidat</dt>
                  <dd style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-strong)' }}>{formatKg(pool.candidateKg)}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '11px', color: 'var(--muted)' }}>Anggota</dt>
                  <dd style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-strong)' }}>{pool.contributors}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '11px', color: 'var(--muted)' }}>Pool QS</dt>
                  <dd style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-strong)' }}>{pool.score}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
