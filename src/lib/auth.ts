import type { Role } from '../config/role-navigation'

export type BackendRole = 'admin' | 'cooperative' | 'buyer' | 'member'

export type AuthUser = {
  id?: string
  name: string
  email: string
  role: Role
}

export const authTokenStorageKey = 'agrego_auth_token'
export const authUserStorageKey = 'agrego_auth_user'

export function mapBackendRole(role: BackendRole): Role {
  if (role === 'admin') return 'Admin'
  if (role === 'cooperative') return 'Koperasi'
  if (role === 'buyer') return 'Buyer'
  return 'Anggota'
}

export function mapFrontendRole(role: Role): BackendRole {
  if (role === 'Admin') return 'admin'
  if (role === 'Koperasi') return 'cooperative'
  if (role === 'Buyer') return 'buyer'
  return 'member'
}
