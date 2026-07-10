import { useState } from 'react'
import { initialDepositRecords } from './page-data'
import {
  type QcFormState,
  calculateQualityScore,
  gradeOptions,
  collectorOptions,
  formatKg,
} from './shared'

export function QcDepositDetailPage() {
  const deposit = initialDepositRecords[2]
  const [form, setForm] = useState<QcFormState>({
    depositId: deposit.id,
    moisturePercent: '12',
    sizeGrade: 'B',
    defectPercent: '2',
    inspector: 'Dewi',
    notes: '',
  })
  const qualityScore = calculateQualityScore(form)
  const checklist = [
    'Sampel fisik sudah diterima petugas QC',
    'Berat tercatat cocok dengan nota penerimaan',
    'Belum ada quality score final',
    'Menunggu pengukuran kadar air dan kerusakan',
  ]

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
          <h1>Detail setoran untuk pemeriksaan</h1>
        </div>
        <div className="operator-panel" aria-label="Setoran aktif untuk QC">
          <span>Setoran aktif</span>
          <strong>{deposit.id}</strong>
        </div>
      </header>

      <section className="detail-layout">
        <article className="panel qc-detail-card">
          <div className="section-heading">
            <p className="eyebrow">Identitas Setoran</p>
            <h2>{deposit.commodity}</h2>
          </div>
          <dl className="detail-metrics">
            <div>
              <dt>Anggota</dt>
              <dd>{deposit.member}</dd>
            </div>
            <div>
              <dt>Kontak</dt>
              <dd>{deposit.phone}</dd>
            </div>
            <div>
              <dt>Asal</dt>
              <dd>{deposit.origin}</dd>
            </div>
            <div>
              <dt>Berat</dt>
              <dd>{formatKg(deposit.weightKg)}</dd>
            </div>
            <div>
              <dt>Tanggal Setor</dt>
              <dd>{deposit.submittedAt}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{deposit.status}</dd>
            </div>
          </dl>
        </article>

        <article className="panel qc-detail-card">
          <div className="section-heading">
            <p className="eyebrow">Kesiapan QC</p>
            <h2>Antrean pemeriksaan</h2>
          </div>
          <ul className="checklist">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="sample-box">
            <span>Catatan awal</span>
            <p>{deposit.notes}</p>
          </div>
        </article>

        <article className="panel qc-detail-card wide">
          <div className="section-heading inline">
            <div>
              <p className="eyebrow">Parameter Target</p>
              <h2>Standar minimum komoditas</h2>
            </div>
            <span>Data tiruan</span>
          </div>
          <div className="parameter-grid">
            <div>
              <span>Kadar air ideal</span>
              <strong>10% - 13%</strong>
            </div>
            <div>
              <span>Grade ukuran</span>
              <strong>A atau B</strong>
            </div>
            <div>
              <span>Kerusakan maksimal</span>
              <strong>3%</strong>
            </div>
            <div>
              <span>Skor lolos</span>
              <strong>Minimal 82</strong>
            </div>
          </div>
        </article>

        <article className="panel qc-detail-card wide">
          <div className="section-heading inline">
            <div>
              <p className="eyebrow">Form Pemeriksaan</p>
              <h2>Input QC untuk {deposit.id}</h2>
            </div>
            <span>Skor lokal {qualityScore}</span>
          </div>
          <div className="embedded-qc-form">
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
          <div className="score-preview inline-score">
            <span>Quality Score</span>
            <strong>{qualityScore}</strong>
            <div className="quality-bar" aria-label={`Quality score ${qualityScore}`}>
              <span style={{ width: `${qualityScore}%` }} />
            </div>
          </div>
        </article>
      </section>
    </>
  )
}
