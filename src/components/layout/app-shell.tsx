import { useState } from 'react'
import type { Page } from '../../config/navigation'
import type { Role } from '../../config/role-navigation'
import AppSidebar from './app-sidebar'
import AppHeader from './app-header'
import MobileNavigation from './mobile-navigation'
import PageContainer from './page-container'

interface AppShellProps {
  children: React.ReactNode
  currentPage: Page
  onPageChange: (page: Page) => void
  user: { name: string; email: string; role: Role } | null
  onLogout: () => void
}

export default function AppShell({
  children,
  currentPage,
  onPageChange,
  user,
  onLogout
}: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isAuthPage = ['login', 'register', 'resetPassword'].includes(currentPage)

  // Renders login/register screens clean without sidebar/headers
  if (isAuthPage || !user) {
    return (
      <div className="min-h-screen min-h-svh flex items-center justify-center bg-[#fcfdfa] p-6">
        <main className="w-full max-w-[440px] flex flex-col gap-2">{children}</main>
      </div>
    )
  }

  return (
    <div className={`app-layout-shell ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Desktop Sidebar */}
      <AppSidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        user={user}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Wrapper (Header + Main Content) */}
      <div className="app-main-wrapper">
        {/* Desktop Header */}
        <AppHeader
          currentPage={currentPage}
          onPageChange={onPageChange}
          user={user}
          onLogout={onLogout}
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        />

        {/* Main Content Area */}
        <main className="app-content-area">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>

      {/* Mobile Navigation (Bottom Nav + Overlay Drawer) */}
      <MobileNavigation
        currentPage={currentPage}
        onPageChange={onPageChange}
        user={user}
        onLogout={onLogout}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />
    </div>
  )
}
