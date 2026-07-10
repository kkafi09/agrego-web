import type { Page } from '../../config/navigation'
import type { Role } from '../../config/role-navigation'
import BreadcrumbNav from './breadcrumb-nav'
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
    <header className="app-header" aria-label="Header Aplikasi">
      <div className="header-left">
        <button
          className="mobile-menu-trigger"
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

      <div className="header-right">
        {/* Sync / PWA Status Indicator */}
        <div className="status-indicator" title={isOnline ? 'Terhubung dengan Convex (Online)' : 'Mode Offline'}>
          {isOnline ? (
            <Cloud size={16} className="text-success" />
          ) : (
            <CloudOff size={16} className="text-warning" />
          )}
        </div>

        {/* Notifications */}
        <button className="notifications-trigger" type="button" aria-label="Notifikasi">
          <Bell size={16} />
          <span className="notification-badge" />
        </button>

        {/* User Dropdown */}
        <UserMenu user={user} onPageChange={onPageChange} onLogout={onLogout} />
      </div>
    </header>
  )
}
