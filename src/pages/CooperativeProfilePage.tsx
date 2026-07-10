import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import toast from 'react-hot-toast'
import { api } from '../../convex/_generated/api'
import type { AuthUser } from '../lib/auth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { getAuthToken } from '../lib/auth'

export function CooperativeProfilePage({ user }: { user: AuthUser | null }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const currentKoperasi = useQuery(api.koperasi.getCurrentKoperasi, user?.role === 'Koperasi' ? { token: getAuthToken() } : 'skip')
  const allKoperasi = useQuery(api.koperasi.listKoperasiProfiles, user?.role === 'Admin' ? { token: getAuthToken() } : 'skip')
  const saveDefaultKoperasi = useMutation(api.koperasi.saveDefaultKoperasi)

  const memberList = useQuery(
    api.masterData.searchMembers,
    (user?.role === 'Koperasi' ? currentKoperasi?._id : defaultKoperasi?._id) ? { koperasiId: (user?.role === 'Koperasi' ? currentKoperasi?._id : defaultKoperasi?._id)!, searchTerm: '' } : 'skip',
  )
  const commodityList = useQuery(api.masterData.searchCommodities, { searchTerm: '' })

  const [form, setForm] = useState({
    name: '',
    location: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    leaderName: '',
  })

  const activeProfile = user?.role === 'Koperasi' ? currentKoperasi : defaultKoperasi

  if (user?.role === 'Admin') {
    const profiles = allKoperasi ?? []
    const selectedProfile = profiles.find((profile) => profile._id === selectedProfileId) ?? profiles[0]
    return (
      <>
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Data Master</p><h1 className="text-2xl font-black text-slate-950">Daftar koperasi terdaftar</h1></div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right"><span className="block text-xs font-bold text-emerald-700">Total koperasi</span><strong className="mt-1 block text-lg font-black text-slate-950">{profiles.length}</strong></div>
        </header>
        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Koperasi</th><th className="px-4 py-3">Wilayah</th><th className="px-4 py-3">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{profiles.map((profile) => <tr key={profile._id} className="hover:bg-emerald-50/50"><td className="px-4 py-3 font-black text-slate-950">{profile.name}</td><td className="px-4 py-3 font-semibold text-slate-600">{profile.location}</td><td className="px-4 py-3"><Button variant="outline" size="sm" type="button" onClick={() => setSelectedProfileId(profile._id)}>Detail</Button></td></tr>)}</tbody></table></div></div>
          {selectedProfile ? <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Detail koperasi</p><h2 className="mt-1 text-xl font-black text-slate-950">{selectedProfile.name}</h2><dl className="mt-5 grid gap-3 text-sm"><div><dt className="font-semibold text-slate-500">Wilayah</dt><dd className="font-bold text-slate-950">{selectedProfile.location}</dd></div><div><dt className="font-semibold text-slate-500">Alamat</dt><dd className="font-bold text-slate-950">{selectedProfile.address || '-'}</dd></div><div><dt className="font-semibold text-slate-500">Ketua</dt><dd className="font-bold text-slate-950">{selectedProfile.leaderName || '-'}</dd></div><div><dt className="font-semibold text-slate-500">Kontak</dt><dd className="font-bold text-slate-950">{selectedProfile.contactEmail || selectedProfile.contactPhone || '-'}</dd></div></dl></article> : <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-500">Pilih koperasi untuk melihat detail.</p>}
        </section>
      </>
    )
  }

  const startEditing = () => {
    setForm({
      name: activeProfile?.name || '',
      location: activeProfile?.location || '',
      address: activeProfile?.address || '',
      contactEmail: activeProfile?.contactEmail || '',
      contactPhone: activeProfile?.contactPhone || '',
      leaderName: activeProfile?.leaderName || '',
    })
    setIsEditing(true)
  }

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Data Master</p>
          <h1>Profil {activeProfile?.name || 'koperasi'}</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950">
          <span>Wilayah</span>
          <strong>{activeProfile?.location || '-'}</strong>
        </div>
      </header>
      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Identitas</p>
            <h2>{activeProfile?.name || 'Belum ada profil koperasi'}</h2>
          </div>
          {isEditing ? (
            <form
              className="mt-4 grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault()
                if (!user?.id) {
                  toast.error('User login tidak valid.')
                  return
                }
                setIsSaving(true)
                try {
                  await saveDefaultKoperasi({
                    adminId: user.id as any,
                    token: getAuthToken(),
                    name: form.name,
                    location: form.location,
                    address: form.address || undefined,
                    contactEmail: form.contactEmail || undefined,
                    contactPhone: form.contactPhone || undefined,
                    leaderName: form.leaderName || undefined,
                  })
                  setIsEditing(false)
                  toast.success('Profil koperasi berhasil diperbarui.')
                } catch (err) {
                  toast.error((err as Error).message || 'Gagal menyimpan profil koperasi.')
                } finally {
                  setIsSaving(false)
                }
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="koperasi-name">Nama Koperasi</Label>
                  <Input
                    id="koperasi-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="koperasi-location">Wilayah</Label>
                  <Input
                    id="koperasi-location"
                    value={form.location}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, location: event.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="koperasi-address">Alamat</Label>
                  <Input
                    id="koperasi-address"
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, address: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="koperasi-leader">Nama Ketua</Label>
                  <Input
                    id="koperasi-leader"
                    value={form.leaderName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, leaderName: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="koperasi-email">Email Kontak</Label>
                  <Input
                    id="koperasi-email"
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contactEmail: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="koperasi-phone">Telepon Kontak</Label>
                  <Input
                    id="koperasi-phone"
                    value={form.contactPhone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contactPhone: event.target.value }))
                    }
                  />
                </div>
              </div>
              <Button className="w-fit bg-emerald-700 hover:bg-emerald-800" type="submit" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
              </Button>
            </form>
          ) : (
            <dl className="grid gap-3">
              <div>
                <dt>Alamat</dt>
                <dd>{activeProfile?.address || '-'}</dd>
              </div>
              <div>
                <dt>Kontak</dt>
                <dd>
                  {activeProfile?.contactEmail || activeProfile?.contactPhone
                    ? `${activeProfile?.contactEmail || '-'} / ${activeProfile?.contactPhone || '-'}`
                    : '-'}
                </dd>
              </div>
              <div>
                <dt>Ketua</dt>
                <dd>{activeProfile?.leaderName || '-'}</dd>
              </div>
            </dl>
          )}
          <Button
            className="mt-4 px-0 text-sm font-black text-emerald-700 hover:text-emerald-800"
            variant="link"
            type="button"
            onClick={() => {
              if (isEditing) {
                setIsEditing(false)
              } else {
                startEditing()
              }
            }}
          >
            {isEditing ? 'Batal Edit' : 'Edit Profil'}
          </Button>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Operasional</p>
            <h2>Kapasitas koperasi</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <span>Anggota</span>
              <strong>{memberList?.length ?? 0}</strong>
            </div>
            <div>
              <span>Komoditas</span>
              <strong>{commodityList?.length ?? 0}</strong>
            </div>
          </div>
        </article>
      </section>
    </>
  )
}
