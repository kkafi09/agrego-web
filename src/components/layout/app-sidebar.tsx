import { useState } from 'react'
import { navigationGroups, type Page } from '../../config/navigation'
import { rolePermissions, type Role } from '../../config/role-navigation'
import { LogOut, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react'

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
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Sidebar Utama">
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-brand">
            <span className="brand-logo">AGREGO</span>
            <span className="brand-subtitle">Collective Supply Platform</span>
          </div>
        )}
        {isCollapsed && (
          <div className="sidebar-brand-collapsed">
            AG
          </div>
        )}
        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Perluas sidebar' : 'Sembunyikan sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredGroups.map((group) => (
          <div key={group.label} className="nav-group">
            {!isCollapsed && <span className="nav-group-label">{group.label}</span>}
            <div className="nav-group-items">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    className={`nav-item-btn ${isActive ? 'active' : ''}`}
                    type="button"
                    onClick={() => {
                      if (item.id === 'logout') {
                        onLogout()
                      } else {
                        onPageChange(item.id)
                      }
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="nav-item-icon" size={18} />
                    {!isCollapsed && <span className="nav-item-text">{item.label}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="user-profile-trigger">
            <button
              className="user-profile-btn"
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-haspopup="true"
              aria-expanded={showUserMenu}
            >
              <div className="user-avatar" aria-hidden="true">
                {getInitials(user.name)}
              </div>
              {!isCollapsed && (
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              )}
            </button>
            {showUserMenu && (
              <div className="user-menu-popover" role="menu">
                <button
                  className="popover-item"
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    onPageChange('profile')
                    setShowUserMenu(false)
                  }}
                >
                  <UserIcon size={14} />
                  <span>Profil Saya</span>
                </button>
                <div className="popover-divider" />
                <button
                  className="popover-item text-danger"
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
