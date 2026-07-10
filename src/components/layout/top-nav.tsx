import type { Page } from '../../config/navigation'
import type { Role } from '../../config/role-navigation'
import BreadcrumbNav from './trail-nav'
import UserMenu from './user-menu'
import { Bell, Menu, Cloud, CloudOff } from 'lucide-react'

interface AppHeaderProps {
  currentPage: Page
  onPageChange: (page: Page) => void
  user: { name: string; email: string; role: Role } | null
  onLogout: () => void
  onMobileMenuToggle: () => void
  isOnline?: boolean
}

export default function AppHeader({
  currentPage,
  onPageChange,
  user,
  onLogout,
  onMobileMenuToggle,
  isOnline = true
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 hidden h-16 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:flex lg:items-center lg:justify-between" aria-label="Header Aplikasi">
      <div className="flex min-w-0 items-center gap-3">
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 lg:hidden"
          type="button"
          onClick={onMobileMenuToggle}
          aria-label="Buka navigasi mobile"
        >
          <Menu size={20} />
        </button>
        
        {currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'resetPassword' && (
          <BreadcrumbNav currentPage={currentPage} />
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500" title={isOnline ? 'Terhubung dengan Convex (Online)' : 'Mode Offline'}>
          {isOnline ? (
            <Cloud size={16} className="text-emerald-700" />
          ) : (
            <CloudOff size={16} className="text-orange-600" />
          )}
        </div>

        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50" type="button" aria-label="Notifikasi">
          <Bell size={16} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white" />
        </button>

        <UserMenu user={user} onPageChange={onPageChange} onLogout={onLogout} />
      </div>
    </header>
  )
}
