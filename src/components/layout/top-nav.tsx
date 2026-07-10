import type { Page } from '../../config/navigation'
import type { Role } from '../../config/role-navigation'
import BreadcrumbNav from './trail-nav'
import UserMenu from './user-menu'
import { Bell, Menu } from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface AppHeaderProps {
  currentPage: Page
  onPageChange: (page: Page) => void
  user: { name: string; email: string; role: Role } | null
  onLogout: () => void
  onMobileMenuToggle: () => void
}

function formatNotificationTime(timestamp: number) {
  const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000))
  if (diffMinutes < 1) return 'Baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} jam lalu`
  return `${Math.floor(diffHours / 24)} hari lalu`
}

export default function AppHeader({
  currentPage,
  onPageChange,
  user,
  onLogout,
  onMobileMenuToggle,
}: AppHeaderProps) {
  const koperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const notifications = useQuery(
    api.notifications.listContractNotifications,
    koperasi?._id ? { koperasiId: koperasi._id } : 'skip',
  )
  const markRead = useMutation(api.notifications.markContractNotificationRead)
  const unreadCount = notifications?.filter((notification) => !notification.isRead).length ?? 0

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="relative h-10 w-10 rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
              size="icon"
              type="button"
              variant="outline"
              aria-label="Notifikasi"
            >
              <Bell size={16} />
              {unreadCount > 0 ? (
                <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-black leading-none text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-[90] w-80 bg-white">
            <DropdownMenuLabel className="flex items-center justify-between gap-3">
              <span>Notifikasi</span>
              <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-bold text-orange-700">{unreadCount} baru</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications === undefined ? (
              <DropdownMenuItem disabled>Memuat notifikasi...</DropdownMenuItem>
            ) : notifications.length === 0 ? (
              <DropdownMenuItem disabled>Tidak ada notifikasi penting.</DropdownMenuItem>
            ) : (
              notifications.slice(0, 8).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex cursor-pointer items-start gap-3 py-3"
                  onSelect={async () => {
                    if (!notification.isRead) {
                      await markRead({ notificationId: notification.id })
                    }
                    sessionStorage.setItem('agrego_selected_contract_id', notification.contractId)
                    onPageChange('contractDetail')
                  }}
                >
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.isRead ? 'bg-slate-300' : 'bg-orange-500'}`} />
                  <span className="grid gap-1">
                    <span className="text-sm font-black text-slate-900">{notification.title}</span>
                    <span className="line-clamp-2 text-xs font-medium text-slate-500">{notification.message}</span>
                    <span className="text-[11px] font-bold text-slate-400">{formatNotificationTime(notification.createdAt)}</span>
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <UserMenu user={user} onPageChange={onPageChange} onLogout={onLogout} />
      </div>
    </header>
  )
}
