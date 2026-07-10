import type { ComponentType } from 'react'
import { FolderOpen } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description: string
  icon?: ComponentType<any>
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  title = 'Tidak Ada Data',
  description,
  icon: Icon = FolderOpen,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon-wrapper">
        <Icon size={32} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <button className="empty-state-btn" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
