import { useState } from 'react'
import {
  type AllocationCandidate,
  contracts,
  allocationCandidates,
  formatKg,
  progressPercent,
} from './shared'

export function AllocationPage() {
  const [selectedContractId, setSelectedContractId] = useState(contracts[0].id)
  const [selectedDepositIds, setSelectedDepositIds] = useState<string[]>([])
  const [allocationSaved, setAllocationSaved] = useState(false)
  const selectedContract =
    contracts.find((contract) => contract.id === selectedContractId) ??
    contracts[0]
  const matchingCandidates = allocationCandidates.filter(
    (candidate) => candidate.commodity === selectedContract.commodity,
  )
  const recommendedKg = allocationCandidates
    .filter((candidate) => candidate.commodity === selectedContract.commodity)
    .reduce((total, candidate) => total + candidate.availableKg, 0)
  const selectedKg = allocationCandidates
    .filter((candidate) => selectedDepositIds.includes(candidate.depositId))
    .reduce((total, candidate) => total + candidate.availableKg, 0)
  const remainingKg = selectedContract.targetKg - selectedContract.fulfilledKg
  const smartRecommendation = matchingCandidates
    .toSorted((a, b) => b.qualityScore - a.qualityScore)
    .reduce<AllocationCandidate[]>((selected, candidate) => {
      const total = selected.reduce((sum, item) => sum + item.availableKg, 0)
      return total >= remainingKg ? selected : [...selected, candidate]
    }, [])
  const smartRecommendationKg = smartRecommendation.reduce(
    (total, candidate) => total + candidate.availableKg,
    0,
  )

  function toggleDeposit(depositId: string) {
    setAllocationSaved(false)
    setSelectedDepositIds((current) =>
      current.includes(depositId)
        ? current.filter((id) => id !== depositId)
        : [...current, depositId],
    )
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Alokasi Stok</p>
          <h1>Susun supply pool kontrak</h1>
        </div>
        <div className="operator-panel" aria-label="Kontrak alokasi aktif">
          <span>Kontrak dipilih</span>
          <strong>{selectedContract.id}</strong>
        </div>
      </header>

      <section className="overview-grid" aria-label="Ringkasan alokasi">
        <article className="metric-card">
          <span>Target Kontrak</span>
          <strong>{formatKg(selectedContract.targetKg)}</strong>
          <small>{selectedContract.buyer}</small>
        </article>
        <article className="metric-card">
          <span>Sudah Terpenuhi</span>
          <strong>{progressPercent(selectedContract.fulfilledKg, selectedContract.targetKg)}%</strong>
          <small>{formatKg(selectedContract.fulfilledKg)} terkumpul</small>
        </article>
        <article className="metric-card">
          <span>Sisa Kebutuhan</span>
          <strong>{formatKg(remainingKg)}</strong>
          <small>Minimum QS {selectedContract.minimumQuality}</small>
        </article>
        <article className="metric-card">
          <span>Rekomendasi Tersedia</span>
          <strong>{formatKg(recommendedKg)}</strong>
          <small>Dari setoran lolos QC</small>
        </article>
        <article className="metric-card alert">
          <span>Dipilih untuk Alokasi</span>
          <strong>{formatKg(selectedKg)}</strong>
          <small>{selectedDepositIds.length} setoran dipilih</small>
        </article>
      </section>

      <section className="allocation-grid">
        <article className="panel">
          <div className="section-heading">
            <p className="eyebrow">Pilih Kontrak</p>
            <h2>Kontrak buyer aktif</h2>
          </div>
          <div className="contract-list">
            {contracts.map((contract) => (
              <button
                aria-pressed={selectedContract.id === contract.id}
                className={`allocation-contract ${
                  selectedContract.id === contract.id ? 'selected' : ''
                }`}
                key={contract.id}
                type="button"
                onClick={() => {
                  setSelectedContractId(contract.id)
                  setSelectedDepositIds([])
                  setAllocationSaved(false)
                }}
              >
                <strong>{contract.id}</strong>
                <span>{contract.buyer}</span>
                <small>
                  {contract.commodity} / {formatKg(contract.targetKg)}
                </small>
              </button>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <p className="eyebrow">Pilih Setoran</p>
            <h2>Kandidat lolos QC</h2>
          </div>
          <div className="candidate-list">
            {matchingCandidates.map((candidate) => (
              <button
                aria-pressed={selectedDepositIds.includes(candidate.depositId)}
                className={`candidate-card ${
                  selectedDepositIds.includes(candidate.depositId)
                    ? 'selected'
                    : ''
                }`}
                key={candidate.depositId}
                type="button"
                onClick={() => toggleDeposit(candidate.depositId)}
              >
                <div>
                  <strong>{candidate.depositId}</strong>
                  <span>{candidate.member}</span>
                </div>
                <div>
                  <span>{candidate.commodity}</span>
                  <b>{formatKg(candidate.availableKg)}</b>
                </div>
                <span className="status-pill">{candidate.recommendation}</span>
                <small>QS {candidate.qualityScore}</small>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="panel smart-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Alokasi Cerdas</p>
            <h2>Rekomendasi tiruan untuk kontrak aktif</h2>
          </div>
          <button
            className="primary-action"
            type="button"
            onClick={() =>
              {
                setSelectedDepositIds(
                  smartRecommendation.map((candidate) => candidate.depositId),
                )
                setAllocationSaved(false)
              }
            }
          >
            Pilih Rekomendasi
          </button>
        </div>
        <div className="recommendation-strip">
          <div>
            <span>Volume direkomendasikan</span>
            <strong>{formatKg(smartRecommendationKg)}</strong>
          </div>
          <div>
            <span>Rata-rata QS</span>
            <strong>
              {smartRecommendation.length > 0
                ? Math.round(
                    smartRecommendation.reduce(
                      (total, candidate) => total + candidate.qualityScore,
                      0,
                    ) / smartRecommendation.length,
                  )
                : 0}
            </strong>
          </div>
          <div>
            <span>Setoran prioritas</span>
            <strong>{smartRecommendation.length}</strong>
          </div>
        </div>
        <div className="api-submit-row">
          <div>
            <span>Payload API</span>
            <strong>
              {selectedContract.id} / {selectedDepositIds.length} setoran /{' '}
              {formatKg(selectedKg)}
            </strong>
          </div>
          <button
            className="primary-action"
            disabled={selectedDepositIds.length === 0}
            type="button"
            onClick={() => setAllocationSaved(true)}
          >
            Simpan Alokasi
          </button>
        </div>
        {allocationSaved ? (
          <p className="success-note">
            Payload alokasi mock tersimpan dan siap diganti mutation Convex.
          </p>
        ) : null}
      </section>
    </>
  )
}
