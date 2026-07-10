import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  type ContractFormErrors,
  type ContractFormState,
  validateContractForm,
} from './shared'

export function NewContractPage() {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const koperasiId = defaultKoperasi?._id
  const buyers = useQuery(api.auth.listBuyers, { searchTerm: '' })
  const commodities = useQuery(api.masterData.searchCommodities, { searchTerm: '' })
  const createContract = useMutation(api.contracts.createContract)
  const [form, setForm] = useState<ContractFormState>({
    buyerId: '',
    commodityId: '',
    targetKg: '',
    minimumQuality: '',
    pricePerKg: '',
    deadline: '',
    title: '',
    notes: '',
  })
  const [errors, setErrors] = useState<ContractFormErrors>({})
  const [saved, setSaved] = useState(false)
  const canSubmit = Boolean(koperasiId && buyers?.length && commodities?.length)

  function updateField(field: keyof ContractFormState, value: string) {
    setSaved(false)
    setErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Manajemen Kontrak</p>
          <h1>Buat kontrak buyer</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950" aria-label="Preview nilai kontrak">
          <span>Nilai estimasi</span>
          <strong>Rp{(Number(form.targetKg) * Number(form.pricePerKg || 0)).toLocaleString('id-ID')}</strong>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
        <form
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={async (event) => {
            event.preventDefault()
            const nextErrors = validateContractForm(form)
            setErrors(nextErrors)
            if (Object.keys(nextErrors).length > 0 || !koperasiId) {
              setSaved(false)
              return
            }

            await createContract({
              buyerId: form.buyerId as any,
              koperasiId,
              commodityId: form.commodityId as any,
              contractNumber: `AGR-${Date.now()}`,
              title: form.title.trim() || undefined,
              targetVolumeKg: Number(form.targetKg),
              minimumQualityScore: Number(form.minimumQuality),
              pricePerKg: Number(form.pricePerKg),
              deadlineAt: new Date(form.deadline).getTime(),
              notes: form.notes.trim() || undefined,
            })
            setSaved(true)
            setForm({
              buyerId: '',
              commodityId: '',
              targetKg: '',
              minimumQuality: '',
              pricePerKg: '',
              deadline: '',
              title: '',
              notes: '',
            })
          }}
        >
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Kontrak Baru</p>
            <h2>Spesifikasi pembelian</h2>
          </div>
          {!canSubmit ? <p className="text-sm font-bold text-emerald-700">Tambahkan profil koperasi, buyer, dan komoditas sebelum membuat kontrak.</p> : null}
          <label>
            <span>Buyer</span>
            <select aria-invalid={Boolean(errors.buyerId)} value={form.buyerId} onChange={(event) => updateField('buyerId', event.target.value)}>
              <option value="">Pilih buyer</option>
              {buyers?.map((buyer) => (
                <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
              ))}
            </select>
            {errors.buyerId ? <small className="text-xs font-semibold text-rose-600">{errors.buyerId}</small> : null}
          </label>
          <label>
            <span>Komoditas</span>
            <select aria-invalid={Boolean(errors.commodityId)} value={form.commodityId} onChange={(event) => updateField('commodityId', event.target.value)}>
              <option value="">Pilih komoditas</option>
              {commodities?.map((commodity) => (
                <option key={commodity._id} value={commodity._id}>{commodity.name}</option>
              ))}
            </select>
            {errors.commodityId ? <small className="text-xs font-semibold text-rose-600">{errors.commodityId}</small> : null}
          </label>
          <label>
            <span>Judul Kontrak</span>
            <input value={form.title} onChange={(event) => updateField('title', event.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100">
            <label>
              <span>Target Volume (kg)</span>
              <input aria-invalid={Boolean(errors.targetKg)} min="1" type="number" value={form.targetKg} onChange={(event) => updateField('targetKg', event.target.value)} />
              {errors.targetKg ? <small className="text-xs font-semibold text-rose-600">{errors.targetKg}</small> : null}
            </label>
            <label>
              <span>Quality Minimum</span>
              <input aria-invalid={Boolean(errors.minimumQuality)} max="100" min="0" type="number" value={form.minimumQuality} onChange={(event) => updateField('minimumQuality', event.target.value)} />
              {errors.minimumQuality ? <small className="text-xs font-semibold text-rose-600">{errors.minimumQuality}</small> : null}
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100">
            <label>
              <span>Harga per Kg</span>
              <input aria-invalid={Boolean(errors.pricePerKg)} min="1" type="number" value={form.pricePerKg} onChange={(event) => updateField('pricePerKg', event.target.value)} />
              {errors.pricePerKg ? <small className="text-xs font-semibold text-rose-600">{errors.pricePerKg}</small> : null}
            </label>
            <label>
              <span>Tenggat</span>
              <input aria-invalid={Boolean(errors.deadline)} type="date" value={form.deadline} onChange={(event) => updateField('deadline', event.target.value)} />
              {errors.deadline ? <small className="text-xs font-semibold text-rose-600">{errors.deadline}</small> : null}
            </label>
          </div>
          <label>
            <span>Catatan</span>
            <textarea value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
          </label>
          <button className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!canSubmit} type="submit">
            Simpan Kontrak
          </button>
        </form>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Preview</p>
            <h2>{commodities?.find((commodity) => commodity._id === form.commodityId)?.name || '-'}</h2>
          </div>
          <dl>
            <div><dt>Buyer</dt><dd>{buyers?.find((buyer) => buyer.id === form.buyerId)?.name || '-'}</dd></div>
            <div><dt>Target</dt><dd>{form.targetKg || '0'} kg</dd></div>
            <div><dt>Minimum QS</dt><dd>{form.minimumQuality || '-'}</dd></div>
          </dl>
          {saved ? <p className="text-sm font-bold text-emerald-700">Kontrak tersimpan.</p> : null}
        </aside>
      </section>
    </>
  )
}
