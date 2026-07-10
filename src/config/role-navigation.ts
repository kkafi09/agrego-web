import type { Page } from './navigation'

export type Role = 'Admin' | 'Koperasi' | 'Buyer'

// Allowed page IDs for each role
export const rolePermissions: Record<Role, Page[]> = {
  Koperasi: [
    'dashboard',
    'newDeposit',
    'deposits',
    'qcForm',
    'qcHistory',
    'qcDepositDetail',
    'qcResultDetail',
    'contracts',
    'contractDetail',
    'members',
    'commodities',
    'cooperativeProfile'
  ],
  Buyer: [
    'dashboard',
    'contracts',
    'newContract',
    'contractDetail',
    'profile'
  ],
  Admin: [
    'dashboard',
    'cooperativeProfile',
    'commodities',
    'contracts',
    'contractDetail',
    'profile'
  ]
}

// Function to check if page is accessible by a role
export function isPageAllowed(role: Role | null, page: Page): boolean {
  if (!role) {
    // If not logged in, only auth pages are allowed
    return ['login', 'register', 'resetPassword'].includes(page)
  }
  const allowed = rolePermissions[role]
  return allowed ? allowed.includes(page) : false
}
