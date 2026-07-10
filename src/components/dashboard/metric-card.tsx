import type { ComponentType } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  subValue?: string | number
  description?: string
  icon?: ComponentType<any>
  isAlert?: boolean
}

export default function MetricCard({
  title,
  value,
  subValue,
  description,
  icon: Icon,
  isAlert = false
}: MetricCardProps) {
  return (
    <article className={`dashboard-metric-card ${isAlert ? 'alert' : ''}`}>
      <div className="metric-header">
        <span className="metric-title">{title}</span>
        {Icon && (
          <div className="metric-icon-wrapper">
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="metric-body">
        <strong className="metric-value">{value}</strong>
        {subValue !== undefined && <span className="metric-subvalue">{subValue}</span>}
      </div>
      {description && <p className="metric-desc">{description}</p>}
    </article>
  )
}
