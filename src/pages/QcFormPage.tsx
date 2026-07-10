import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import toast from 'react-hot-toast'
import { api } from '../../convex/_generated/api'
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
  type QcFormState,
  gradeOptions,
} from './shared'

export function QcFormPage() {
  const currentKoperasi = useQuery(api.koperasi.getCurrentKoperasi, { token: getAuthToken() })
  const koperasiId = currentKoperasi?._id
  const deposits = useQuery(api.deposits.listDeposits, koperasiId ? { koperasiId, status: 'recorded' } : 'skip')
  const saveQualityCheck = useMutation(api.qualityChecks.saveQualityCheck)
  const [, setSaved] = useState(false)
  const [form, setForm] = useState<QcFormState>({
    depositId: '',
    sizeGrade: 'A',
    defectPercent: '',
    inspector: '',
    notes: '',
  })
  const qualityGrade = form.sizeGrade
  const scoreDecision = qualityGrade === 'A' ? 'Prioritas' : qualityGrade === 'D' ? 'Tahan' : 'Lolos'
  const canSubmit = Boolean(form.depositId && form.inspector.trim())

  function updateField(field: keyof QcFormState, value: string) {
    setSaved(false)
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Quality Check</p>
          <h1>Form pemeriksaan kualitas</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950" aria-label="Setoran yang diperiksa">
          <span>Setoran dipilih</span>
          <strong>{deposits?.find((deposit) => deposit.id === form.depositId)?.depositNumber ?? '-'}</strong>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
        <form
          className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!canSubmit) return
            try {
              const result = await saveQualityCheck({
                depositId: form.depositId as any,
                qualityGrade: form.sizeGrade,
                defectPercent: Number(form.defectPercent),
                inspectorName: form.inspector,
                notes: form.notes.trim() || undefined,
              })
              sessionStorage.setItem('agrego_selected_quality_check_id', result.qualityCheckId)
              toast.success('Hasil QC berhasil disimpan.')
              setSaved(false)
              setForm({ depositId: '', sizeGrade: 'A', defectPercent: '', inspector: '', notes: '' })
            } catch (err) {
              toast.error((err as Error).message || 'Gagal menyimpan hasil QC.')
            }
          }}
        >
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Input QC</p>
            <h2>Parameter pemeriksaan</h2>
          </div>

          <div className="grid gap-2">
            <Label>ID Setoran</Label>
            <Select value={form.depositId} onValueChange={(value) => updateField('depositId', value)}>
              <SelectTrigger className="h-11 w-full rounded-lg bg-white text-sm font-semibold text-slate-800">
                <SelectValue placeholder="Pilih setoran" />
              </SelectTrigger>
              <SelectContent position="popper">
                {deposits?.map((deposit) => (
                  <SelectItem key={deposit.id} value={deposit.id}>
                    {deposit.depositNumber} / {deposit.memberName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <Label>Grade QS</Label>
              <Select value={form.sizeGrade} onValueChange={(value) => updateField('sizeGrade', value)}>
                <SelectTrigger className="h-11 w-full rounded-lg bg-white text-sm font-semibold text-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {gradeOptions.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <Label>Kerusakan (%)</Label>
              <Input className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800" min="0" step="0.1" type="number" value={form.defectPercent} onChange={(event) => updateField('defectPercent', event.target.value)} />
            </label>
            <label className="grid gap-2">
              <Label>Petugas QC</Label>
              <Input className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800" value={form.inspector} onChange={(event) => updateField('inspector', event.target.value)} />
            </label>
          </div>

          <label className="grid gap-2">
            <Label>Catatan Pemeriksaan</Label>
            <Textarea className="min-h-28 rounded-lg bg-white text-sm font-semibold text-slate-800" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Catatan pemeriksaan" />
          </label>
          <Button className="h-11 rounded-lg bg-emerald-700 text-sm font-black text-white shadow-sm hover:bg-emerald-800" disabled={!canSubmit} type="submit">
            Simpan QC
          </Button>
          {deposits?.length === 0 ? <p className="text-sm font-bold text-emerald-700">Belum ada setoran tercatat yang menunggu QC.</p> : null}
        </form>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Preview input QC">
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Preview QC</p>
            <h2>{deposits?.find((deposit) => deposit.id === form.depositId)?.depositNumber ?? '-'}</h2>
          </div>
          <dl className="mt-4 grid gap-3">
            <div><dt className="text-xs font-semibold text-slate-500">Grade QS</dt><dd className="mt-1 text-sm font-black text-slate-950">{form.sizeGrade}</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">Kerusakan</dt><dd className="mt-1 text-sm font-black text-slate-950">{form.defectPercent || '0'}%</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">Petugas</dt><dd className="mt-1 text-sm font-black text-slate-950">{form.inspector || '-'}</dd></div>
          </dl>
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Quality Grade</span>
            <strong className="mt-2 block text-4xl font-black text-slate-950">{qualityGrade}</strong>
            <p className="mt-3 text-sm font-semibold text-slate-600">{scoreDecision} untuk standar supply pool koperasi.</p>
          </div>
        </aside>
      </section>
    </>
  )
}
