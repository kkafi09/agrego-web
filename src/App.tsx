import { useState, type ReactElement } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'

import AppShell from './components/layout/app-shell'
import type { Page } from './config/navigation'
import { getPageFromPath, getPagePath } from './config/routes'
import {
  AllocationPage,
  AllocationStatusPage,
  CommoditiesPage,
  ContractDetailPage,
  ContractsPage,
  CooperativeProfilePage,
  DashboardPage,
  DepositHistoryPage,
  DepositReportPage,
  LoginPage,
  MembersPage,
  NewContractPage,
  NewDepositPage,
  ProfitSharesPage,
  ProfilePage,
  QcDepositDetailPage,
  QcFormPage,
  QcHistoryPage,
  QcResultDetailPage,
  RegisterPage,
  ResetPasswordPage,
  type DepositRecord,
  type MockUser,
} from './pages/app-pages'
import { initialDepositRecords } from './pages/page-data'

const authPages: Page[] = ['login', 'register', 'resetPassword']

function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const page = getPageFromPath(location.pathname)
  const [records, setRecords] = useState<DepositRecord[]>(initialDepositRecords)
  const [user, setUser] = useState<MockUser | null>(null)

  function goToPage(nextPage: Page) {
    navigate(getPagePath(nextPage))
  }

  function handleLogout() {
    setUser(null)
    goToPage('login')
  }

  function requireAuth(element: ReactElement) {
    return user || authPages.includes(page) ? element : <Navigate replace to={getPagePath('login')} />
  }

  return (
    <AppShell
      currentPage={page}
      onPageChange={goToPage}
      user={user}
      onLogout={handleLogout}
    >
      <Routes>
        <Route path={getPagePath('dashboard')} element={requireAuth(<DashboardPage />)} />
        <Route path={getPagePath('deposits')} element={requireAuth(<DepositHistoryPage records={records} />)} />
        <Route
          path={getPagePath('newDeposit')}
          element={requireAuth(
            <NewDepositPage
              onSave={(record) => {
                setRecords((current) => [record, ...current])
                goToPage('deposits')
              }}
            />,
          )}
        />
        <Route path={getPagePath('qcHistory')} element={requireAuth(<QcHistoryPage />)} />
        <Route path={getPagePath('qcDepositDetail')} element={requireAuth(<QcDepositDetailPage />)} />
        <Route path={getPagePath('qcForm')} element={requireAuth(<QcFormPage />)} />
        <Route path={getPagePath('qcResultDetail')} element={requireAuth(<QcResultDetailPage />)} />
        <Route path={getPagePath('allocation')} element={requireAuth(<AllocationPage />)} />
        <Route path={getPagePath('allocationStatus')} element={requireAuth(<AllocationStatusPage />)} />
        <Route path={getPagePath('contracts')} element={requireAuth(<ContractsPage goToPage={goToPage} />)} />
        <Route path={getPagePath('newContract')} element={requireAuth(<NewContractPage />)} />
        <Route path={getPagePath('contractDetail')} element={requireAuth(<ContractDetailPage />)} />
        <Route path={getPagePath('depositReport')} element={requireAuth(<DepositReportPage records={records} />)} />
        <Route path={getPagePath('profitShares')} element={requireAuth(<ProfitSharesPage />)} />
        <Route
          path={getPagePath('login')}
          element={
            <LoginPage
              onLogin={(nextUser) => {
                setUser(nextUser)
                goToPage('dashboard')
              }}
              goToPage={goToPage}
            />
          }
        />
        <Route path={getPagePath('register')} element={<RegisterPage goToPage={goToPage} />} />
        <Route path={getPagePath('resetPassword')} element={<ResetPasswordPage goToPage={goToPage} />} />
        <Route path={getPagePath('profile')} element={requireAuth(<ProfilePage user={user} onSave={setUser} />)} />
        <Route path={getPagePath('members')} element={requireAuth(<MembersPage />)} />
        <Route path={getPagePath('commodities')} element={requireAuth(<CommoditiesPage />)} />
        <Route path={getPagePath('cooperativeProfile')} element={requireAuth(<CooperativeProfilePage />)} />
        <Route path="*" element={<Navigate replace to={getPagePath('dashboard')} />} />
      </Routes>
    </AppShell>
  )
}

export default App
