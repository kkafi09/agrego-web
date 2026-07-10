import type { Page } from '../../config/navigation'
import type { Role } from '../../config/role-navigation'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

interface UserMenuProps {
  user: { name: string; email: string; role: Role } | null
  onPageChange: (page: Page) => void
  onLogout: () => void
}

export default function UserMenu({ user, onPageChange, onLogout }: UserMenuProps) {
  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-10 gap-2 rounded-lg border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          variant="outline"
          type="button"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-xs font-black text-white" aria-hidden="true">
            {initials}
          </div>
          <span className="hidden max-w-36 truncate xl:inline">{user.name}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="grid gap-1">
          <span className="truncate text-sm font-black text-slate-950">{user.name}</span>
          <span className="truncate text-xs font-medium text-slate-500">{user.email}</span>
          <span className="mt-1 w-fit rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{user.role}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onPageChange('profile')}>
          <User size={14} />
          <span>Profil Saya</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onLogout()}>
          <LogOut size={14} />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
