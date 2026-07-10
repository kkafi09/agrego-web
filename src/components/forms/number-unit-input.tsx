import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

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
    <div className={cn('grid gap-2', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-bold text-slate-700">
          {label}
        </Label>
      )}
      <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
        <Input
          id={id}
          type="number"
          className="h-11 min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 text-sm font-semibold text-slate-800 shadow-none outline-none placeholder:text-slate-400 focus-visible:ring-0"
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          {...props}
        />
        <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-xs font-black uppercase text-slate-500">{unit}</span>
      </div>
      {error && <small className="text-xs font-semibold text-rose-600">{error}</small>}
    </div>
  )
}
