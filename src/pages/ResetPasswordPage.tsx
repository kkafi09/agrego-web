import { useState } from 'react'
import { useMutation } from 'convex/react'
import toast from 'react-hot-toast'
import { api } from '../../convex/_generated/api'
import type { Page } from '../config/navigation'
import BrandLoader from '../components/brand/brand-loader'
import BrandLogo from '../components/brand/brand-logo'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const authIconClass = 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ResetPasswordPage({ goToPage }: { goToPage: (page: Page) => void }) {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const requestReset = useMutation(api.auth.requestPasswordReset)
  const resetPassword = useMutation(api.auth.resetPasswordWithToken)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!emailPattern.test(normalizedEmail)) {
      toast.error('Masukkan email yang valid.')
      return
    }

    setLoading(true)
    try {
      if (newPassword) {
        if (newPassword.length < 6) {
          toast.error('Password baru minimal 6 karakter.')
          return
        }

        if (newPassword !== confirmPassword) {
          toast.error('Konfirmasi password belum sama.')
          return
        }

        const token = await requestReset({ email: normalizedEmail })
        if (!token) {
          toast.error('Email tidak terdaftar.')
          return
        }

        await resetPassword({ token, newPassword })
        toast.success('Password berhasil diperbarui. Silakan masuk kembali.')
        goToPage('login')
        return
      }

      const token = await requestReset({ email: normalizedEmail })
      if (token) {
        toast.success(`Token reset dibuat: ${token}`, { duration: 7000 })
      } else {
        toast.error('Email tidak ditemukan.')
      }
    } catch (err) {
      toast.error((err as Error).message || 'Terjadi kesalahan saat memproses reset password.')
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
            Pemulihan Akun Agrego
          </CardTitle>
          <CardDescription className="max-w-sm text-base leading-relaxed">
            Kami akan membantu Anda mengatur ulang kata sandi dengan aman.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 sm:px-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="reset-email">Alamat Email</Label>
              <div className="relative">
                <Mail className={authIconClass} />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Masukkan alamat email akun Anda"
                  required
                  className="h-12 bg-slate-50 pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="reset-new-password">Password Baru</Label>
                <div className="relative">
                  <Lock className={authIconClass} />
                  <Input
                    id="reset-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Opsional"
                    className="h-12 bg-slate-50 pl-10"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reset-confirm-password">Konfirmasi</Label>
                <div className="relative">
                  <Lock className={authIconClass} />
                  <Input
                    id="reset-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Ulangi password"
                    className="h-12 bg-slate-50 pl-10"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="mt-1 h-11 w-full font-extrabold">
              Kirim Instruksi
              <ArrowRight />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center gap-1.5 border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          <span>Kembali ke</span>
          <Button
            type="button"
            variant="link"
            onClick={() => goToPage('login')}
            className="h-auto px-0 py-0 font-bold text-emerald-700"
          >
            Halaman Masuk
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}
