import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import {
  type QcFormState,
  calculateQualityScore,
  gradeOptions,
  mapQualityDecision,
} from './shared'

export function QcFormPage() {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const koperasiId = defaultKoperasi?._id
  const deposits = useQuery(api.deposits.listDeposits, koperasiId ? { koperasiId, status: 'recorded' } : 'skip')
  const saveQualityCheck = useMutation(api.qualityChecks.saveQualityCheck)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<QcFormState>({
    depositId: '',
    moisturePercent: '',
    sizeGrade: 'A',
    defectPercent: '',
    inspector: '',
    notes: '',
  })
  const qualityScore = calculateQualityScore(form)
  const scoreDecision = qualityScore >= 90 ? 'Prioritas' : qualityScore >= 82 ? 'Lolos' : 'Tahan'
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
            const result = await saveQualityCheck({
              depositId: form.depositId as any,
              moisturePercent: Number(form.moisturePercent),
              sizeGrade: form.sizeGrade,
              defectPercent: Number(form.defectPercent),
              inspectorName: form.inspector,
              notes: form.notes.trim() || undefined,
            })
            sessionStorage.setItem('agrego_selected_quality_check_id', result.qualityCheckId)
            setSaved(true)
            setForm({ depositId: '', moisturePercent: '', sizeGrade: 'A', defectPercent: '', inspector: '', notes: '' })
          }}
        >
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Input QC</p>
            <h2>Parameter pemeriksaan</h2>
          </div>

          <label>
            <span>ID Setoran</span>
            <select value={form.depositId} onChange={(event) => updateField('depositId', event.target.value)}>
              <option value="">Pilih setoran</option>
              {deposits?.map((deposit) => (
                <option key={deposit.id} value={deposit.id}>{deposit.depositNumber} / {deposit.memberName}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100">
            <label><span>Kadar Air (%)</span><input min="0" step="0.1" type="number" value={form.moisturePercent} onChange={(event) => updateField('moisturePercent', event.target.value)} /></label>
            <label><span>Grade Ukuran</span><select value={form.sizeGrade} onChange={(event) => updateField('sizeGrade', event.target.value)}>{gradeOptions.map((grade) => (<option key={grade}>{grade}</option>))}</select></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100">
            <label><span>Kerusakan (%)</span><input min="0" step="0.1" type="number" value={form.defectPercent} onChange={(event) => updateField('defectPercent', event.target.value)} /></label>
            <label><span>Petugas QC</span><input value={form.inspector} onChange={(event) => updateField('inspector', event.target.value)} /></label>
          </div>

          <label>
            <span>Catatan Pemeriksaan</span>
            <textarea rows={4} value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Catatan pemeriksaan" />
          </label>
          <button className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50" disabled={!canSubmit} type="submit">
            Simpan QC
          </button>
          {deposits?.length === 0 ? <p className="text-sm font-bold text-emerald-700">Belum ada setoran tercatat yang menunggu QC.</p> : null}
          {saved ? <p className="text-sm font-bold text-emerald-700">Hasil QC tersimpan.</p> : null}
        </form>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Preview input QC">
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Preview QC</p>
            <h2>{deposits?.find((deposit) => deposit.id === form.depositId)?.depositNumber ?? '-'}</h2>
          </div>
          <dl className="mt-4 grid gap-3">
            <div><dt className="text-xs font-semibold text-slate-500">Kadar Air</dt><dd className="mt-1 text-sm font-black text-slate-950">{form.moisturePercent || '0'}%</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">Grade</dt><dd className="mt-1 text-sm font-black text-slate-950">{form.sizeGrade}</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">Kerusakan</dt><dd className="mt-1 text-sm font-black text-slate-950">{form.defectPercent || '0'}%</dd></div>
            <div><dt className="text-xs font-semibold text-slate-500">Petugas</dt><dd className="mt-1 text-sm font-black text-slate-950">{form.inspector || '-'}</dd></div>
          </dl>
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Quality Score</span>
            <strong className="mt-2 block text-4xl font-black text-slate-950">{qualityScore}</strong>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white" aria-label={`Quality score ${qualityScore}`}><span className="block h-full rounded-full bg-emerald-600" style={{ width: `${qualityScore}%` }} /></div>
            <p className="mt-3 text-sm font-semibold text-slate-600">{scoreDecision} untuk standar supply pool koperasi.</p>
          </div>
        </aside>
      </section>
    </>
  )
}
