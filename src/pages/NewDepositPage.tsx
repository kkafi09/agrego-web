import { useState } from 'react'
import PageHeader from '../components/layout/page-header'
import NumberUnitInput from '../components/forms/number-unit-input'
import {
  type DepositRecord,
  type DepositFormState,
  type DepositFormErrors,
  memberOptions,
  commodityOptions,
  collectorOptions,
  validateDepositForm,
} from './shared'

export function NewDepositPage({
  onSave,
}: {
  onSave: (record: DepositRecord) => void
}) {
  const [form, setForm] = useState<DepositFormState>({
    member: memberOptions[0],
    commodity: commodityOptions[0],
    weightKg: '250',
    submittedAt: '2026-07-10',
    collector: collectorOptions[0],
    origin: 'Dusun Cibuntu',
    notes: '',
  })
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<DepositFormErrors>({})
  const estimatedQueue = form.commodity === 'Kopi Robusta' ? 'QC Kopi' : 'QC Umum'

  function updateField(field: keyof DepositFormState, value: string) {
    setSaved(false)
    setErrors((current) => {
      const next = { ...current }
      delete next[field]
      return next
    })
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <>
      <PageHeader
        title="Form Setoran Baru"
        subtitle={`Antrean Pemeriksaan: ${estimatedQueue}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '20px', alignItems: 'start' }} className="form-workspace">
        <form
          className="dashboard-panel"
          onSubmit={(event) => {
            event.preventDefault()
            const nextErrors = validateDepositForm(form)
            setErrors(nextErrors)
            if (Object.keys(nextErrors).length > 0) {
              setSaved(false)
              return
            }
            onSave({
              id: `STR-${Date.now().toString().slice(-6)}`,
              member: form.member,
              commodity: form.commodity,
              weightKg: Number(form.weightKg),
              submittedAt: form.submittedAt,
              qualityScore: null,
              status: 'Tercatat',
              collector: form.collector,
              phone: '0812-4400-0000',
              origin: form.origin,
              notes:
                form.notes.trim() ||
                'Setoran baru tersimpan dan siap masuk antrean Quality Check.',
            })
            setSaved(true)
          }}
          style={{ gap: '16px' }}
        >
          <div className="panel-title-container">
            <span className="panel-eyebrow">Input Setoran</span>
            <h2 className="panel-title">Data panen anggota</h2>
          </div>

          <div className="form-field-container">
            <label className="form-field-label">Nama Anggota</label>
            <select
              className="form-select-control"
              aria-invalid={Boolean(errors.member)}
              value={form.member}
              onChange={(event) => updateField('member', event.target.value)}
            >
              {memberOptions.map((member) => (
                <option key={member}>{member}</option>
              ))}
            </select>
            {errors.member ? <small className="form-field-error">{errors.member}</small> : null}
          </div>

          <div className="form-field-container">
            <label className="form-field-label">Komoditas</label>
            <select
              className="form-select-control"
              aria-invalid={Boolean(errors.commodity)}
              value={form.commodity}
              onChange={(event) => updateField('commodity', event.target.value)}
            >
              {commodityOptions.map((commodity) => (
                <option key={commodity}>{commodity}</option>
              ))}
            </select>
            {errors.commodity ? (
              <small className="form-field-error">{errors.commodity}</small>
            ) : null}
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <NumberUnitInput
              id="weightKg"
              label="Berat Setoran"
              unit="kg"
              value={form.weightKg}
              onChange={(val) => updateField('weightKg', val)}
              error={errors.weightKg}
              min="1"
            />
            
            <div className="form-field-container">
              <label className="form-field-label">Tanggal Setor</label>
              <input
                className="form-input-control"
                aria-invalid={Boolean(errors.submittedAt)}
                type="date"
                value={form.submittedAt}
                onChange={(event) =>
                  updateField('submittedAt', event.target.value)
                }
              />
              {errors.submittedAt ? (
                <small className="form-field-error">{errors.submittedAt}</small>
              ) : null}
            </div>
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div className="form-field-container">
              <label className="form-field-label">Petugas Penerima</label>
              <select
                className="form-select-control"
                aria-invalid={Boolean(errors.collector)}
                value={form.collector}
                onChange={(event) => updateField('collector', event.target.value)}
              >
                {collectorOptions.map((collector) => (
                  <option key={collector}>{collector}</option>
                ))}
              </select>
              {errors.collector ? (
                <small className="form-field-error">{errors.collector}</small>
              ) : null}
            </div>
            
            <div className="form-field-container">
              <label className="form-field-label">Asal Dusun</label>
              <input
                className="form-input-control"
                aria-invalid={Boolean(errors.origin)}
                value={form.origin}
                onChange={(event) => updateField('origin', event.target.value)}
              />
              {errors.origin ? (
                <small className="form-field-error">{errors.origin}</small>
              ) : null}
            </div>
          </div>

          <div className="form-field-container">
            <label className="form-field-label">Catatan Awal</label>
            <textarea
              className="form-textarea-control"
              aria-invalid={Boolean(errors.notes)}
              rows={4}
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Mis. kondisi kemasan, kadar kering awal, atau antrean QC."
            />
            {errors.notes ? <small className="form-field-error">{errors.notes}</small> : null}
          </div>

          <button className="btn-primary" type="submit" style={{ width: '100%' }}>
            Simpan Draft Setoran
          </button>
        </form>

        <aside className="dashboard-panel" aria-label="Preview setoran">
          <div className="panel-title-container">
            <span className="panel-eyebrow">Preview</span>
            <h2 className="panel-title">Ringkasan setoran</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Anggota</span>
              <strong style={{ fontSize: '13px', color: 'var(--text-strong)' }}>{form.member}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Komoditas</span>
              <strong style={{ fontSize: '13px', color: 'var(--text-strong)' }}>{form.commodity}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Berat</span>
              <strong style={{ fontSize: '13px', color: 'var(--text-strong)' }}>{form.weightKg || '0'} kg</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Status Awal</span>
              <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>Tercatat</strong>
            </div>
          </div>
          {saved ? (
            <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
              Draft setoran siap masuk riwayat dan antrean Quality Check.
            </p>
          ) : null}
        </aside>
      </div>
    </>
  )
}
