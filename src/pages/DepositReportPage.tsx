import { useState } from 'react'
import {
  type DepositRecord,
  commodityOptions,
  formatKg,
  downloadCsv,
} from './shared'

export function DepositReportPage({ records }: { records: DepositRecord[] }) {
  const [commodityFilter, setCommodityFilter] = useState('Semua')
  const filteredRecords = records.filter((record) =>
    commodityFilter === 'Semua' ? true : record.commodity === commodityFilter,
  )
  const totalWeight = filteredRecords.reduce(
    (total, record) => total + record.weightKg,
    0,
  )
  const memberCount = new Set(filteredRecords.map((record) => record.member)).size

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Laporan</p>
          <h1>Laporan setoran anggota</h1>
        </div>
        <div className="operator-panel" aria-label="Total volume laporan">
          <span>Total volume</span>
          <strong>{formatKg(totalWeight)}</strong>
        </div>
      </header>

      <section className="overview-grid">
        <article className="metric-card">
          <span>Setoran</span>
          <strong>{filteredRecords.length}</strong>
          <small>Transaksi dalam filter</small>
        </article>
        <article className="metric-card">
          <span>Anggota</span>
          <strong>{memberCount}</strong>
          <small>Penyetor unik</small>
        </article>
        <article className="metric-card">
          <span>Volume</span>
          <strong>{formatKg(totalWeight)}</strong>
          <small>Akumulasi setoran</small>
        </article>
        <article className="metric-card">
          <span>Komoditas</span>
          <strong>{commodityFilter}</strong>
          <small>Filter aktif</small>
        </article>
      </section>

      <section className="panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Filter Laporan</p>
            <h2>Ringkasan setoran per periode</h2>
          </div>
          <button
            className="primary-action"
            type="button"
            onClick={() =>
              downloadCsv('laporan-setoran.csv', [
                ['ID', 'Anggota', 'Komoditas', 'Berat', 'Tanggal', 'Quality', 'Status'],
                ...filteredRecords.map((record) => [
                  record.id,
                  record.member,
                  record.commodity,
                  String(record.weightKg),
                  record.submittedAt,
                  String(record.qualityScore ?? ''),
                  record.status,
                ]),
              ])
            }
          >
            Unduh CSV
          </button>
        </div>
        <div className="filter-row">
          <label>
            <span>Komoditas</span>
            <select
              value={commodityFilter}
              onChange={(event) => setCommodityFilter(event.target.value)}
            >
              <option>Semua</option>
              {commodityOptions.map((commodity) => (
                <option key={commodity}>{commodity}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="deposit-table">
          <div className="deposit-table-head">
            <span>ID</span>
            <span>Anggota</span>
            <span>Komoditas</span>
            <span>Berat</span>
            <span>Tanggal</span>
            <span>Quality</span>
            <span>Status</span>
          </div>
          {filteredRecords.map((record) => (
            <article className="deposit-row" key={record.id}>
              <span className="record-id">{record.id}</span>
              <strong>{record.member}</strong>
              <span>{record.commodity}</span>
              <span>{formatKg(record.weightKg)}</span>
              <span>{record.submittedAt}</span>
              <span>{record.qualityScore ?? '-'}</span>
              <span>{record.status}</span>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
