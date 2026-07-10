import {
  contracts,
  supplyPools,
  progressPercent,
  formatKg,
} from './shared'

export function AllocationStatusPage() {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Alokasi Stok</p>
          <h1>Status alokasi per kontrak</h1>
        </div>
        <div className="operator-panel" aria-label="Jumlah supply pool aktif">
          <span>Supply pool aktif</span>
          <strong>{supplyPools.length} kontrak</strong>
        </div>
      </header>

      <section className="panel contracts-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Status Alokasi</p>
            <h2>Progres pool dan kandidat tambahan</h2>
          </div>
          <span>Data tiruan</span>
        </div>
        <div className="allocation-status-list">
          {contracts.map((contract) => {
            const pool = supplyPools.find(
              (item) => item.contractId === contract.id,
            )
            const percent = progressPercent(
              contract.fulfilledKg,
              contract.targetKg,
            )

            return (
              <article className="allocation-status-card" key={contract.id}>
                <div>
                  <span className={`status-pill ${contract.status.toLowerCase()}`}>
                    {contract.status}
                  </span>
                  <strong>{contract.id}</strong>
                  <p>{contract.buyer}</p>
                </div>
                <div className="contract-progress">
                  <div className="progress-meta">
                    <span>{contract.commodity}</span>
                    <strong>{percent}%</strong>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <small>
                    {formatKg(contract.fulfilledKg)} dari{' '}
                    {formatKg(contract.targetKg)}
                  </small>
                </div>
                <dl>
                  <div>
                    <dt>Kandidat</dt>
                    <dd>{formatKg(pool?.candidateKg ?? 0)}</dd>
                  </div>
                  <div>
                    <dt>Anggota</dt>
                    <dd>{pool?.contributors ?? 0}</dd>
                  </div>
                  <div>
                    <dt>Pool QS</dt>
                    <dd>{pool?.score ?? '-'}</dd>
                  </div>
                </dl>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
