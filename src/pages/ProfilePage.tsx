import { useState } from 'react'
import { useMutation } from 'convex/react'
import toast from 'react-hot-toast'
import { api } from '../../convex/_generated/api'
import type { AuthUser } from '../lib/auth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export function ProfilePage({
  user,
  onSave,
}: {
  user: AuthUser | null
  onSave: (user: AuthUser) => void
}) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [loading, setLoading] = useState(false)
  const updateUserProfile = useMutation(api.auth.updateUserProfile)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user?.id) return
    setLoading(true)
    try {
      await updateUserProfile({
        userId: user.id as any,
        name,
        email,
      })
      const updatedUser = { ...user, name, email }
      onSave(updatedUser)
      toast.success('Profil berhasil diperbarui.')
    } catch (err) {
      toast.error((err as Error).message || 'Gagal menyimpan profil.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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
          <div className="grid gap-2">
            <Label htmlFor="profile-name">Nama</Label>
            <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-role">Role</Label>
            <Input
              id="profile-role"
              value={user?.role ?? ''}
              disabled
            />
          </div>
          <Button className="w-fit bg-emerald-700 hover:bg-emerald-800" type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Profil'}
          </Button>
        </form>
      </section>
    </>
  )
}
