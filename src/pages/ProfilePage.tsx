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
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Profil</p>
          <h1>Pengaturan profil</h1>
        </div>
      </header>
      <section className="form-workspace">
        <form className="panel deposit-form" onSubmit={handleSubmit}>
          <div className="section-heading">
            <p className="eyebrow">Profil Pengguna</p>
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
          <button className="primary-action" type="submit" disabled={loading}>
            Simpan Profil
          </button>
          {saved ? <p className="success-note">Profil berhasil diperbarui.</p> : null}
          {error ? <small className="field-error">{error}</small> : null}
        </form>
      </section>
    </>
  )
}
