import type { Page } from '../../config/navigation'

interface BreadcrumbNavProps {
  currentPage: Page
  onPageChange?: (page: Page) => void
}

const breadcrumbMap: Record<Page, string[]> = {
  dashboard: ['Overview', 'Dashboard'],
  deposits: ['Operasional', 'Riwayat Setoran'],
  newDeposit: ['Operasional', 'Setoran Baru'],
  qcHistory: ['Operasional', 'Riwayat QC'],
  qcDepositDetail: ['Operasional', 'Quality Control', 'Detail Setoran QC'],
  qcForm: ['Operasional', 'Quality Control', 'Form QC'],
  qcResultDetail: ['Operasional', 'Quality Control', 'Detail Hasil QC'],
  allocation: ['Operasional', 'Alokasi Stok'],
  allocationStatus: ['Operasional', 'Status Alokasi'],
  contracts: ['Kontrak', 'Daftar Kontrak'],
  newContract: ['Kontrak', 'Kontrak Baru'],
  contractDetail: ['Kontrak', 'Detail Kontrak'],
  depositReport: ['Keuangan', 'Laporan Setoran'],
  profitShares: ['Keuangan', 'Bagi Hasil'],
  login: ['Autentikasi', 'Login'],
  register: ['Autentikasi', 'Register'],
  resetPassword: ['Autentikasi', 'Reset Password'],
  profile: ['Akun', 'Profil'],
  members: ['Data Master', 'Anggota'],
  commodities: ['Data Master', 'Komoditas'],
  cooperativeProfile: ['Data Master', 'Profil Koperasi']
}

export default function BreadcrumbNav({ currentPage }: BreadcrumbNavProps) {
  const paths = breadcrumbMap[currentPage] || ['Home']

  return (
    <nav className="breadcrumb-nav" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1
          return (
            <li key={path} className={`breadcrumb-item ${isLast ? 'active' : ''}`}>
              {index > 0 && <span className="breadcrumb-separator">/</span>}
              <span className="breadcrumb-text">{path}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
