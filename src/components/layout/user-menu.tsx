import { useState, useRef, useEffect } from 'react'
import type { Page } from '../../config/navigation'
import type { Role } from '../../config/role-navigation'
import { User, LogOut, ChevronDown } from 'lucide-react'

interface UserMenuProps {
  user: { name: string; email: string; role: Role } | null
  onPageChange: (page: Page) => void
  onLogout: () => void
}

export default function UserMenu({ user, onPageChange, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!user) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-xs font-black text-white" aria-hidden="true">
          {getInitials(user.name)}
        </div>
        <span className="hidden max-w-36 truncate xl:inline">{user.name}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl" role="menu">
          <div className="grid gap-1 p-4">
            <span className="truncate text-sm font-black text-slate-950">{user.name}</span>
            <span className="truncate text-xs font-medium text-slate-500">{user.email}</span>
            <span className="mt-1 w-fit rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{user.role}</span>
          </div>
          <div className="h-px bg-slate-100" />
          <button
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            role="menuitem"
            type="button"
            onClick={() => {
              onPageChange('profile')
              setIsOpen(false)
            }}
          >
            <User size={14} />
            <span>Profil Saya</span>
          </button>
          <div className="h-px bg-slate-100" />
          <button
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-rose-700 transition hover:bg-rose-50"
            role="menuitem"
            type="button"
            onClick={() => {
              onLogout()
              setIsOpen(false)
            }}
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>
      )}
    </div>
  )
}
