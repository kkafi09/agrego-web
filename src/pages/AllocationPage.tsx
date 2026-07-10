import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { cn } from '../lib/utils'
import { formatDate, formatKg, progressPercent } from './shared'

export function AllocationPage() {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const koperasiId = defaultKoperasi?._id
  const contracts = useQuery(api.allocations.contractsNeedingAllocation, koperasiId ? { koperasiId } : 'skip')
  const contractRows = useMemo(() => contracts ?? [], [contracts])
  const [selectedContractId, setSelectedContractId] = useState<string>('')
  const candidates = useQuery(
    api.allocations.availableDepositsForContract,
    selectedContractId ? { contractId: selectedContractId as any } : 'skip',
  )
  const allocateDeposit = useMutation(api.allocations.allocateDepositToContract)
  const recalculateContractProgress = useMutation(api.allocations.recalculateContractProgress)
  const [selectedDepositIds, setSelectedDepositIds] = useState<string[]>([])
  const [allocationSaved, setAllocationSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!selectedContractId && contractRows[0]) {
      setSelectedContractId(contractRows[0].contractId)
    }
  }, [contractRows, selectedContractId])

  const selectedContract = contractRows.find((contract) => contract.contractId === selectedContractId)
  const matchingCandidates = useMemo(() => candidates ?? [], [candidates])
  const recommendedKg = matchingCandidates.reduce((total, candidate) => total + candidate.availableWeightKg, 0)
  const selectedKg = matchingCandidates
    .filter((candidate) => selectedDepositIds.includes(candidate.depositId))
    .reduce((total, candidate) => total + candidate.availableWeightKg, 0)
  const remainingKg = selectedContract?.remainingKg ?? 0
  const smartRecommendation = useMemo(() => {
    let total = 0
    const selected = []
    for (const candidate of matchingCandidates) {
      if (total >= remainingKg) break
      selected.push(candidate)
      total += candidate.availableWeightKg
    }
    return selected
  }, [matchingCandidates, remainingKg])
  const smartRecommendationKg = smartRecommendation.reduce((total, candidate) => total + candidate.availableWeightKg, 0)

  function toggleDeposit(depositId: string) {
    setAllocationSaved(false)
    setSelectedDepositIds((current) =>
      current.includes(depositId) ? current.filter((id) => id !== depositId) : [...current, depositId],
    )
  }

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Alokasi Stok</p>
          <h1>Susun supply pool kontrak</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950" aria-label="Kontrak alokasi aktif">
          <span>Kontrak dipilih</span>
          <strong>{selectedContract?.contractNumber ?? '-'}</strong>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2-slate-200-slate-200 xl:grid-cols-4" aria-label="Ringkasan alokasi">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500"><span>Target Kontrak</span><strong>{formatKg(selectedContract?.targetVolumeKg ?? 0)}</strong><small>{selectedContract?.commodityName ?? '-'}</small></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500"><span>Sudah Terpenuhi</span><strong>{progressPercent(selectedContract?.allocatedWeightKg ?? 0, selectedContract?.targetVolumeKg ?? 0)}%</strong><small>{formatKg(selectedContract?.allocatedWeightKg ?? 0)} terkumpul</small></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500"><span>Sisa Kebutuhan</span><strong>{formatKg(remainingKg)}</strong><small>Minimum QS {selectedContract?.minimumQualityScore ?? '-'}</small></article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500"><span>Rekomendasi Tersedia</span><strong>{formatKg(recommendedKg)}</strong><small>Dari setoran lolos QC</small></article>
        <article className="rounded-xl border border-orange-200 bg-orange-50 p-5 shadow-sm [&>span]:text-sm [&>span]:font-bold [&>span]:text-orange-700 [&>strong]:mt-3 [&>strong]:block [&>strong]:text-2xl [&>strong]:font-black [&>strong]:text-slate-950 [&>small]:mt-2 [&>small]:block [&>small]:text-sm [&>small]:font-semibold [&>small]:text-slate-500"><span>Dipilih untuk Alokasi</span><strong>{formatKg(selectedKg)}</strong><small>{selectedDepositIds.length} setoran dipilih</small></article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Pilih Kontrak</p>
            <h2>Kontrak buyer aktif</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {contracts === undefined && koperasiId ? (
              <p className="text-sm font-bold text-emerald-700">Memuat kontrak...</p>
            ) : contractRows.length === 0 ? (
              <p className="text-sm font-bold text-emerald-700">Belum ada kontrak aktif yang membutuhkan alokasi.</p>
            ) : contractRows.map((contract) => (
              <button
                aria-pressed={selectedContractId === contract.contractId}
                className={cn('grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 rounded-xl border p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50', selectedContractId === contract.contractId ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white')}
                key={contract.contractId}
                type="button"
                onClick={() => {
                  setSelectedContractId(contract.contractId)
                  setSelectedDepositIds([])
                  setAllocationSaved(false)
                }}
              >
                <strong>{contract.contractNumber}</strong>
                <span>{contract.commodityName}</span>
                <small>{formatKg(contract.targetVolumeKg)} / Tenggat {formatDate(contract.deadlineAt)}</small>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Pilih Setoran</p>
            <h2>Kandidat lolos QC</h2>
          </div>
          <div className="grid gap-3">
            {candidates === undefined && selectedContractId ? (
              <p className="text-sm font-bold text-emerald-700">Memuat kandidat setoran...</p>
            ) : matchingCandidates.length === 0 ? (
              <p className="text-sm font-bold text-emerald-700">Belum ada setoran lolos QC yang cocok dengan kontrak ini.</p>
            ) : matchingCandidates.map((candidate) => (
              <button
                aria-pressed={selectedDepositIds.includes(candidate.depositId)}
                className={cn('grid gap-3 rounded-xl border p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50 sm:grid-cols-[1fr_1fr_auto] sm:items-center', selectedDepositIds.includes(candidate.depositId) ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white')}
                key={candidate.depositId}
                type="button"
                onClick={() => toggleDeposit(candidate.depositId)}
              >
                <div><strong>{candidate.depositNumber}</strong><span>{candidate.memberName}</span></div>
                <div><span>{formatDate(candidate.submittedAt)}</span><b>{formatKg(candidate.availableWeightKg)}</b></div>
                <small>QS {candidate.qualityScore ?? '-'}</small>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Alokasi Cerdas</p>
            <h2>Rekomendasi untuk kontrak aktif</h2>
          </div>
          <button className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={smartRecommendation.length === 0} type="button" onClick={() => { setSelectedDepositIds(smartRecommendation.map((candidate) => candidate.depositId)); setAllocationSaved(false) }}>
            Pilih Rekomendasi
          </button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div><span>Volume direkomendasikan</span><strong>{formatKg(smartRecommendationKg)}</strong></div>
          <div><span>Rata-rata QS</span><strong>{smartRecommendation.length > 0 ? Math.round(smartRecommendation.reduce((total, candidate) => total + (candidate.qualityScore ?? 0), 0) / smartRecommendation.length) : 0}</strong></div>
          <div><span>Setoran prioritas</span><strong>{smartRecommendation.length}</strong></div>
        </div>
        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><span>Payload API</span><strong>{selectedContract?.contractNumber ?? '-'} / {selectedDepositIds.length} setoran / {formatKg(selectedKg)}</strong></div>
          <button
            className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!selectedContractId || selectedDepositIds.length === 0 || isSaving}
            type="button"
            onClick={async () => {
              setIsSaving(true)
              for (const depositId of selectedDepositIds) {
                const candidate = matchingCandidates.find((item) => item.depositId === depositId)
                if (candidate) {
                  await allocateDeposit({ contractId: selectedContractId as any, depositId: depositId as any, allocatedWeightKg: candidate.availableWeightKg })
                }
              }
              await recalculateContractProgress({ contractId: selectedContractId as any })
              setSelectedDepositIds([])
              setAllocationSaved(true)
              setIsSaving(false)
            }}
          >
            Simpan Alokasi
          </button>
        </div>
        {allocationSaved ? <p className="text-sm font-bold text-emerald-700">Alokasi tersimpan ke Convex.</p> : null}
      </section>
    </>
  )
}
