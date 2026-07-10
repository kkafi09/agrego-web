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
    <div className="user-menu-container" ref={menuRef}>
      <button
        className="user-menu-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="header-avatar" aria-hidden="true">
          {getInitials(user.name)}
        </div>
        <span className="header-username">{user.name}</span>
        <ChevronDown size={14} className="header-chevron" />
      </button>

      {isOpen && (
        <div className="header-dropdown-menu" role="menu">
          <div className="dropdown-user-info">
            <span className="dropdown-name">{user.name}</span>
            <span className="dropdown-email">{user.email}</span>
            <span className="dropdown-role">{user.role}</span>
          </div>
          <div className="dropdown-divider" />
          <button
            className="dropdown-item"
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
          <div className="dropdown-divider" />
          <button
            className="dropdown-item text-danger"
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
