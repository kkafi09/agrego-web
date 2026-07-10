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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
        <Icon size={32} />
      </div>
      <h3 className="mt-4 text-base font-black text-slate-950">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      {actionLabel && onAction && (
        <button className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
