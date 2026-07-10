import type { ReactNode } from 'react'
import { Search } from 'lucide-react'

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
    <div className="data-table-wrapper">
      {showSearch && (
        <div className="table-search-container">
          <Search size={16} className="table-search-icon" />
          <input
            type="text"
            className="table-search-input"
            placeholder={searchPlaceholder || 'Cari...'}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      <div className="table-responsive-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={col.className}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty-cell">
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
                    className={`${onRowClick ? 'clickable-row' : ''} ${isSelected ? 'row-selected' : ''}`}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        onRowClick(item)
                      }
                    }}
                  >
                    {columns.map((col, idx) => (
                      <td key={idx} className={col.className}>
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
  )
}
