import { useState } from 'react'
import { useMutation } from 'convex/react'
import toast from 'react-hot-toast'
import { api } from '../../convex/_generated/api'
import type { Page } from '../config/navigation'
import BrandLoader from '../components/brand/brand-loader'
import BrandLogo from '../components/brand/brand-logo'
import { Building2, Briefcase, User, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const authIconClass = 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage({ goToPage }: { goToPage: (page: Page) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'cooperative' | 'buyer'>('cooperative')
  const [loading, setLoading] = useState(false)
  const registerUser = useMutation(api.auth.registerUser)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (normalizedName.length < 3 || !emailPattern.test(normalizedEmail)) {
      toast.error('Nama dan email harus valid.')
      return
    }
    if (password.length < 6 || password !== confirmPassword) {
      toast.error('Password minimal 6 karakter dan konfirmasi harus sama.')
      return
    }
    setLoading(true)
    try {
      await registerUser({
        name: normalizedName,
        email: normalizedEmail,
        password,
        role,
      })
      toast.success('Akun berhasil terdaftar. Silakan masuk.')
      setTimeout(() => {
        goToPage('login')
      }, 1500)
    } catch (err) {
      const message = (err as Error).message || ''
      toast.error(message.includes('Email sudah terdaftar') ? 'Email sudah terdaftar.' : 'Gagal mendaftar. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && <BrandLoader />}
      <Card className="w-full border-slate-200/80 shadow-xl shadow-slate-200/40">
        <CardHeader className="items-center px-6 pb-5 pt-7 text-center sm:px-8">
          <BrandLogo height={44} />
          <CardTitle className="mt-3 text-2xl font-black leading-tight text-slate-950">
            Mulai Bersama Agrego
          </CardTitle>
          <CardDescription className="max-w-sm text-base leading-relaxed">
            Satu platform terpadu untuk pengelola koperasi, anggota, dan mitra bisnis.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 sm:px-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label>Daftar Sebagai</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as 'cooperative' | 'buyer')}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <Label
                  htmlFor="role-cooperative"
                  className={`flex min-h-36 cursor-pointer flex-col rounded-lg border p-4 transition-colors ${
                    role === 'cooperative'
                      ? 'border-emerald-700 bg-emerald-50 text-slate-950'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Building2 className={role === 'cooperative' ? 'h-5 w-5 text-emerald-700' : 'h-5 w-5 text-slate-400'} />
                    <RadioGroupItem id="role-cooperative" value="cooperative" />
                  </div>
                  <span className="mt-3 text-sm font-black leading-tight">Koperasi (Produsen)</span>
                  <span className="mt-3 text-xs font-normal leading-relaxed text-slate-500">
                    Manajemen anggota, pencatatan setoran komoditas, verifikasi kualitas, dan bagi hasil otomatis.
                  </span>
                </Label>
                <Label
                  htmlFor="role-buyer"
                  className={`flex min-h-36 cursor-pointer flex-col rounded-lg border p-4 transition-colors ${
                    role === 'buyer'
                      ? 'border-emerald-700 bg-emerald-50 text-slate-950'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Briefcase className={role === 'buyer' ? 'h-5 w-5 text-emerald-700' : 'h-5 w-5 text-slate-400'} />
                    <RadioGroupItem id="role-buyer" value="buyer" />
                  </div>
                  <span className="mt-3 text-sm font-black leading-tight">Mitra Buyer (Pembeli)</span>
                  <span className="mt-3 text-xs font-normal leading-relaxed text-slate-500">
                    Pembelian komoditas langsung dari koperasi produsen, pemantauan alokasi, dan transparansi kontrak.
                  </span>
                </Label>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="register-name">Nama Lengkap</Label>
              <div className="relative">
                <User className={authIconClass} />
                <Input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  required
                  className="h-12 bg-slate-50 pl-10"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="register-email">Alamat Email</Label>
              <div className="relative">
                <Mail className={authIconClass} />
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Masukkan email aktif"
                  required
                  className="h-12 bg-slate-50 pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Lock className={authIconClass} />
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Min. 6 karakter"
                    required
                    className="h-12 bg-slate-50 pl-10"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="register-confirm-password">Konfirmasi</Label>
                <div className="relative">
                  <Lock className={authIconClass} />
                  <Input
                    id="register-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Ulangi password"
                    required
                    className="h-12 bg-slate-50 pl-10"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="mt-1 h-11 w-full font-extrabold">
              Daftar Akun Baru
              <ArrowRight />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center gap-1.5 border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          <span>Sudah memiliki akun?</span>
          <Button
            type="button"
            variant="link"
            onClick={() => goToPage('login')}
            className="h-auto px-0 py-0 font-bold text-emerald-700"
          >
            Masuk Sekarang
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
