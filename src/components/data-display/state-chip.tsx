import { getStatusStyle } from '../../config/status-config'

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = getStatusStyle(status)

  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-bold ${style.className}`}>
      {style.label}
    </span>
  )
}
