import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Page } from '../config/navigation'
import { mapBackendRole, type AuthUser } from '../lib/auth'
import BrandLoader from '../components/brand/brand-loader'
import BrandLogo from '../components/brand/brand-logo'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'

export function LoginPage({ onLogin, goToPage }: { onLogin: (token: string, user: AuthUser) => void; goToPage: (page: Page) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const loginUser = useMutation(api.auth.loginUser)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.includes('@') || password.length < 6) {
      setError('Email harus valid dan password minimal 6 karakter.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await loginUser({ email, password })
      const frontendUser: AuthUser = {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: mapBackendRole(result.user.role),
      }
      onLogin(result.token, frontendUser)
    } catch (err) {
      setError((err as Error).message || 'Gagal masuk. Silakan periksa kembali email dan password Anda.')
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
          Selamat Datang di Agrego
        </h1>
        <p className="!text-sm !text-slate-500 !mt-1.5 text-center !m-0 !leading-relaxed">
          Sistem Manajemen Koperasi Digital Terintegrasi. Masuk ke akun Anda untuk mulai mengelola operasional.
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
                placeholder="Masukkan alamat email Anda"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#168a6a] focus:ring-4 focus:ring-[#168a6a]/10 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => goToPage('resetPassword')}
                className="text-xs font-bold text-[#168a6a] hover:underline cursor-pointer"
              >
                Lupa password?
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan kata sandi"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#168a6a] focus:ring-4 focus:ring-[#168a6a]/10 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#168a6a] hover:bg-[#116b52] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-xl shadow-md shadow-[#168a6a]/10 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-0"
          >
            Masuk ke Sistem
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex justify-center items-center gap-1.5 text-xs text-slate-500 border-t border-slate-50 pt-4 mt-1">
          <span>Belum memiliki akun?</span>
          <button
            type="button"
            onClick={() => goToPage('register')}
            className="font-bold text-[#168a6a] hover:underline cursor-pointer"
          >
            Daftar Baru
          </button>
        </div>
      </div>
    </>
  )
}
