import { useState } from 'react'
import { useMutation } from 'convex/react'
import toast from 'react-hot-toast'
import { api } from '../../convex/_generated/api'
import type { Page } from '../config/navigation'
import { mapBackendRole, type AuthUser } from '../lib/auth'
import BrandLoader from '../components/brand/brand-loader'
import BrandLogo from '../components/brand/brand-logo'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const authIconClass = 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage({ onLogin, goToPage }: { onLogin: (token: string, user: AuthUser) => void; goToPage: (page: Page) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const loginUser = useMutation(api.auth.loginUser)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!emailPattern.test(normalizedEmail) || password.length < 6) {
      toast.error('Email harus valid dan password minimal 6 karakter.')
      return
    }
    setLoading(true)
    try {
      const result = await loginUser({ email: normalizedEmail, password })
      const frontendUser: AuthUser = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: mapBackendRole(result.user.role),
      }
      toast.success('Berhasil masuk. Mengalihkan ke dashboard...')
      onLogin(result.token, frontendUser)
    } catch (err) {
      const message = (err as Error).message || ''
      toast.error(message.includes('Email atau password') ? 'Email atau password tidak valid.' : 'Gagal masuk. Silakan coba lagi.')
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
            Selamat Datang di Agrego
          </CardTitle>
          <CardDescription className="max-w-sm text-base leading-relaxed">
            Sistem Manajemen Koperasi Digital Terintegrasi. Masuk ke akun Anda untuk mulai mengelola operasional.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 sm:px-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="login-email">Alamat Email</Label>
              <div className="relative">
                <Mail className={authIconClass} />
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Masukkan alamat email Anda"
                  required
                  className="h-12 bg-slate-50 pl-10"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="login-password">Password</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => goToPage('resetPassword')}
                  className="h-auto px-0 py-0 text-xs font-bold text-emerald-700"
                >
                  Lupa password?
                </Button>
              </div>
              <div className="relative">
                <Lock className={authIconClass} />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan kata sandi"
                  required
                  className="h-12 bg-slate-50 pl-10 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="mt-1 h-11 w-full font-extrabold">
              Masuk ke Sistem
              <ArrowRight />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center gap-1.5 border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          <span>Belum memiliki akun?</span>
          <Button
            type="button"
            variant="link"
            onClick={() => goToPage('register')}
            className="h-auto px-0 py-0 font-bold text-emerald-700"
          >
            Daftar Baru
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
