import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Input } from '../ui/input'

export interface Column<T> {
  header: string
  render: (item: T, index: number) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T, index: number) => string | number
  onRowClick?: (item: T) => void
  selectedRowKey?: string | number
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
}

export default function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  selectedRowKey,
  searchPlaceholder,
  searchValue,
  onSearchChange
}: DataTableProps<T>) {
  const showSearch = onSearchChange !== undefined && searchValue !== undefined

  return (
    <div className="grid gap-4">
      {showSearch && (
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-800 transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            placeholder={searchPlaceholder || 'Cari...'}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={cn('whitespace-nowrap px-4 py-3', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                  Tidak ada data yang tersedia
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const key = keyExtractor(item, index)
                const isSelected = selectedRowKey !== undefined && selectedRowKey === key
                
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={cn(
                      'transition',
                      onRowClick && 'cursor-pointer hover:bg-emerald-50/50',
                      isSelected && 'bg-emerald-50',
                    )}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        onRowClick(item)
                      }
                    }}
                  >
                    {columns.map((col, idx) => (
                      <td key={idx} className={cn('px-4 py-3 align-middle text-slate-700', col.className)}>
                        {col.render(item, index)}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
