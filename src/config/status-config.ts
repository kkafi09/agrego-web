export interface StatusStyle {
  label: string
  className: string
}

export const statusConfig: Record<string, StatusStyle> = {
  // Deposit Statuses
  Tercatat: { label: 'Tercatat', className: 'border-sky-200 bg-sky-50 text-sky-700' },
  'Menunggu QC': { label: 'Menunggu QC', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  'Lolos QC': { label: 'Lolos QC', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  Dialokasi: { label: 'Teralokasi', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  Ditolak: { label: 'Ditolak', className: 'border-rose-200 bg-rose-50 text-rose-700' },
  
  // QC Decisions
  Lolos: { label: 'Lolos QC', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  Tahan: { label: 'Perlu Review', className: 'border-rose-200 bg-rose-50 text-rose-700' },
  Prioritas: { label: 'Prioritas', className: 'border-orange-200 bg-orange-50 text-orange-700' },
  
  // Contract Statuses
  Baru: { label: 'Draft', className: 'border-slate-200 bg-slate-50 text-slate-700' },
  Aktif: { label: 'Aktif', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  Selesai: { label: 'Terpenuhi', className: 'border-blue-200 bg-blue-50 text-blue-700' },
  Batal: { label: 'Dibatalkan', className: 'border-rose-200 bg-rose-50 text-rose-700' }
}

export function getStatusStyle(status: string): StatusStyle {
  return statusConfig[status] || { label: status, className: 'border-slate-200 bg-slate-50 text-slate-700' }
}
