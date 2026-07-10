import { useState } from 'react'
import type { Page } from '../config/navigation'
import {
  contracts,
  commodityOptions,
  progressPercent,
  formatKg,
} from './shared'

export function ContractsPage({ goToPage }: { goToPage: (page: Page) => void }) {
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [commodityFilter, setCommodityFilter] = useState('Semua')
  const totalContractValue = contracts.reduce(
    (total, contract) => total + contract.targetKg * 32000,
    0,
  )
  const filteredContracts = contracts.filter((contract) => {
    const statusMatches =
      statusFilter === 'Semua' || contract.status === statusFilter
    const commodityMatches =
      commodityFilter === 'Semua' || contract.commodity === commodityFilter
    return statusMatches && commodityMatches
  })

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Manajemen Kontrak</p>
          <h1>Daftar kontrak buyer</h1>
        </div>
        <div className="operator-panel" aria-label="Nilai kontrak aktif">
          <span>Nilai estimasi</span>
          <strong>Rp{totalContractValue.toLocaleString('id-ID')}</strong>
        </div>
      </header>

      <section className="panel contracts-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Kontrak</p>
            <h2>Permintaan industri dan status pemenuhan</h2>
          </div>
          <button
            className="primary-action"
            type="button"
            onClick={() => goToPage('newContract')}
          >
            Buat Kontrak
          </button>
        </div>
        <div className="filter-row" aria-label="Filter daftar kontrak">
          <label>
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>Semua</option>
              <option>Baru</option>
              <option>Aktif</option>
              <option>Prioritas</option>
            </select>
          </label>
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
        <div className="contract-management-list">
          {filteredContracts.map((contract) => {
            const percent = progressPercent(
              contract.fulfilledKg,
              contract.targetKg,
            )

            return (
              <article className="managed-contract-card" key={contract.id}>
                <div>
                  <span className={`status-pill ${contract.status.toLowerCase()}`}>
                    {contract.status}
                  </span>
                  <strong>{contract.id}</strong>
                  <p>{contract.buyer}</p>
                </div>
                <dl>
                  <div>
                    <dt>Komoditas</dt>
                    <dd>{contract.commodity}</dd>
                  </div>
                  <div>
                    <dt>Target</dt>
                    <dd>{formatKg(contract.targetKg)}</dd>
                  </div>
                  <div>
                    <dt>Minimum QS</dt>
                    <dd>{contract.minimumQuality}</dd>
                  </div>
                  <div>
                    <dt>Tenggat</dt>
                    <dd>{contract.deadline}</dd>
                  </div>
                </dl>
                <div className="contract-progress">
                  <div className="progress-meta">
                    <span>Progress pemenuhan</span>
                    <strong>{percent}%</strong>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <button
                    className="text-action"
                    type="button"
                    onClick={() => goToPage('contractDetail')}
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
