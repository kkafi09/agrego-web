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
    <article className={`rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
      isAlert ? 'border-orange-200 bg-orange-50/70' : 'border-slate-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-bold text-slate-500">{title}</span>
        {Icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            isAlert ? 'bg-orange-100 text-orange-700' : 'bg-emerald-50 text-emerald-700'
          }`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="mt-5 flex items-baseline gap-2">
        <strong className="text-3xl font-black tracking-normal text-slate-950">{value}</strong>
        {subValue !== undefined && <span className="text-sm font-bold text-slate-500">{subValue}</span>}
      </div>
      {description && <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>}
    </article>
  )
}
