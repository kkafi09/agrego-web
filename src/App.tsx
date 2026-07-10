import { useState, useEffect, type ReactElement } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../convex/_generated/api'
import { Toaster } from 'react-hot-toast'
import AppShell from './components/layout/shell'
import type { Page } from './config/navigation'
import { getPageFromPath, getPagePath } from './config/routes'
import {
    authTokenStorageKey,
    authUserStorageKey,
    mapBackendRole,
    type AuthUser,
} from './lib/auth'
import BrandLoader from './components/brand/brand-loader'
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
} from './pages'

const authPages: Page[] = ['login', 'register', 'resetPassword']

function App() {
    const location = useLocation()
    const navigate = useNavigate()
    const page = getPageFromPath(location.pathname)

    const [token, setToken] = useState<string | null>(() => localStorage.getItem(authTokenStorageKey))
    const [user, setUser] = useState<AuthUser | null>(() => {
        const saved = localStorage.getItem(authUserStorageKey)
        return saved ? JSON.parse(saved) : null
    })
    const [loading, setLoading] = useState(true)

    const currentUserData = useQuery(api.auth.getUserByToken, token ? { token } : 'skip')
    const logoutUser = useMutation(api.auth.logoutUser)

    useEffect(() => {
        if (token) {
            if (currentUserData === undefined) {
                setLoading(true)
            } else if (currentUserData === null) {
                localStorage.removeItem(authTokenStorageKey)
                localStorage.removeItem(authUserStorageKey)
                setToken(null)
                setUser(null)
                setLoading(false)
            } else {
                const mappedUser: AuthUser = {
                    id: currentUserData.id,
                    name: currentUserData.name,
                    email: currentUserData.email,
                    role: mapBackendRole(currentUserData.role),
                }
                setUser(mappedUser)
                localStorage.setItem(authUserStorageKey, JSON.stringify(mappedUser))
                setLoading(false)
            }
        } else {
            setLoading(false)
            setUser(null)
        }
    }, [token, currentUserData])

    function goToPage(nextPage: Page) {
        navigate(getPagePath(nextPage))
    }

    async function handleLogin(newToken: string, nextUser: AuthUser) {
        localStorage.setItem(authTokenStorageKey, newToken)
        localStorage.setItem(authUserStorageKey, JSON.stringify(nextUser))
        setToken(newToken)
        setUser(nextUser)
        goToPage('dashboard')
    }

    async function handleLogout() {
        if (token) {
            try {
                await logoutUser({ token })
            } catch (err) {
                console.error('Failed to revoke session on server:', err)
            }
        }
        localStorage.removeItem(authTokenStorageKey)
        localStorage.removeItem(authUserStorageKey)
        setToken(null)
        setUser(null)
        goToPage('login')
    }

    function requireAuth(element: ReactElement) {
        return user || authPages.includes(page) ? element : <Navigate replace to={getPagePath('login')} />
    }

    if (loading) {
        return <BrandLoader />
    }

    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3500,
                    style: {
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        color: '#0f172a',
                        fontWeight: 600,
                    },
                    success: {
                        iconTheme: {
                            primary: '#047857',
                            secondary: '#ffffff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#dc2626',
                            secondary: '#ffffff',
                        },
                    },
                }}
            />
            <AppShell
                currentPage={page}
                onPageChange={goToPage}
                user={user}
                onLogout={handleLogout}
            >
                <Routes>
                    <Route path={getPagePath('dashboard')} element={requireAuth(<DashboardPage />)} />
                    <Route path={getPagePath('deposits')} element={requireAuth(<DepositHistoryPage />)} />
                    <Route
                        path={getPagePath('newDeposit')}
                        element={requireAuth(<NewDepositPage goToPage={goToPage} />)}
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
                    <Route path={getPagePath('depositReport')} element={requireAuth(<DepositReportPage />)} />
                    <Route path={getPagePath('profitShares')} element={requireAuth(<ProfitSharesPage />)} />
                    <Route
                        path={getPagePath('login')}
                        element={
                            <LoginPage
                                onLogin={handleLogin}
                                goToPage={goToPage}
                            />
                        }
                    />
                    <Route path={getPagePath('register')} element={<RegisterPage goToPage={goToPage} />} />
                    <Route path={getPagePath('resetPassword')} element={<ResetPasswordPage goToPage={goToPage} />} />
                    <Route path={getPagePath('profile')} element={requireAuth(<ProfilePage user={user} onSave={setUser} />)} />
                    <Route path={getPagePath('members')} element={requireAuth(<MembersPage />)} />
                    <Route path={getPagePath('commodities')} element={requireAuth(<CommoditiesPage />)} />
                    <Route path={getPagePath('cooperativeProfile')} element={requireAuth(<CooperativeProfilePage user={user} />)} />
                    <Route path="*" element={<Navigate replace to={getPagePath('dashboard')} />} />
                </Routes>
            </AppShell>
        </>
    )
}

export default App
