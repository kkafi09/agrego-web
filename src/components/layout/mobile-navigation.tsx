import { navigationGroups, type Page } from '../../config/navigation'
import { rolePermissions, type Role } from '../../config/role-navigation'
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  FileSpreadsheet,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface MobileNavigationProps {
  currentPage: Page
  onPageChange: (page: Page) => void
  user: { name: string; email: string; role: Role } | null
  onLogout: () => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function MobileNavigation({
  currentPage,
  onPageChange,
  user,
  onLogout,
  isOpen,
  setIsOpen
}: MobileNavigationProps) {
  if (!user) return null

  const allowed = rolePermissions[user.role]

  // Check if a bottom navigation tab is active
  const isTabActive = (tab: 'dashboard' | 'setoran' | 'qc' | 'kontrak') => {
    switch (tab) {
      case 'dashboard':
        return currentPage === 'dashboard'
      case 'setoran':
        return currentPage === 'deposits' || currentPage === 'newDeposit'
      case 'qc':
        return currentPage === 'qcHistory' || currentPage === 'qcForm' || currentPage === 'qcDepositDetail' || currentPage === 'qcResultDetail'
      case 'kontrak':
        return currentPage === 'contracts' || currentPage === 'newContract' || currentPage === 'contractDetail'
      default:
        return false
    }
  }

  // Filter groups for full menu drawer
  const getFilteredGroups = () => {
    return navigationGroups
      .map((group) => {
        const filteredItems = group.items.filter((item) => allowed.includes(item.id))
        return { ...group, items: filteredItems }
      })
      .filter((group) => group.items.length > 0)
  }

  const filteredGroups = getFilteredGroups()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {/* Mobile Top Sticky Bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden" aria-label="Header Mobile">
        <span className="text-base font-black text-[#0B2F15]">AGREGO</span>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-xs font-black text-white"
          type="button"
          onClick={() => onPageChange('profile')}
          aria-label="Profil saya"
        >
          <div>{getInitials(user.name)}</div>
        </button>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden" aria-label="Navigasi Bawah">
        <button
          className={cn('flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-bold transition', isTabActive('dashboard') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500')}
          type="button"
          onClick={() => onPageChange('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        {allowed.includes('deposits') && (
          <button
          className={cn('flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-bold transition', isTabActive('setoran') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500')}
            type="button"
            onClick={() => onPageChange('deposits')}
          >
            <Package size={20} />
            <span>Setoran</span>
          </button>
        )}

        {allowed.includes('qcHistory') && (
          <button
            className={cn('flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-bold transition', isTabActive('qc') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500')}
            type="button"
            onClick={() => onPageChange('qcHistory')}
          >
            <ClipboardList size={20} />
            <span>QC</span>
          </button>
        )}

        {allowed.includes('contracts') && (
          <button
            className={cn('flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-bold transition', isTabActive('kontrak') ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500')}
            type="button"
            onClick={() => onPageChange('contracts')}
          >
            <FileSpreadsheet size={20} />
            <span>Kontrak</span>
          </button>
        )}

        <button
          className={cn('flex min-w-0 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-bold transition', isOpen ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500')}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Menu lainnya"
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>

      {/* Mobile Sidebar Overlay Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <span className="block text-lg font-black text-[#0B2F15]">AGREGO</span>
                <span className="block text-xs font-semibold text-slate-500">Collective Supply Platform</span>
              </div>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredGroups.map((group) => (
                <div key={group.label} className="mb-5">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.16em] text-slate-400">{group.label}</span>
                  <div className="grid gap-1">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const isActive = currentPage === item.id
                      return (
                        <button
                          key={item.id}
                          className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition', isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50')}
                          type="button"
                          onClick={() => {
                            setIsOpen(false)
                            if (item.id === 'logout') {
                              onLogout()
                            } else {
                              onPageChange(item.id)
                            }
                          }}
                        >
                          <Icon size={18} className="shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-700 text-sm font-black text-white">{getInitials(user.name)}</div>
                <div className="min-w-0">
                  <span className="block truncate text-sm font-black text-slate-950">{user.name}</span>
                  <span className="block text-xs font-semibold text-slate-500">{user.role}</span>
                </div>
              </div>
              <button
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-bold text-rose-700"
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onLogout()
                }}
              >
                <LogOut size={16} />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
