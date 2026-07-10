import type { InputHTMLAttributes } from 'react'

interface NumberUnitInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  unit: string
  error?: string
  onChange: (value: string) => void
}

export default function NumberUnitInput({
  label,
  unit,
  error,
  onChange,
  className = '',
  id,
  ...props
}: NumberUnitInputProps) {
  return (
    <div className={`form-field-container ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="form-field-label">
          {label}
        </label>
      )}
      <div className="input-unit-group">
        <input
          id={id}
          type="number"
          className="form-input-control"
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          {...props}
        />
        <span className="input-unit-badge">{unit}</span>
      </div>
      {error && <small className="form-field-error">{error}</small>}
    </div>
  )
}
