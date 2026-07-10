import { useState } from 'react'
import { navigationGroups, type Page } from '../../config/navigation'
import { rolePermissions, type Role } from '../../config/role-navigation'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'
import BrandLogo from '../brand/brand-logo'

interface AppSidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
  user: { name: string; email: string; role: Role } | null
  onLogout: () => void
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export default function AppSidebar({
  currentPage,
  onPageChange,
  user,
  onLogout,
  isCollapsed,
  setIsCollapsed
}: AppSidebarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Filter items based on active role
  const getFilteredGroups = () => {
    if (!user) return []
    const allowed = rolePermissions[user.role]
    return navigationGroups
      .map((group) => {
        const filteredItems = group.items.filter((item) => allowed.includes(item.id))
        return { ...group, items: filteredItems }
      })
      .filter((group) => group.items.length > 0)
  }

  const filteredGroups = getFilteredGroups()

  // Get user avatar initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-40 hidden border-r border-white/10 bg-[#0B2F15] text-white shadow-2xl transition-[width] duration-300 lg:flex lg:flex-col',
      isCollapsed ? 'w-[72px]' : 'w-64',
    )} aria-label="Sidebar Utama">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        {!isCollapsed && <BrandLogo height={34} className="max-w-[170px] brightness-0 invert" />}
        {isCollapsed && (
          <img src="/brand/agrego-brand-mark.svg" alt="Agrego" className="h-10 w-10 object-contain" />
        )}
        <button
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10 hover:text-white"
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Perluas sidebar' : 'Sembunyikan sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {filteredGroups.map((group) => (
          <div key={group.label} className="mb-5">
            {!isCollapsed && <span className="mb-2 block px-3 text-[11px] font-black uppercase tracking-[0.16em] text-white/35">{group.label}</span>}
            <div className="grid gap-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    className={cn(
                      'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-bold transition',
                      isCollapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-white text-[#0B2F15] shadow-sm'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )}
                    type="button"
                    onClick={() => onPageChange(item.id)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="shrink-0" size={18} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {user && (
        <div className="border-t border-white/10 p-3">
          <div className="relative">
            <button
              className={cn(
                'flex w-full items-center gap-3 rounded-xl bg-white/5 p-2 text-left transition hover:bg-white/10',
                isCollapsed && 'justify-center',
              )}
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-haspopup="true"
              aria-expanded={showUserMenu}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-sm font-black text-white" aria-hidden="true">
                {getInitials(user.name)}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <span className="block truncate text-sm font-black text-white">{user.name}</span>
                  <span className="block text-xs font-semibold text-white/50">{user.role}</span>
                </div>
              )}
            </button>
            {showUserMenu && (
              <div className={cn(
                'absolute bottom-14 z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xl',
                isCollapsed ? 'left-12' : 'left-0',
              )} role="menu">
                <button
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    onLogout()
                    setShowUserMenu(false)
                  }}
                >
                  <LogOut size={14} />
                  <span>Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
