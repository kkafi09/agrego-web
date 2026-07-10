import { useState, useMemo } from 'react'
import PageHeader from '../components/layout/page-header'
import MetricCard from '../components/dashboard/metric-card'
import DataTable from '../components/data-display/data-table'
import StatusBadge from '../components/data-display/status-badge'
import { Wheat, AlertTriangle, TrendingUp, LayoutDashboard } from 'lucide-react'
import {
  type DepositRecord,
  formatKg,
} from './shared'

export function DepositHistoryPage({ records }: { records: DepositRecord[] }) {
  const [selectedDepositId, setSelectedDepositId] = useState(records[0]?.id)
  const [searchTerm, setSearchTerm] = useState('')

  const totals = useMemo(
    () => ({
      totalWeight: records.reduce(
        (total, deposit) => total + deposit.weightKg,
        0,
      ),
      waitingQc: records.filter(
        (deposit) =>
          deposit.status === 'Menunggu QC' || deposit.status === 'Tercatat',
      ).length,
      ready: records.filter((deposit) => deposit.status === 'Lolos QC').length,
      allocated: records.filter((deposit) => deposit.status === 'Dialokasi')
        .length,
    }),
    [records],
  )

  const selectedDeposit =
    records.find((deposit) => deposit.id === selectedDepositId) ?? records[0]

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records
    const term = searchTerm.toLowerCase()
    return records.filter(
      (r) =>
        r.id.toLowerCase().includes(term) ||
        r.member.toLowerCase().includes(term) ||
        r.commodity.toLowerCase().includes(term) ||
        r.status.toLowerCase().includes(term)
    )
  }, [records, searchTerm])

  const columns = [
    {
      header: 'ID',
      render: (deposit: DepositRecord) => <span className="record-id">{deposit.id}</span>
    },
    {
      header: 'Anggota',
      render: (deposit: DepositRecord) => (
        <div>
          <strong style={{ color: 'var(--text-strong)' }}>{deposit.member}</strong>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
            Petugas: {deposit.collector}
          </div>
        </div>
      )
    },
    {
      header: 'Komoditas',
      render: (deposit: DepositRecord) => <span>{deposit.commodity}</span>
    },
    {
      header: 'Berat',
      render: (deposit: DepositRecord) => <span>{formatKg(deposit.weightKg)}</span>
    },
    {
      header: 'Tanggal',
      render: (deposit: DepositRecord) => <time style={{ fontSize: '12px' }}>{deposit.submittedAt}</time>
    },
    {
      header: 'Quality',
      render: (deposit: DepositRecord) => (
        <span>{deposit.qualityScore === null ? '-' : `QS ${deposit.qualityScore}`}</span>
      )
    },
    {
      header: 'Status',
      render: (deposit: DepositRecord) => <StatusBadge status={deposit.status} />
    }
  ]

  return (
    <>
      <PageHeader
        title="Riwayat Setoran Anggota"
        subtitle={`Total setoran tercatat: ${records.length} transaksi`}
      />

      <section className="dashboard-metric-grid" aria-label="Ringkasan riwayat setoran">
        <MetricCard
          title="Total Volume"
          value={formatKg(totals.totalWeight)}
          description="Dari semua komoditas"
          icon={Wheat}
        />
        <MetricCard
          title="Menunggu QC"
          value={totals.waitingQc}
          description="Perlu pemeriksaan kualitas"
          icon={AlertTriangle}
          isAlert={totals.waitingQc > 0}
        />
        <MetricCard
          title="Lolos QC"
          value={totals.ready}
          description="Siap masuk supply pool"
          icon={TrendingUp}
        />
        <MetricCard
          title="Sudah Dialokasi"
          value={totals.allocated}
          description="Menjadi aset kontrak"
          icon={LayoutDashboard}
        />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '20px', alignItems: 'start' }} className="deposit-workspace">
        <div className="dashboard-panel">
          <div className="panel-title-container">
            <span className="panel-eyebrow">Daftar Panen</span>
            <h2 className="panel-title">Daftar panen yang diterima koperasi</h2>
          </div>
          
          <DataTable
            data={filteredRecords}
            columns={columns}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => setSelectedDepositId(item.id)}
            selectedRowKey={selectedDeposit?.id}
            searchPlaceholder="Cari ID, anggota, komoditas..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {selectedDeposit && (
          <aside className="dashboard-panel" aria-label="Detail setoran">
            <div className="panel-title-container">
              <span className="panel-eyebrow">Detail Setoran</span>
              <h2 className="panel-title">{selectedDeposit.id}</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Anggota</span>
                <strong style={{ fontSize: '15px', color: 'var(--text-strong)', display: 'block', marginTop: '2px' }}>{selectedDeposit.member}</strong>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                  {selectedDeposit.phone} / {selectedDeposit.origin}
                </span>
              </div>
              
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Komoditas</span>
                <strong style={{ fontSize: '15px', color: 'var(--text-strong)', display: 'block', marginTop: '2px' }}>{selectedDeposit.commodity}</strong>
                <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>{formatKg(selectedDeposit.weightKg)} diterima</span>
              </div>
              
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Status Operasional</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <StatusBadge status={selectedDeposit.status} />
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {selectedDeposit.qualityScore === null
                      ? 'Quality belum tersedia'
                      : `QS ${selectedDeposit.qualityScore}`}
                  </span>
                </div>
              </div>
              
              <div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Catatan</span>
                <p style={{ fontSize: '13px', color: 'var(--text)', marginTop: '4px', lineHeight: 1.5 }}>{selectedDeposit.notes}</p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </>
  )
}
