import { useState } from 'react'
import type { Page } from '../../config/navigation'
import type { Role } from '../../config/role-navigation'
import AppSidebar from './side-nav'
import AppHeader from './top-nav'
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
  const isScrollableAuthPage = currentPage === 'register'

  // Renders login/register screens clean without sidebar/headers
  if (isAuthPage || !user) {
    return (
      <div
        className={`flex min-h-screen min-h-svh justify-center bg-[#fcfdfa] px-4 sm:px-6 ${
          isScrollableAuthPage ? 'items-start py-6 sm:py-10' : 'items-center py-6'
        }`}
      >
        <main className={`flex w-full flex-col gap-2 ${isScrollableAuthPage ? 'max-w-[560px]' : 'max-w-[440px]'}`}>
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700 lg:flex">
      <AppSidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        user={user}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className={`min-w-0 flex-1 transition-[padding] duration-300 ${isCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'}`}>
        <AppHeader
          currentPage={currentPage}
          onPageChange={onPageChange}
          user={user}
          onLogout={onLogout}
          onMobileMenuToggle={() => setIsMobileMenuOpen(true)}
        />

        <main className="min-h-[calc(100vh-64px)] px-4 pb-24 pt-4 sm:px-6 lg:pb-8 lg:pt-6">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>

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
