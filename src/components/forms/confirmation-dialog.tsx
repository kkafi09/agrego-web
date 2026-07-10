import { AlertTriangle } from 'lucide-react'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isDanger?: boolean
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  isDanger = false
}: ConfirmationDialogProps) {
  if (!isOpen) return null

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-container" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
        <div className="dialog-header">
          {isDanger && <AlertTriangle className="dialog-danger-icon" size={24} />}
          <h3 id="dialog-title" className="dialog-title">{title}</h3>
        </div>
        
        <div className="dialog-body">
          <p id="dialog-desc" className="dialog-message">{message}</p>
        </div>

        <div className="dialog-actions">
          <button
            className="btn-secondary"
            type="button"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={isDanger ? 'btn-danger' : 'btn-primary'}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
