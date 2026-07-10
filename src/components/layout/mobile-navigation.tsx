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
      <div className="mobile-top-bar" aria-label="Header Mobile">
        <span className="mobile-brand">AGREGO</span>
        <button
          className="mobile-avatar-btn"
          type="button"
          onClick={() => onPageChange('profile')}
          aria-label="Profil saya"
        >
          <div className="mobile-avatar">{getInitials(user.name)}</div>
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Navigasi Bawah">
        <button
          className={`mobile-nav-btn ${isTabActive('dashboard') ? 'active' : ''}`}
          type="button"
          onClick={() => onPageChange('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        {allowed.includes('deposits') && (
          <button
            className={`mobile-nav-btn ${isTabActive('setoran') ? 'active' : ''}`}
            type="button"
            onClick={() => onPageChange('deposits')}
          >
            <Package size={20} />
            <span>Setoran</span>
          </button>
        )}

        {allowed.includes('qcHistory') && (
          <button
            className={`mobile-nav-btn ${isTabActive('qc') ? 'active' : ''}`}
            type="button"
            onClick={() => onPageChange('qcHistory')}
          >
            <ClipboardList size={20} />
            <span>QC</span>
          </button>
        )}

        {allowed.includes('contracts') && (
          <button
            className={`mobile-nav-btn ${isTabActive('kontrak') ? 'active' : ''}`}
            type="button"
            onClick={() => onPageChange('contracts')}
          >
            <FileSpreadsheet size={20} />
            <span>Kontrak</span>
          </button>
        )}

        <button
          className={`mobile-nav-btn ${isOpen ? 'active' : ''}`}
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
        <div className="mobile-drawer-overlay" onClick={() => setIsOpen(false)}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-brand">
                <span className="drawer-brand-logo">AGREGO</span>
                <span className="drawer-brand-sub">Collective Supply Platform</span>
              </div>
              <button
                className="mobile-drawer-close"
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-content">
              {filteredGroups.map((group) => (
                <div key={group.label} className="drawer-nav-group">
                  <span className="drawer-group-label">{group.label}</span>
                  <div className="drawer-group-items">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const isActive = currentPage === item.id
                      return (
                        <button
                          key={item.id}
                          className={`drawer-item-btn ${isActive ? 'active' : ''}`}
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
                          <Icon size={18} className="drawer-item-icon" />
                          <span>{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mobile-drawer-footer">
              <div className="drawer-user-info">
                <div className="drawer-avatar">{getInitials(user.name)}</div>
                <div className="drawer-user-details">
                  <span className="drawer-user-name">{user.name}</span>
                  <span className="drawer-user-role">{user.role}</span>
                </div>
              </div>
              <button
                className="drawer-logout-btn"
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
