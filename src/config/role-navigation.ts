import type { Page } from './navigation'

export type Role = 'Admin' | 'Koperasi' | 'Buyer' | 'Anggota'

// Allowed page IDs for each role
export const rolePermissions: Record<Role, (Page | 'logout')[]> = {
  Koperasi: [
    'dashboard',
    'newDeposit',
    'deposits',
    'qcForm',
    'qcHistory',
    'qcDepositDetail',
    'qcResultDetail',
    'allocation',
    'allocationStatus',
    'contracts',
    'newContract',
    'contractDetail',
    'depositReport',
    'profitShares',
    'profile',
    'members',
    'commodities',
    'cooperativeProfile',
    'logout'
  ],
  Buyer: [
    'dashboard',
    'contracts',
    'newContract',
    'contractDetail',
    'allocationStatus',
    'profile',
    'logout'
  ],
  Admin: [
    'dashboard',
    'cooperativeProfile',
    'commodities',
    'contracts',
    'contractDetail',
    'allocationStatus',
    'profile',
    'logout'
  ],
  Anggota: [
    'dashboard',
    'newDeposit',
    'deposits',
    'depositReport',
    'profitShares',
    'profile',
    'logout'
  ]
}

// Function to check if page is accessible by a role
export function isPageAllowed(role: Role | null, page: Page | 'logout'): boolean {
  if (!role) {
    // If not logged in, only auth pages are allowed
    return ['login', 'register', 'resetPassword'].includes(page)
  }
  const allowed = rolePermissions[role]
  return allowed ? allowed.includes(page) : false
}
