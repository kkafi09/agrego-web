import { useState } from 'react'
import { initialDepositRecords } from './page-data'
import {
  type QcFormState,
  calculateQualityScore,
  gradeOptions,
  collectorOptions,
} from './shared'

export function QcFormPage() {
  const [form, setForm] = useState<QcFormState>({
    depositId: 'STR-1026',
    moisturePercent: '12',
    sizeGrade: 'B',
    defectPercent: '2',
    inspector: 'Dewi',
    notes: '',
  })
  const qualityScore = calculateQualityScore(form)
  const scoreDecision =
    qualityScore >= 90 ? 'Prioritas' : qualityScore >= 82 ? 'Lolos' : 'Tahan'

  function updateField(field: keyof QcFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Quality Check</p>
          <h1>Form pemeriksaan kualitas</h1>
        </div>
        <div className="operator-panel" aria-label="Setoran yang diperiksa">
          <span>Setoran dipilih</span>
          <strong>{form.depositId}</strong>
        </div>
      </header>

      <section className="form-workspace">
        <form className="panel deposit-form">
          <div className="section-heading">
            <p className="eyebrow">Input QC</p>
            <h2>Parameter pemeriksaan</h2>
          </div>

          <label>
            <span>ID Setoran</span>
            <select
              value={form.depositId}
              onChange={(event) => updateField('depositId', event.target.value)}
            >
              {initialDepositRecords.map((deposit) => (
                <option key={deposit.id}>{deposit.id}</option>
              ))}
            </select>
          </label>

          <div className="form-grid">
            <label>
              <span>Kadar Air (%)</span>
              <input
                min="0"
                step="0.1"
                type="number"
                value={form.moisturePercent}
                onChange={(event) =>
                  updateField('moisturePercent', event.target.value)
                }
              />
            </label>
            <label>
              <span>Grade Ukuran</span>
              <select
                value={form.sizeGrade}
                onChange={(event) => updateField('sizeGrade', event.target.value)}
              >
                {gradeOptions.map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-grid">
            <label>
              <span>Kerusakan (%)</span>
              <input
                min="0"
                step="0.1"
                type="number"
                value={form.defectPercent}
                onChange={(event) =>
                  updateField('defectPercent', event.target.value)
                }
              />
            </label>
            <label>
              <span>Petugas QC</span>
              <select
                value={form.inspector}
                onChange={(event) => updateField('inspector', event.target.value)}
              >
                {collectorOptions.map((collector) => (
                  <option key={collector}>{collector}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span>Catatan Pemeriksaan</span>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Catatan visual, aroma, kebersihan, atau rekomendasi."
            />
          </label>
        </form>

        <aside className="panel form-preview" aria-label="Preview input QC">
          <div className="section-heading">
            <p className="eyebrow">Preview QC</p>
            <h2>{form.depositId}</h2>
          </div>
          <dl>
            <div>
              <dt>Kadar Air</dt>
              <dd>{form.moisturePercent || '0'}%</dd>
            </div>
            <div>
              <dt>Grade</dt>
              <dd>{form.sizeGrade}</dd>
            </div>
            <div>
              <dt>Kerusakan</dt>
              <dd>{form.defectPercent || '0'}%</dd>
            </div>
            <div>
              <dt>Petugas</dt>
              <dd>{form.inspector}</dd>
            </div>
          </dl>
          <div className="score-preview">
            <span>Quality Score</span>
            <strong>{qualityScore}</strong>
            <div className="quality-bar" aria-label={`Quality score ${qualityScore}`}>
              <span style={{ width: `${qualityScore}%` }} />
            </div>
            <p>{scoreDecision} untuk standar supply pool koperasi.</p>
          </div>
        </aside>
      </section>
    </>
  )
}
