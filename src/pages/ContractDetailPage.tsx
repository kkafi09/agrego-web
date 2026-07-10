import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  type ContractStatus,
  formatDate,
  formatKg,
  mapContractStatus,
  progressPercent,
} from './shared'

export function ContractDetailPage() {
  const [selectedContractId] = useState(() => sessionStorage.getItem('agrego_selected_contract_id'))
  const contract = useQuery(
    api.contracts.getContractDetail,
    selectedContractId ? { contractId: selectedContractId as any } : 'skip',
  )
  const shares = useQuery(
    api.reports.profitShareHistory,
    selectedContractId ? { contractId: selectedContractId as any } : 'skip',
  )
  const updateContractStatus = useMutation(api.contracts.updateContractStatus)
  const [savingStatus, setSavingStatus] = useState(false)

  if (!selectedContractId) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-emerald-700 shadow-sm">Pilih kontrak dari daftar kontrak untuk melihat detail.</p>
  }

  if (contract === undefined) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-emerald-700 shadow-sm">Memuat detail kontrak...</p>
  }

  if (!contract) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-emerald-700 shadow-sm">Kontrak tidak ditemukan.</p>
  }

  const statusLabel = mapContractStatus(contract.status as ContractStatus)
  const percent = progressPercent(contract.fulfilledVolumeKg, contract.targetVolumeKg)
  const contractShares = shares ?? []

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Manajemen Kontrak</p>
          <h1>{contract.contractNumber}</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950" aria-label="Status kontrak">
          <span>Status</span>
          <strong>{statusLabel}</strong>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Detail Kontrak</p>
            <h2>{contract.buyerName}</h2>
          </div>
          <span>{formatDate(contract.deadlineAt)}</span>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <dl className="grid gap-3 sm:grid-cols-3">
            <div><dt className="text-xs font-semibold text-slate-500">Komoditas</dt><dd className="mt-1 text-sm font-black text-slate-950">{contract.commodityName}</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">Target</dt><dd className="mt-1 text-sm font-black text-slate-950">{formatKg(contract.targetVolumeKg)}</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">Minimum QS</dt><dd className="mt-1 text-sm font-black text-slate-950">{contract.minimumQualityScore}</dd></div>
          </dl>
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span>{formatKg(contract.fulfilledVolumeKg)} terpenuhi</span>
              <strong>{percent}%</strong>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <span className="block h-full rounded-full bg-emerald-600" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Ubah Status</p>
            <h2>Status operasional kontrak</h2>
          </div>
          <span>Database terkoneksi</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100">
          <label>
            <span>Status Kontrak</span>
            <Select
              disabled={savingStatus}
              value={contract.status}
              onValueChange={async (value) => {
                setSavingStatus(true)
                await updateContractStatus({
                  contractId: contract.contractId,
                  status: value as ContractStatus,
                })
                setSavingStatus(false)
              }}
            >
              <SelectTrigger className="h-11 w-full rounded-lg bg-white text-sm font-semibold text-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Baru</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="cancelled">Batal</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Tabel Alokasi</p>
            <h2>Setoran dalam supply pool</h2>
          </div>
          <span>{contract.allocations.length} setoran</span>
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
          <div className="grid min-w-[760px] grid-cols-5 gap-3 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500">
            <span>Setoran</span>
            <span>Anggota</span>
            <span>Berat</span>
            <span>QS</span>
            <span>Tanggal</span>
          </div>
          {contract.allocations.length === 0 ? (
            <p className="p-4 text-sm font-bold text-emerald-700">Belum ada setoran dialokasikan.</p>
          ) : contract.allocations.map((allocation) => (
            <article className="grid min-w-[760px] grid-cols-5 gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-700" key={allocation.allocationId}>
              <span className="font-mono text-xs font-black text-emerald-700">{allocation.depositNumber ?? '-'}</span>
              <span>{allocation.memberName ?? '-'}</span>
              <span>{formatKg(allocation.allocatedWeightKg)}</span>
              <strong>{allocation.qualityScore}</strong>
              <span>{formatDate(allocation.allocatedAt)}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Rincian Bagi Hasil</p>
            <h2>Distribusi setelah kontrak selesai</h2>
          </div>
          <span>{contractShares.length} catatan</span>
        </div>
        <div className="grid gap-3">
          {contractShares.length === 0 ? (
            <p className="text-sm font-bold text-emerald-700">Belum ada hasil bagi untuk kontrak ini.</p>
          ) : contractShares.map((share) => (
            <article className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center" key={share.shareId}>
              <div><strong>{share.memberName}</strong><span>{formatDate(share.calculatedAt)}</span></div>
              <div><span>{formatKg(share.contributedWeightKg)}</span><b>Rp{share.amountEarned.toLocaleString('id-ID')}</b></div>
              <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">QS {share.qualityScore}</span>
              <small>{share.contractNumber ?? '-'}</small>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
