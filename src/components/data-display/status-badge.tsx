import { getStatusStyle } from '../../config/status-config'

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = getStatusStyle(status)

  return (
    <span className={`status-badge ${style.className}`}>
      {style.label}
    </span>
  )
}
