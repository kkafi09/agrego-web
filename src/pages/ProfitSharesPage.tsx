import { useState } from 'react'
import {
  profitShares,
  formatKg,
  downloadCsv,
} from './shared'

export function ProfitSharesPage() {
  const [selectedMember, setSelectedMember] = useState(profitShares[0].member)
  const selectedRows = profitShares.filter((row) => row.member === selectedMember)
  const totalAmount = profitShares.reduce((total, row) => total + row.amount, 0)
  const selectedAmount = selectedRows.reduce((total, row) => total + row.amount, 0)

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Bagi Hasil</p>
          <h1>Riwayat pembagian hasil</h1>
        </div>
        <div className="operator-panel">
          <span>Total dibagikan</span>
          <strong>Rp{totalAmount.toLocaleString('id-ID')}</strong>
        </div>
      </header>

      <section className="deposit-workspace">
        <div className="panel">
          <div className="section-heading inline">
            <div>
              <p className="eyebrow">Riwayat Bagi Hasil</p>
              <h2>Distribusi per kontrak</h2>
            </div>
            <button
              className="primary-action"
              type="button"
              onClick={() =>
                downloadCsv('laporan-bagi-hasil.csv', [
                  [
                    'Anggota',
                    'Kontrak',
                    'Komoditas',
                    'Kontribusi Kg',
                    'Quality Score',
                    'Nominal',
                    'Tanggal',
                  ],
                  ...profitShares.map((row) => [
                    row.member,
                    row.contractId,
                    row.commodity,
                    String(row.contributedKg),
                    String(row.qualityScore),
                    String(row.amount),
                    row.calculatedAt,
                  ]),
                ])
              }
            >
              Unduh CSV
            </button>
          </div>
          <div className="candidate-list">
            {profitShares.map((row) => (
              <button
                className={`candidate-card ${
                  selectedMember === row.member ? 'selected' : ''
                }`}
                key={`${row.member}-${row.contractId}`}
                type="button"
                onClick={() => setSelectedMember(row.member)}
              >
                <div>
                  <strong>{row.member}</strong>
                  <span>{row.contractId}</span>
                </div>
                <div>
                  <span>{row.commodity}</span>
                  <b>Rp{row.amount.toLocaleString('id-ID')}</b>
                </div>
                <span className="status-pill">QS {row.qualityScore}</span>
                <small>{formatKg(row.contributedKg)}</small>
              </button>
            ))}
          </div>
        </div>

        <aside className="panel deposit-detail">
          <div className="section-heading">
            <p className="eyebrow">Detail Anggota</p>
            <h2>{selectedMember}</h2>
          </div>
          <div className="detail-stack">
            <div>
              <span>Total Hak</span>
              <strong>Rp{selectedAmount.toLocaleString('id-ID')}</strong>
              <small>{selectedRows.length} kontrak selesai</small>
            </div>
            <div>
              <span>Kontribusi</span>
              <strong>
                {formatKg(
                  selectedRows.reduce((total, row) => total + row.contributedKg, 0),
                )}
              </strong>
              <small>Berbasis volume dan quality score</small>
            </div>
          </div>
        </aside>
      </section>
    </>
  )
}
