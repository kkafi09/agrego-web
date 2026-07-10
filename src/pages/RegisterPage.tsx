import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Page } from '../config/navigation'
import BrandLoader from '../components/brand/brand-loader'
import BrandLogo from '../components/brand/brand-logo'
import { Building2, Briefcase, User, Mail, Lock, ArrowRight } from 'lucide-react'

export function RegisterPage({ goToPage }: { goToPage: (page: Page) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'cooperative' | 'buyer'>('cooperative')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const registerUser = useMutation(api.auth.registerUser)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (name.trim().length < 3 || !email.includes('@')) {
      setMessage('Nama dan email harus valid.')
      return
    }
    if (password.length < 6 || password !== confirmPassword) {
      setMessage('Password minimal 6 karakter dan konfirmasi harus sama.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      await registerUser({
        name,
        email,
        password,
        role,
      })
      setMessage('Akun berhasil terdaftar! Mengalihkan ke halaman masuk...')
      setTimeout(() => {
        goToPage('login')
      }, 1500)
    } catch (err) {
      setMessage((err as Error).message || 'Gagal mendaftar. Silakan coba lagi.')
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
          Mulai Bersama Agrego
        </h1>
        <p className="!text-sm !text-slate-500 !mt-1.5 text-center !m-0 !leading-relaxed">
          Satu platform terpadu untuk pengelola koperasi, anggota, dan mitra bisnis.
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/30 p-8 w-full flex flex-col gap-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-700">Daftar Sebagai</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`flex flex-col items-start p-4 border rounded-xl transition-all duration-200 text-left cursor-pointer h-[155px] justify-between ${
                  role === 'cooperative'
                    ? 'border-[#168a6a] bg-[#f2f9f5] ring-2 ring-[#168a6a]/10'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50'
                }`}
                onClick={() => setRole('cooperative')}
              >
                <div>
                  <Building2 className={`w-5 h-5 mb-2 ${role === 'cooperative' ? 'text-[#168a6a]' : 'text-slate-400'}`} />
                  <span className="text-xs font-black text-slate-900 block leading-tight">Koperasi (Produsen)</span>
                </div>
                <span className="text-[9px] text-slate-500 leading-normal block mt-1">
                  Manajemen anggota, pencatatan setoran komoditas, verifikasi kualitas, dan bagi hasil otomatis.
                </span>
              </button>
              <button
                type="button"
                className={`flex flex-col items-start p-4 border rounded-xl transition-all duration-200 text-left cursor-pointer h-[155px] justify-between ${
                  role === 'buyer'
                    ? 'border-[#168a6a] bg-[#f2f9f5] ring-2 ring-[#168a6a]/10'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50'
                }`}
                onClick={() => setRole('buyer')}
              >
                <div>
                  <Briefcase className={`w-5 h-5 mb-2 ${role === 'buyer' ? 'text-[#168a6a]' : 'text-slate-400'}`} />
                  <span className="text-xs font-black text-slate-900 block leading-tight">Mitra Buyer (Pembeli)</span>
                </div>
                <span className="text-[9px] text-slate-500 leading-normal block mt-1">
                  Pembelian komoditas berkualitas tinggi langsung dari koperasi produsen, pemantauan alokasi, dan transparansi kontrak.
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Nama Lengkap</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#168a6a] focus:ring-4 focus:ring-[#168a6a]/10 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700">Alamat Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Masukkan email aktif"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#168a6a] focus:ring-4 focus:ring-[#168a6a]/10 transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Min. 6 karakter"
                  required
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
                  placeholder="Ulangi password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#168a6a] focus:ring-4 focus:ring-[#168a6a]/10 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {message ? (
            <div className={`p-3 border rounded-xl text-xs font-semibold ${
              message.includes('berhasil') 
                ? 'bg-[#eefcf5] border-emerald-100 text-emerald-600' 
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
            Daftar Akun Baru
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex justify-center items-center gap-1.5 text-xs text-slate-500 border-t border-slate-50 pt-4 mt-1">
          <span>Sudah memiliki akun?</span>
          <button
            type="button"
            onClick={() => goToPage('login')}
            className="font-bold text-[#168a6a] hover:underline cursor-pointer"
          >
            Masuk Sekarang
          </button>
        </div>
      </div>
    </>
  )
}
