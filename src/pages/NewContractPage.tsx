import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import toast from 'react-hot-toast'
import { api } from '../../convex/_generated/api'
import type { Page } from '../config/navigation'
import { rolePermissions } from '../config/role-navigation'
import type { AuthUser } from '../lib/auth'
import { getAuthToken } from '../lib/auth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import {
  type ContractFormErrors,
  type ContractFormState,
  validateContractForm,
} from './shared'

export function NewContractPage({ goToPage, user }: { goToPage: (page: Page) => void; user: AuthUser | null }) {
  const commodities = useQuery(api.masterData.searchCommodities, { searchTerm: '' })
  const createContract = useMutation(api.contracts.createContract)
  const [form, setForm] = useState<ContractFormState>({
    commodityId: '',
    targetKg: '',
    minimumQuality: '',
    pricePerKg: '',
    deadline: '',
    title: '',
    notes: '',
  })
  const [errors, setErrors] = useState<ContractFormErrors>({})
  const [, setSaved] = useState(false)
  const canSubmit = Boolean(commodities?.length)
  const canManageCommodities = user ? rolePermissions[user.role].includes('commodities') : false

  if (user?.role !== 'Buyer') {
    return <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-rose-700">Hanya Buyer yang dapat membuat kontrak.</p>
  }

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
            if (Object.keys(nextErrors).length > 0) {
              setSaved(false)
              return
            }

            try {
              await createContract({
                token: getAuthToken(),
                commodityId: form.commodityId as any,
                contractNumber: `AGR-${Date.now()}`,
                title: form.title.trim() || undefined,
                targetVolumeKg: Number(form.targetKg),
                minimumQualityGrade: form.minimumQuality as 'A' | 'B' | 'C' | 'D',
                pricePerKg: Number(form.pricePerKg),
                deadlineAt: new Date(form.deadline).getTime(),
                notes: form.notes.trim() || undefined,
              })
              toast.success('Kontrak berhasil dibuat.')
              goToPage('contracts')
            } catch (err) {
              toast.error((err as Error).message || 'Gagal membuat kontrak.')
            }
              setForm({
              commodityId: '',
              targetKg: '',
              minimumQuality: '',
              pricePerKg: '',
              deadline: '',
              title: '',
              notes: '',
            })
              setSaved(false)
          }}
        >
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Kontrak Baru</p>
            <h2>Spesifikasi pembelian</h2>
          </div>
          {!canSubmit ? <p className="text-sm font-bold text-emerald-700">Tambahkan komoditas sebelum membuat kontrak.</p> : null}
          <label className="grid gap-2">
            <Label>Komoditas</Label>
            <Select value={form.commodityId} onValueChange={(value) => updateField('commodityId', value)} disabled={!commodities?.length}>
              <SelectTrigger className="w-full" aria-invalid={Boolean(errors.commodityId)}>
                <SelectValue placeholder={commodities?.length ? 'Pilih komoditas' : 'Belum ada komoditas'} />
              </SelectTrigger>
              <SelectContent position="popper">
                {commodities?.map((commodity) => (
                  <SelectItem key={commodity._id} value={commodity._id}>{commodity.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!commodities?.length ? (
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                <span>Tambahkan komoditas terlebih dahulu.</span>
                {canManageCommodities ? <Button type="button" variant="link" className="h-auto px-0 py-0 text-xs font-black text-emerald-700" onClick={() => goToPage('commodities')}>Tambah komoditas</Button> : null}
              </div>
            ) : null}
            {errors.commodityId ? <small className="text-xs font-semibold text-rose-600">{errors.commodityId}</small> : null}
          </label>
          <label className="grid gap-2">
            <Label>Judul Kontrak</Label>
            <Input className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800" value={form.title} onChange={(event) => updateField('title', event.target.value)} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2-slate-200">
            <label>
              <span>Target Volume (kg)</span>
              <Input className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800" aria-invalid={Boolean(errors.targetKg)} min="1" type="number" value={form.targetKg} onChange={(event) => updateField('targetKg', event.target.value)} />
              {errors.targetKg ? <small className="text-xs font-semibold text-rose-600">{errors.targetKg}</small> : null}
            </label>
            <label>
              <span>Minimum Grade</span>
              <Select value={form.minimumQuality} onValueChange={(value) => updateField('minimumQuality', value)}>
                <SelectTrigger className="w-full" aria-invalid={Boolean(errors.minimumQuality)}><SelectValue placeholder="Pilih grade minimum" /></SelectTrigger>
                <SelectContent position="popper">
                  {(['A', 'B', 'C', 'D'] as const).map((grade) => <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.minimumQuality ? <small className="text-xs font-semibold text-rose-600">{errors.minimumQuality}</small> : null}
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2-slate-200">
            <label>
              <span>Harga per Kg</span>
              <Input className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800" aria-invalid={Boolean(errors.pricePerKg)} min="1" type="number" value={form.pricePerKg} onChange={(event) => updateField('pricePerKg', event.target.value)} />
              {errors.pricePerKg ? <small className="text-xs font-semibold text-rose-600">{errors.pricePerKg}</small> : null}
            </label>
            <label>
              <span>Tenggat</span>
              <Input className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800" aria-invalid={Boolean(errors.deadline)} type="date" value={form.deadline} onChange={(event) => updateField('deadline', event.target.value)} />
              {errors.deadline ? <small className="text-xs font-semibold text-rose-600">{errors.deadline}</small> : null}
            </label>
          </div>
          <label>
            <span>Catatan</span>
            <Textarea className="min-h-28 rounded-lg bg-white text-sm font-semibold text-slate-800" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
          </label>
          <Button className="h-11 rounded-lg bg-emerald-700 text-sm font-black text-white shadow-sm hover:bg-emerald-800" disabled={!canSubmit} type="submit">
            Simpan Kontrak
          </Button>
        </form>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Preview</p>
            <h2>{commodities?.find((commodity) => commodity._id === form.commodityId)?.name || '-'}</h2>
          </div>
          <dl>
            <div><dt>Jangkauan</dt><dd>Supply pool lintas-koperasi</dd></div>
            <div><dt>Target</dt><dd>{form.targetKg || '0'} kg</dd></div>
            <div><dt>Minimum Grade</dt><dd>{form.minimumQuality || '-'}</dd></div>
          </dl>
        </aside>
      </section>
    </>
  )
}
