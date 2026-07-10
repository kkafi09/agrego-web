import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { AuthUser } from '../lib/auth'
import BrandLoader from '../components/brand/brand-loader'

export function ProfilePage({
  user,
  onSave,
}: {
  user: AuthUser | null
  onSave: (user: AuthUser) => void
}) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const updateUserProfile = useMutation(api.auth.updateUserProfile)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user?.id) return
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      await updateUserProfile({
        userId: user.id as any,
        name,
        email,
      })
      const updatedUser = { ...user, name, email }
      onSave(updatedUser)
      setSaved(true)
    } catch (err) {
      setError((err as Error).message || 'Gagal menyimpan profil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && <BrandLoader />}
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Profil</p>
          <h1>Pengaturan profil</h1>
        </div>
      </header>
      <section className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
        <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Profil Pengguna</p>
            <h2>Data akun aktif</h2>
          </div>
          <label>
            <span>Nama</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            <span>Email</span>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </label>
          <label>
            <span>Role</span>
            <input
              value={user?.role ?? ''}
              disabled
              className="bg-slate-100 opacity-60 cursor-not-allowed border border-slate-200 rounded-lg h-[42px] px-3 font-semibold text-sm text-slate-600"
            />
          </label>
          <button className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={loading}>
            Simpan Profil
          </button>
          {saved ? <p className="text-sm font-bold text-emerald-700">Profil berhasil diperbarui.</p> : null}
          {error ? <small className="text-xs font-semibold text-rose-600">{error}</small> : null}
        </form>
      </section>
    </>
  )
}
