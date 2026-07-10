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
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <strong className="block truncate text-sm font-black text-slate-950">{buyer}</strong>
          <span className="mt-1 block text-xs font-semibold text-slate-500">
            {id} / {commodity} / Min QS: {minimumQuality}
          </span>
        </div>
        <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyle.className}`}>
          {statusStyle.label}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-bold text-slate-700">
            {formatKg(fulfilledKg)} dari {formatKg(targetKg)}
          </span>
          <span className="font-black text-emerald-700">{percent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Calendar size={14} className="text-slate-400" />
        <span>Tenggat: {deadline}</span>
      </div>
    </article>
  )
}
