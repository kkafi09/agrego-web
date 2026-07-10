import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Page } from '../config/navigation'
import PageHeader from '../components/layout/page-header'
import NumberUnitInput from '../components/forms/number-unit-input'
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
  type DepositFormErrors,
  type DepositFormState,
  validateDepositForm,
} from './shared'

export function NewDepositPage({ goToPage }: { goToPage: (page: Page) => void }) {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const koperasiId = defaultKoperasi?._id
  const members = useQuery(api.masterData.searchMembers, koperasiId ? { koperasiId, searchTerm: '' } : 'skip')
  const commodities = useQuery(api.masterData.searchCommodities, { searchTerm: '' })
  const createDeposit = useMutation(api.deposits.createDeposit)
  const [form, setForm] = useState<DepositFormState>({
    memberId: '',
    commodityId: '',
    weightKg: '',
    submittedAt: '',
    collector: '',
    origin: '',
    notes: '',
  })
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<DepositFormErrors>({})
  const canSubmit = Boolean(koperasiId && members?.length && commodities?.length)

  function updateField(field: keyof DepositFormState, value: string) {
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
      <PageHeader title="Form Setoran Baru" subtitle="Data setoran tersimpan ke Convex" />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
        <form
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={async (event) => {
            event.preventDefault()
            const nextErrors = validateDepositForm(form)
            setErrors(nextErrors)
            if (Object.keys(nextErrors).length > 0 || !koperasiId) {
              setSaved(false)
              return
            }

            await createDeposit({
              koperasiId,
              memberId: form.memberId as any,
              commodityId: form.commodityId as any,
              depositNumber: `STR-${Date.now()}`,
              weightKg: Number(form.weightKg),
              submittedAt: new Date(form.submittedAt).getTime(),
              origin: form.origin,
              collectorName: form.collector,
              notes: form.notes.trim() || undefined,
            })
            setSaved(true)
            goToPage('deposits')
          }}
        >
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Input Setoran</span>
            <h2 className="text-lg font-black text-slate-950">Data panen anggota</h2>
          </div>

          {!koperasiId ? (
            <p className="text-sm font-bold text-emerald-700">Profil koperasi belum tersedia.</p>
          ) : null}

          <div className="grid gap-2">
            <Label className="text-sm font-bold text-slate-700">Nama Anggota</Label>
            <Select
              value={form.memberId}
              onValueChange={(value) => updateField('memberId', value)}
            >
              <SelectTrigger className="h-11 w-full rounded-lg bg-white text-sm font-semibold text-slate-800" aria-invalid={Boolean(errors.memberId)}>
                <SelectValue placeholder="Pilih anggota" />
              </SelectTrigger>
              <SelectContent>
                {members?.map((member) => (
                  <SelectItem key={member._id} value={member._id}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.memberId ? <small className="text-xs font-semibold text-rose-600">{errors.memberId}</small> : null}
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-bold text-slate-700">Komoditas</Label>
            <Select
              value={form.commodityId}
              onValueChange={(value) => updateField('commodityId', value)}
            >
              <SelectTrigger className="h-11 w-full rounded-lg bg-white text-sm font-semibold text-slate-800" aria-invalid={Boolean(errors.commodityId)}>
                <SelectValue placeholder="Pilih komoditas" />
              </SelectTrigger>
              <SelectContent>
                {commodities?.map((commodity) => (
                  <SelectItem key={commodity._id} value={commodity._id}>{commodity.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.commodityId ? <small className="text-xs font-semibold text-rose-600">{errors.commodityId}</small> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100">
            <NumberUnitInput id="weightKg" label="Berat Setoran" unit="kg" value={form.weightKg} onChange={(val) => updateField('weightKg', val)} error={errors.weightKg} min="1" />
            <div className="grid gap-2">
              <Label className="text-sm font-bold text-slate-700">Tanggal Setor</Label>
              <Input
                className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800"
                aria-invalid={Boolean(errors.submittedAt)}
                type="date"
                value={form.submittedAt}
                onChange={(event) => updateField('submittedAt', event.target.value)}
              />
              {errors.submittedAt ? <small className="text-xs font-semibold text-rose-600">{errors.submittedAt}</small> : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100">
            <div className="grid gap-2">
              <Label className="text-sm font-bold text-slate-700">Petugas Penerima</Label>
              <Input
                className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800"
                aria-invalid={Boolean(errors.collector)}
                value={form.collector}
                onChange={(event) => updateField('collector', event.target.value)}
              />
              {errors.collector ? <small className="text-xs font-semibold text-rose-600">{errors.collector}</small> : null}
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-bold text-slate-700">Asal Dusun</Label>
              <Input
                className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800"
                aria-invalid={Boolean(errors.origin)}
                value={form.origin}
                onChange={(event) => updateField('origin', event.target.value)}
              />
              {errors.origin ? <small className="text-xs font-semibold text-rose-600">{errors.origin}</small> : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-bold text-slate-700">Catatan Awal</Label>
            <Textarea
              className="min-h-28 rounded-lg bg-white text-sm font-semibold text-slate-800"
              rows={4}
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Catatan kondisi setoran"
            />
          </div>

          <Button className="h-11 w-full rounded-lg bg-emerald-700 text-sm font-black text-white shadow-sm hover:bg-emerald-800" disabled={!canSubmit} type="submit">
            Simpan Setoran
          </Button>
          {!canSubmit ? <p className="text-xs font-bold text-slate-500">Tambahkan profil koperasi, anggota, dan komoditas sebelum membuat setoran.</p> : null}
        </form>

        <aside className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Preview setoran">
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Preview</span>
            <h2 className="text-lg font-black text-slate-950">Ringkasan setoran</h2>
          </div>
          <div className="mt-3 grid gap-3">
            <div className="flex justify-between gap-3 border-b border-slate-200 pb-2">
              <span className="text-xs font-semibold text-slate-500">Anggota</span>
              <strong className="text-right text-sm font-black text-slate-950">{members?.find((member) => member._id === form.memberId)?.name || '-'}</strong>
            </div>
            <div className="flex justify-between gap-3 border-b border-slate-200 pb-2">
              <span className="text-xs font-semibold text-slate-500">Komoditas</span>
              <strong className="text-right text-sm font-black text-slate-950">{commodities?.find((commodity) => commodity._id === form.commodityId)?.name || '-'}</strong>
            </div>
            <div className="flex justify-between gap-3 border-b border-slate-200 pb-2">
              <span className="text-xs font-semibold text-slate-500">Berat</span>
              <strong className="text-right text-sm font-black text-slate-950">{form.weightKg || '0'} kg</strong>
            </div>
          </div>
          {saved ? <p className="mt-3 text-xs font-bold text-emerald-700">Setoran tersimpan.</p> : null}
        </aside>
      </div>
    </>
  )
}
