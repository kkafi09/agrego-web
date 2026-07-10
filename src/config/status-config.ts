export interface StatusStyle {
  label: string
  className: string // Maps to styling classes in CSS
}

export const statusConfig: Record<string, StatusStyle> = {
  // Deposit Statuses
  Tercatat: { label: 'Tercatat', className: 'status-recorded' },
  'Menunggu QC': { label: 'Menunggu QC', className: 'status-waiting-qc' },
  'Lolos QC': { label: 'Lolos QC', className: 'status-passed-qc' },
  Dialokasi: { label: 'Teralokasi', className: 'status-allocated' },
  
  // QC Decisions
  Lolos: { label: 'Lolos QC', className: 'status-passed-qc' },
  Tahan: { label: 'Perlu Review', className: 'status-held' },
  Prioritas: { label: 'Prioritas', className: 'status-priority' },
  
  // Contract Statuses
  Baru: { label: 'Draft', className: 'status-recorded' },
  Aktif: { label: 'Aktif', className: 'status-passed-qc' },
  Selesai: { label: 'Terpenuhi', className: 'status-allocated' },
  Batal: { label: 'Dibatalkan', className: 'status-cancelled' }
}

export function getStatusStyle(status: string): StatusStyle {
  return statusConfig[status] || { label: status, className: 'status-default' }
}
