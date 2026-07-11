import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import toast from 'react-hot-toast'
import { api } from '../../convex/_generated/api'
import type { AuthUser } from '../lib/auth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { getAuthToken } from '../lib/auth'
import { Building2, CheckCircle2, FileText, MapPin, PackageCheck, Phone, UserRound, Users } from 'lucide-react'

export function CooperativeProfilePage({ user }: { user: AuthUser | null }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const currentKoperasi = useQuery(api.koperasi.getCurrentKoperasi, user?.role === 'Koperasi' ? { token: getAuthToken() } : 'skip')
  const allKoperasi = useQuery(api.koperasi.listKoperasiProfiles, user?.role === 'Admin' ? { token: getAuthToken() } : 'skip')
  const saveDefaultKoperasi = useMutation(api.koperasi.saveDefaultKoperasi)
  const overview = useQuery(api.koperasi.getCooperativeOverview, user?.role === 'Koperasi' ? { token: getAuthToken() } : 'skip')
  const commodityCatalog = useQuery(api.koperasi.listCooperativeCommodityCatalog, user?.role === 'Koperasi' ? { token: getAuthToken() } : 'skip')
  const updateCommodityStatus = useMutation(api.masterData.updateCommodityStatus)

  const [form, setForm] = useState({
    name: '',
    location: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    leaderName: '',
  })

  const activeProfile = user?.role === 'Koperasi' ? (overview?.profile ?? currentKoperasi) : defaultKoperasi

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
      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 p-6 text-white sm:p-7">
            <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 right-20 h-40 w-40 rounded-full border border-white/10" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/15 text-2xl font-black ring-1 ring-white/20">
                  {(activeProfile?.name || 'K').trim().slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Identitas koperasi</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">{activeProfile?.name || 'Belum ada profil koperasi'}</h2>
                  <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-100"><MapPin size={15} />{activeProfile?.location || 'Wilayah belum diisi'}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300/20 px-3 py-1.5 text-xs font-black text-emerald-100 ring-1 ring-emerald-200/30"><CheckCircle2 size={14} />Profil aktif</span>
            </div>
          </div>
          <div className="p-6 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Informasi kontak</p><p className="mt-1 text-sm font-semibold text-slate-500">Data yang digunakan untuk koordinasi operasional.</p></div>
              <Button className="shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50" variant="outline" type="button" onClick={() => { if (isEditing) setIsEditing(false); else startEditing() }}>{isEditing ? 'Batal' : 'Edit Profil'}</Button>
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
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><dt className="flex items-center gap-2 text-xs font-bold text-slate-500"><UserRound size={15} />Ketua koperasi</dt><dd className="mt-2 text-sm font-black text-slate-950">{activeProfile?.leaderName || 'Belum diisi'}</dd></div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><dt className="flex items-center gap-2 text-xs font-bold text-slate-500"><Building2 size={15} />Wilayah</dt><dd className="mt-2 text-sm font-black text-slate-950">{activeProfile?.location || 'Belum diisi'}</dd></div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><dt className="flex items-center gap-2 text-xs font-bold text-slate-500"><Phone size={15} />Kontak</dt><dd className="mt-2 break-words text-sm font-black text-slate-950">{activeProfile?.contactPhone || 'Belum diisi'}</dd></div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><dt className="flex items-center gap-2 text-xs font-bold text-slate-500"><FileText size={15} />Email</dt><dd className="mt-2 break-words text-sm font-black text-slate-950">{activeProfile?.contactEmail || 'Belum diisi'}</dd></div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2"><dt className="flex items-center gap-2 text-xs font-bold text-slate-500"><MapPin size={15} />Alamat lengkap</dt><dd className="mt-2 text-sm font-black text-slate-950">{activeProfile?.address || 'Belum diisi'}</dd></div>
            </dl>
          )}
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Operasional</p><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Ringkasan aktivitas</h2><p className="mt-1 text-sm font-semibold text-slate-500">Pantau kesiapan koperasi dalam mendukung supply pool.</p></div>
            <div className="hidden rounded-xl bg-emerald-50 p-3 text-emerald-700 sm:block"><PackageCheck size={24} /></div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wide text-emerald-700">Anggota</span><Users className="text-emerald-700" size={19} /></div><strong className="mt-3 block text-3xl font-black text-slate-950">{overview?.memberCount ?? 0}</strong><span className="mt-1 block text-xs font-semibold text-slate-500">Petani terdaftar</span></div>
            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wide text-teal-700">Komoditas aktif</span><PackageCheck className="text-teal-700" size={19} /></div><strong className="mt-3 block text-3xl font-black text-slate-950">{overview?.activeCommodityCount ?? 0}</strong><span className="mt-1 block text-xs font-semibold text-slate-500">Siap disuplai</span></div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wide text-blue-700">Kontrak aktif</span><FileText className="text-blue-700" size={19} /></div><strong className="mt-3 block text-3xl font-black text-slate-950">{overview?.activeContractCount ?? 0}</strong><span className="mt-1 block text-xs font-semibold text-slate-500">Dapat didukung</span></div>
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wide text-orange-700">Supply pool</span><PackageCheck className="text-orange-700" size={19} /></div><strong className="mt-3 block text-3xl font-black text-slate-950">{(overview?.allocatedWeightKg ?? 0).toLocaleString('id-ID')}</strong><span className="mt-1 block text-xs font-semibold text-slate-500">kg teralokasi</span></div>
          </div>
          <div className={`mt-5 flex items-start gap-3 rounded-xl border p-4 ${(overview?.activeCommodityCount ?? 0) > 0 ? 'border-blue-100 bg-blue-50 text-blue-800' : 'border-amber-100 bg-amber-50 text-amber-800'}`}>
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            <p className="text-sm font-bold">{(overview?.activeCommodityCount ?? 0) > 0 ? 'Koperasi terhubung melalui supply pool aktif.' : 'Aktifkan komoditas untuk mulai menyuplai kontrak.'}</p>
          </div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Katalog Koperasi</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">Komoditas yang dapat disuplai</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">Aktifkan komoditas global untuk memasukkan stok koperasi ke jaringan supply pool.</p>
            </div>
            <span className="text-sm font-black text-emerald-700">{commodityCatalog?.filter((item) => item.status === 'active').length ?? 0} aktif</span>
          </div>
          <div className="mt-5 grid gap-3">
            {commodityCatalog?.length ? commodityCatalog.map((commodity) => (
              <div key={commodity.commodityId} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <strong className="block text-sm font-black text-slate-950">{commodity.name}</strong>
                  <span className="text-xs font-semibold text-slate-500">{commodity.unit} · Minimum QS {commodity.minimumQualityScore}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-black ${commodity.status === 'active' ? 'bg-emerald-50 text-emerald-700' : commodity.status === 'inactive' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700'}`}>
                    {commodity.status === 'active' ? 'Aktif' : commodity.status === 'inactive' ? 'Nonaktif' : 'Belum ditambahkan'}
                  </span>
                  <Button
                    size="sm"
                    variant={commodity.status === 'active' ? 'outline' : 'default'}
                    className={commodity.status === 'active' ? 'text-rose-700 hover:text-rose-800' : 'bg-emerald-700 text-white hover:bg-emerald-800'}
                    type="button"
                    onClick={async () => {
                      try {
                        await updateCommodityStatus({ token: getAuthToken(), commodityId: commodity.commodityId, status: commodity.status === 'active' ? 'inactive' : 'active' })
                        toast.success(commodity.status === 'active' ? 'Komoditas dinonaktifkan.' : 'Komoditas ditambahkan ke katalog koperasi.')
                      } catch (err) {
                        toast.error((err as Error).message || 'Gagal memperbarui komoditas.')
                      }
                    }}
                  >
                    {commodity.status === 'active' ? 'Nonaktifkan' : 'Tambahkan'}
                  </Button>
                </div>
              </div>
            )) : <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">Belum ada komoditas global.</p>}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Jaringan Supply Pool</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">Koneksi koperasi</h2>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-500">Koperasi terhubung melalui komoditas aktif yang dapat menyokong kontrak buyer yang sama.</p>
          <div className="mt-5 grid gap-3">
            {commodityCatalog?.filter((item) => item.status === 'active').length ? commodityCatalog.filter((item) => item.status === 'active').map((commodity) => (
              <div key={commodity.commodityId} className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <strong className="block text-sm font-black text-slate-950">{commodity.name}</strong>
                <span className="mt-1 block text-xs font-bold text-blue-700">
                  {commodity.otherActiveProviderCount > 0 ? `Terhubung ke ${commodity.otherActiveProviderCount} koperasi lain` : 'Belum ada koperasi lain'}
                </span>
              </div>
            )) : <p className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">Aktifkan komoditas untuk terhubung ke jaringan supply pool.</p>}
          </div>
        </article>
      </section>
    </>
  )
}
