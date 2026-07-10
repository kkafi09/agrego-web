import type { Page } from '../../config/navigation'
import type { Role } from '../../config/role-navigation'
import BreadcrumbNav from './trail-nav'
import { Menu } from 'lucide-react'

interface AppHeaderProps {
  currentPage: Page
  onPageChange: (page: Page) => void
  user: { name: string; email: string; role: Role } | null
  onLogout: () => void
  onMobileMenuToggle: () => void
}

export default function AppHeader({
  currentPage,
  onMobileMenuToggle,
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

      <div />
    </header>
  )
}
