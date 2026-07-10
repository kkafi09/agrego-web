import { AlertCircle, Clock } from 'lucide-react'

interface NotificationItem {
  id?: string
  title: string
  body: string
  time: string
  actionLabel?: string
  onAction?: () => void
}

interface ActionRequiredListProps {
  notifications: NotificationItem[]
}

export default function ActionRequiredList({ notifications }: ActionRequiredListProps) {
  if (notifications.length === 0) {
    return (
      <div className="empty-notifications">
        <AlertCircle size={24} className="empty-icon" />
        <p>Tidak ada notifikasi penting saat ini.</p>
      </div>
    )
  }

  return (
    <div className="action-required-list">
      {notifications.map((item, index) => (
        <article className="action-item" key={item.title + index}>
          <div className="action-item-header">
            <span className="pulse-dot" aria-hidden="true" />
            <strong className="action-title">{item.title}</strong>
          </div>
          <p className="action-body">{item.body}</p>
          <div className="action-footer">
            <div className="time-meta">
              <Clock size={12} />
              <span>{item.time}</span>
            </div>
            {item.actionLabel && (
              <button
                className="action-btn-link"
                type="button"
                onClick={item.onAction}
              >
                {item.actionLabel}
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
