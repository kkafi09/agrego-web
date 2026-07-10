import { getStatusStyle } from '../../config/status-config'
import { Calendar } from 'lucide-react'

interface ContractProgressCardProps {
  id: string
  buyer: string
  commodity: string
  fulfilledKg: number
  targetKg: number
  minimumQuality: number
  deadline: string
  status: string
}

export default function ContractProgressCard({
  id,
  buyer,
  commodity,
  fulfilledKg,
  targetKg,
  minimumQuality,
  deadline,
  status
}: ContractProgressCardProps) {
  const percent = Math.min(100, Math.round((fulfilledKg / targetKg) * 100))
  const statusStyle = getStatusStyle(status)
  
  const formatKg = (val: number) => {
    return `${val.toLocaleString('id-ID')} kg`
  }

  return (
    <article className="contract-progress-card">
      <div className="card-top">
        <div className="contract-identity">
          <strong className="buyer-name">{buyer}</strong>
          <span className="contract-subtext">
            {id} • {commodity} • Min QS: {minimumQuality}
          </span>
        </div>
        <span className={`status-badge ${statusStyle.className}`}>
          {statusStyle.label}
        </span>
      </div>

      <div className="card-middle">
        <div className="progress-stats">
          <span className="progress-weight">
            {formatKg(fulfilledKg)} dari {formatKg(targetKg)}
          </span>
          <span className="progress-percentage">{percent}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="card-bottom">
        <Calendar size={14} className="deadline-icon" />
        <span className="deadline-text">Tenggat: {deadline}</span>
      </div>
    </article>
  )
}
