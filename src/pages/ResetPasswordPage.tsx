import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Page } from '../config/navigation'
import BrandLoader from '../components/brand/brand-loader'
import BrandLogo from '../components/brand/brand-logo'
import { Mail, Lock, ArrowRight } from 'lucide-react'

export function ResetPasswordPage({ goToPage }: { goToPage: (page: Page) => void }) {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const requestReset = useMutation(api.auth.requestPasswordReset)
  const resetPassword = useMutation(api.auth.resetPasswordWithToken)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.includes('@')) {
      setMessage('Masukkan email yang valid.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setMessage('Konfirmasi password belum sama.')
          setLoading(false)
          return
        }
        const token = await requestReset({ email })
        if (!token) {
          setMessage('Email tidak terdaftar.')
        } else {
          await resetPassword({ token, newPassword })
          setMessage('Password berhasil diperbarui! Silakan masuk kembali.')
        }
      } else {
        const token = await requestReset({ email })
        if (token) {
          setMessage(`Link reset berhasil dibuat! Token: ${token}`)
        } else {
          setMessage('Email tidak ditemukan.')
        }
      }
    } catch (err) {
      setMessage((err as Error).message || 'Terjadi kesalahan saat memproses reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && <BrandLoader />}
      <div className="flex flex-col items-center w-full mb-6 mt-4">
        <div className="mb-4">
          <BrandLogo height={44} />
        </div>
        <h1 className="!text-2xl !font-black !tracking-tight !text-slate-900 text-center !leading-snug !m-0">
          Pemulihan Akun Agrego
        </h1>
        <p className="!text-sm !text-slate-500 !mt-1.5 text-center !m-0 !leading-relaxed">
          Kami akan membantu Anda mengatur ulang kata sandi dengan aman.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/30 p-8 w-full flex flex-col gap-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Alamat Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Masukkan alamat email akun Anda"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#168a6a] focus:ring-4 focus:ring-[#168a6a]/10 transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Password Baru (Opsional)</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#168a6a] focus:ring-4 focus:ring-[#168a6a]/10 transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Konfirmasi</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#168a6a] focus:ring-4 focus:ring-[#168a6a]/10 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {message ? (
            <div className={`p-3 border rounded-xl text-xs font-semibold ${
              message.includes('berhasil') || message.includes('Token:')
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600 break-all' 
                : 'bg-red-50 border-red-100 text-red-600'
            }`}>
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#168a6a] hover:bg-[#116b52] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl shadow-md shadow-[#168a6a]/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            Kirim Instruksi
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex justify-center items-center gap-1.5 text-xs text-slate-500 border-t border-slate-50 pt-4 mt-1">
          <span>Kembali ke</span>
          <button
            type="button"
            onClick={() => goToPage('login')}
            className="font-bold text-[#168a6a] hover:underline cursor-pointer"
          >
            Halaman Masuk
          </button>
        </div>
      </div>
    </>
  )
}
