import {
  LayoutDashboard,
  PackagePlus,
  History,
  ClipboardCheck,
  ClipboardList,
  Boxes,
  Warehouse,
  FileSpreadsheet,
  FilePlus,
  FileText,
  HandCoins,
  Users,
  Wheat,
  Building2,
  User,
  LogOut
} from 'lucide-react'
import type { ComponentType } from 'react'

export type Page =
  | 'dashboard'
  | 'deposits'
  | 'newDeposit'
  | 'qcHistory'
  | 'qcDepositDetail'
  | 'qcForm'
  | 'qcResultDetail'
  | 'allocation'
  | 'allocationStatus'
  | 'contracts'
  | 'newContract'
  | 'contractDetail'
  | 'depositReport'
  | 'profitShares'
  | 'login'
  | 'register'
  | 'resetPassword'
  | 'profile'
  | 'members'
  | 'commodities'
  | 'cooperativeProfile'

export interface NavigationItem {
  id: Page | 'logout'
  label: string
  icon: ComponentType<any>
}

export interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ]
  },
  {
    label: 'OPERASIONAL',
    items: [
      { id: 'newDeposit', label: 'Setoran Baru', icon: PackagePlus },
      { id: 'deposits', label: 'Riwayat Setoran', icon: History },
      { id: 'qcForm', label: 'Quality Control', icon: ClipboardCheck },
      { id: 'qcHistory', label: 'Riwayat QC', icon: ClipboardList },
      { id: 'allocation', label: 'Alokasi Stok', icon: Boxes },
      { id: 'allocationStatus', label: 'Status Alokasi', icon: Warehouse }
    ]
  },
  {
    label: 'KONTRAK',
    items: [
      { id: 'contracts', label: 'Daftar Kontrak', icon: FileSpreadsheet },
      { id: 'newContract', label: 'Kontrak Baru', icon: FilePlus }
    ]
  },
  {
    label: 'KEUANGAN',
    items: [
      { id: 'depositReport', label: 'Laporan Setoran', icon: FileText },
      { id: 'profitShares', label: 'Bagi Hasil', icon: HandCoins }
    ]
  },
  {
    label: 'DATA MASTER',
    items: [
      { id: 'members', label: 'Anggota', icon: Users },
      { id: 'commodities', label: 'Komoditas', icon: Wheat },
      { id: 'cooperativeProfile', label: 'Profil Koperasi', icon: Building2 }
    ]
  },
  {
    label: 'AKUN',
    items: [
      { id: 'profile', label: 'Profil', icon: User },
      { id: 'logout', label: 'Logout', icon: LogOut }
    ]
  }
]
