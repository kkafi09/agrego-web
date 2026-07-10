import { useState } from 'react'
import {
  type ContractFormState,
  type ContractFormErrors,
  commodityOptions,
  validateContractForm,
} from './shared'

export function NewContractPage() {
  const [form, setForm] = useState<ContractFormState>({
    buyer: 'Nusantara Foods',
    commodity: commodityOptions[0],
    targetKg: '10000',
    minimumQuality: '85',
    pricePerKg: '32000',
    deadline: '2026-08-15',
  })
  const [errors, setErrors] = useState<ContractFormErrors>({})
  const [saved, setSaved] = useState(false)

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
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Manajemen Kontrak</p>
          <h1>Buat kontrak buyer</h1>
        </div>
        <div className="operator-panel" aria-label="Preview nilai kontrak">
          <span>Nilai estimasi</span>
          <strong>
            Rp
            {(Number(form.targetKg) * Number(form.pricePerKg || 0)).toLocaleString(
              'id-ID',
            )}
          </strong>
        </div>
      </header>

      <section className="form-workspace">
        <form
          className="panel deposit-form"
          onSubmit={(event) => {
            event.preventDefault()
            const nextErrors = validateContractForm(form)
            setErrors(nextErrors)
            setSaved(Object.keys(nextErrors).length === 0)
          }}
        >
          <div className="section-heading">
            <p className="eyebrow">Kontrak Baru</p>
            <h2>Spesifikasi pembelian</h2>
          </div>
          <label>
            <span>Nama Buyer</span>
            <input
              aria-invalid={Boolean(errors.buyer)}
              value={form.buyer}
              onChange={(event) => updateField('buyer', event.target.value)}
            />
            {errors.buyer ? <small className="field-error">{errors.buyer}</small> : null}
          </label>
          <label>
            <span>Komoditas</span>
            <select
              aria-invalid={Boolean(errors.commodity)}
              value={form.commodity}
              onChange={(event) => updateField('commodity', event.target.value)}
            >
              {commodityOptions.map((commodity) => (
                <option key={commodity}>{commodity}</option>
              ))}
            </select>
          </label>
          <div className="form-grid">
            <label>
              <span>Target Volume (kg)</span>
              <input
                aria-invalid={Boolean(errors.targetKg)}
                min="1"
                type="number"
                value={form.targetKg}
                onChange={(event) => updateField('targetKg', event.target.value)}
              />
              {errors.targetKg ? (
                <small className="field-error">{errors.targetKg}</small>
              ) : null}
            </label>
            <label>
              <span>Quality Minimum</span>
              <input
                aria-invalid={Boolean(errors.minimumQuality)}
                max="100"
                min="0"
                type="number"
                value={form.minimumQuality}
                onChange={(event) =>
                  updateField('minimumQuality', event.target.value)
                }
              />
              {errors.minimumQuality ? (
                <small className="field-error">{errors.minimumQuality}</small>
              ) : null}
            </label>
          </div>
          <div className="form-grid">
            <label>
              <span>Harga per Kg</span>
              <input
                aria-invalid={Boolean(errors.pricePerKg)}
                min="1"
                type="number"
                value={form.pricePerKg}
                onChange={(event) => updateField('pricePerKg', event.target.value)}
              />
              {errors.pricePerKg ? (
                <small className="field-error">{errors.pricePerKg}</small>
              ) : null}
            </label>
            <label>
              <span>Tenggat</span>
              <input
                aria-invalid={Boolean(errors.deadline)}
                type="date"
                value={form.deadline}
                onChange={(event) => updateField('deadline', event.target.value)}
              />
              {errors.deadline ? (
                <small className="field-error">{errors.deadline}</small>
              ) : null}
            </label>
          </div>
          <button className="primary-action" type="submit">
            Simpan Draft Kontrak
          </button>
        </form>
        <aside className="panel form-preview">
          <div className="section-heading">
            <p className="eyebrow">Preview</p>
            <h2>{form.commodity}</h2>
          </div>
          <dl>
            <div>
              <dt>Buyer</dt>
              <dd>{form.buyer}</dd>
            </div>
            <div>
              <dt>Target</dt>
              <dd>{form.targetKg || '0'} kg</dd>
            </div>
            <div>
              <dt>Minimum QS</dt>
              <dd>{form.minimumQuality}</dd>
            </div>
          </dl>
          {saved ? <p className="success-note">Draft kontrak tersimpan.</p> : null}
        </aside>
      </section>
    </>
  )
}
