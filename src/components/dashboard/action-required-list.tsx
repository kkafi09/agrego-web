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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <AlertCircle size={24} className="text-slate-400" />
        <p className="mt-3 text-sm font-semibold text-slate-500">Tidak ada notifikasi penting saat ini.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {notifications.map((item, index) => (
        <article className="rounded-xl border border-orange-200 bg-orange-50/60 p-4" key={item.title + index}>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.14)]" aria-hidden="true" />
            <strong className="text-sm font-black text-slate-950">{item.title}</strong>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Clock size={12} />
              <span>{item.time}</span>
            </div>
            {item.actionLabel && (
              <button
                className="text-sm font-black text-orange-700 transition hover:text-orange-800"
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
