import type { Page } from './navigation'

export const pagePaths: Record<Page, string> = {
  dashboard: '/',
  deposits: '/deposits',
  newDeposit: '/deposits/new',
  qcHistory: '/quality-check/history',
  qcDepositDetail: '/quality-check/deposit',
  qcForm: '/quality-check/form',
  qcResultDetail: '/quality-check/result',
  allocation: '/allocation',
  allocationStatus: '/allocation/status',
  contracts: '/contracts',
  newContract: '/contracts/new',
  contractDetail: '/contracts/detail',
  depositReport: '/reports/deposits',
  profitShares: '/reports/profit-shares',
  login: '/login',
  register: '/register',
  resetPassword: '/reset-password',
  profile: '/profile',
  members: '/master/members',
  commodities: '/master/commodities',
  cooperativeProfile: '/master/cooperative-profile',
}

const pathPages = Object.fromEntries(
  Object.entries(pagePaths).map(([page, path]) => [path, page]),
) as Record<string, Page>

export function getPagePath(page: Page) {
  return pagePaths[page]
}

export function getPageFromPath(pathname: string): Page {
  return pathPages[pathname] ?? 'dashboard'
}
