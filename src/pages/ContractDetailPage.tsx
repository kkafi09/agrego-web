import { useState } from 'react'
import {
  type ContractProgress,
  contracts,
  allocationCandidates,
  profitShares,
  progressPercent,
  formatKg,
} from './shared'

export function ContractDetailPage() {
  const contract = contracts[0]
  const [contractStatus, setContractStatus] =
    useState<ContractProgress['status']>(contract.status)
  const percent = progressPercent(contract.fulfilledKg, contract.targetKg)
  const allocations = allocationCandidates.filter(
    (candidate) => candidate.commodity === contract.commodity,
  )
  const contractShares = profitShares.filter(
    (share) => share.contractId === contract.id,
  )

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Manajemen Kontrak</p>
          <h1>{contract.id}</h1>
        </div>
        <div className="operator-panel" aria-label="Status kontrak">
          <span>Status</span>
          <strong>{contractStatus}</strong>
        </div>
      </header>

      <section className="panel contracts-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Detail Kontrak</p>
            <h2>{contract.buyer}</h2>
          </div>
          <span>{contract.deadline}</span>
        </div>
        <div className="contract-detail-grid">
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
          </dl>
          <div className="contract-progress">
            <div className="progress-meta">
              <span>{formatKg(contract.fulfilledKg)} terpenuhi</span>
              <strong>{percent}%</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="panel status-update-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Ubah Status</p>
            <h2>Status operasional kontrak</h2>
          </div>
          <span>Mock update</span>
        </div>
        <div className="filter-row">
          <label>
            <span>Status Kontrak</span>
            <select
              value={contractStatus}
              onChange={(event) =>
                setContractStatus(event.target.value as ContractProgress['status'])
              }
            >
              <option>Baru</option>
              <option>Aktif</option>
              <option>Prioritas</option>
              <option>Selesai</option>
              <option>Batal</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Tabel Alokasi</p>
            <h2>Setoran dalam supply pool</h2>
          </div>
          <span>{allocations.length} setoran</span>
        </div>
        <div className="qc-table">
          <div className="qc-table-head">
            <span>Setoran</span>
            <span>Anggota</span>
            <span>Komoditas</span>
            <span>Berat</span>
            <span>QS</span>
            <span>Status</span>
          </div>
          {allocations.map((allocation) => (
            <article className="qc-row" key={allocation.depositId}>
              <span className="record-id">{allocation.depositId}</span>
              <span>{allocation.member}</span>
              <span>{allocation.commodity}</span>
              <span>{formatKg(allocation.availableKg)}</span>
              <strong>{allocation.qualityScore}</strong>
              <span className="status-pill">{allocation.recommendation}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel status-update-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Rincian Bagi Hasil</p>
            <h2>Distribusi setelah kontrak selesai</h2>
          </div>
          <span>Data tiruan</span>
        </div>
        <div className="candidate-list">
          {contractShares.map((share) => (
            <article className="candidate-card" key={share.member}>
              <div>
                <strong>{share.member}</strong>
                <span>{share.calculatedAt}</span>
              </div>
              <div>
                <span>{formatKg(share.contributedKg)}</span>
                <b>Rp{share.amount.toLocaleString('id-ID')}</b>
              </div>
              <span className="status-pill">QS {share.qualityScore}</span>
              <small>{share.commodity}</small>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
