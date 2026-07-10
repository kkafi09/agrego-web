import { qcRecords } from './shared'

export function QcResultDetailPage() {
  const record = qcRecords[0]
  const recommendation =
    record.score >= 90
      ? 'Masukkan sebagai prioritas supply pool untuk kontrak aktif.'
      : record.score >= 82
        ? 'Layak dialokasikan setelah kebutuhan prioritas terpenuhi.'
        : 'Tahan dari pool dan lakukan sortasi ulang.'

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Quality Check</p>
          <h1>Detail hasil pemeriksaan</h1>
        </div>
        <div className="operator-panel" aria-label="Skor hasil QC">
          <span>Quality Score</span>
          <strong>{record.score}</strong>
        </div>
      </header>

      <section className="detail-layout">
        <article className="panel qc-result-hero">
          <div>
            <p className="eyebrow">{record.id}</p>
            <h2>{record.decision}</h2>
            <p>{recommendation}</p>
          </div>
          <div className="score-ring" aria-label={`Quality score ${record.score}`}>
            {record.score}
          </div>
        </article>

        <article className="panel qc-detail-card">
          <div className="section-heading">
            <p className="eyebrow">Setoran</p>
            <h2>{record.depositId}</h2>
          </div>
          <dl className="detail-metrics single">
            <div>
              <dt>Anggota</dt>
              <dd>{record.member}</dd>
            </div>
            <div>
              <dt>Komoditas</dt>
              <dd>{record.commodity}</dd>
            </div>
            <div>
              <dt>Petugas QC</dt>
              <dd>{record.inspector}</dd>
            </div>
            <div>
              <dt>Tanggal</dt>
              <dd>{record.checkedAt}</dd>
            </div>
          </dl>
        </article>

        <article className="panel qc-detail-card wide">
          <div className="section-heading inline">
            <div>
              <p className="eyebrow">Hasil Parameter</p>
              <h2>Rincian pengukuran kualitas</h2>
            </div>
            <span>Audit trail QC</span>
          </div>
          <div className="parameter-grid">
            <div>
              <dt>Kadar Air</dt>
              <strong>{record.moisturePercent}%</strong>
            </div>
            <div>
              <dt>Grade Ukuran</dt>
              <strong>{record.sizeGrade}</strong>
            </div>
            <div>
              <dt>Kerusakan</dt>
              <strong>{record.defectPercent}%</strong>
            </div>
            <div>
              <dt>Keputusan</dt>
              <strong>{record.decision}</strong>
            </div>
          </div>
        </article>
      </section>
    </>
  )
}
