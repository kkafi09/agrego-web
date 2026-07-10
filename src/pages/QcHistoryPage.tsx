import { qcRecords } from './shared'

export function QcHistoryPage() {
  const averageScore = Math.round(
    qcRecords.reduce((total, record) => total + record.score, 0) /
      qcRecords.length,
  )
  const passedCount = qcRecords.filter((record) => record.decision !== 'Tahan')
    .length

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Quality Check</p>
          <h1>Riwayat pemeriksaan kualitas</h1>
        </div>
        <div className="operator-panel" aria-label="Ringkasan quality check">
          <span>Rata-rata Quality Score</span>
          <strong>{averageScore}</strong>
        </div>
      </header>

      <section className="overview-grid" aria-label="Ringkasan riwayat QC">
        <article className="metric-card">
          <span>Total QC</span>
          <strong>{qcRecords.length}</strong>
          <small>Pemeriksaan tercatat</small>
        </article>
        <article className="metric-card">
          <span>Lolos Standar</span>
          <strong>{passedCount}</strong>
          <small>Siap dipertimbangkan alokasi</small>
        </article>
        <article className="metric-card">
          <span>Perlu Ditahan</span>
          <strong>{qcRecords.length - passedCount}</strong>
          <small>Butuh tindak lanjut koperasi</small>
        </article>
        <article className="metric-card">
          <span>Skor Tertinggi</span>
          <strong>{Math.max(...qcRecords.map((record) => record.score))}</strong>
          <small>Prioritas supply pool</small>
        </article>
      </section>

      <section className="panel qc-panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Riwayat QC</p>
            <h2>Parameter kualitas setoran</h2>
          </div>
          <span>Data tiruan</span>
        </div>
        <div className="qc-table" role="table" aria-label="Riwayat QC">
          <div className="qc-table-head" role="row">
            <span>ID QC</span>
            <span>Setoran</span>
            <span>Komoditas</span>
            <span>Kadar Air</span>
            <span>Grade</span>
            <span>Kerusakan</span>
            <span>Skor</span>
            <span>Keputusan</span>
          </div>
          {qcRecords.map((record) => (
            <article className="qc-row" role="row" key={record.id}>
              <span className="record-id">{record.id}</span>
              <div>
                <strong>{record.depositId}</strong>
                <small>
                  {record.member} / {record.inspector}
                </small>
              </div>
              <span>{record.commodity}</span>
              <span>{record.moisturePercent}%</span>
              <span>{record.sizeGrade}</span>
              <span>{record.defectPercent}%</span>
              <strong>{record.score}</strong>
              <span
                className={`status-pill qc-status ${record.decision.toLowerCase()}`}
              >
                {record.decision}
              </span>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
