import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { AuthUser } from '../lib/auth'

export function CooperativeProfilePage({ user }: { user: AuthUser | null }) {
  const [isEditing, setIsEditing] = useState(false)
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const saveDefaultKoperasi = useMutation(api.koperasi.saveDefaultKoperasi)

  const memberList = useQuery(
    api.masterData.searchMembers,
    defaultKoperasi?._id ? { koperasiId: defaultKoperasi._id, searchTerm: '' } : 'skip',
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

  const activeProfile = defaultKoperasi

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
              className="mt-4 grid gap-4 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100 [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:font-semibold [&_textarea]:outline-none [&_textarea:focus]:border-emerald-500 [&_textarea:focus]:ring-4 [&_textarea:focus]:ring-emerald-100"
              onSubmit={async (event) => {
                event.preventDefault()
                try {
                  if (!user?.id) {
                    alert('User login tidak valid.')
                    return
                  }
                  await saveDefaultKoperasi({
                    adminId: user.id as any,
                    name: form.name,
                    location: form.location,
                    address: form.address || undefined,
                    contactEmail: form.contactEmail || undefined,
                    contactPhone: form.contactPhone || undefined,
                    leaderName: form.leaderName || undefined,
                  })
                  setIsEditing(false)
                } catch (err) {
                  alert('Gagal menyimpan profil: ' + (err as Error).message)
                }
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100">
                <label>
                  <span>Nama Koperasi</span>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  <span>Wilayah</span>
                  <input
                    value={form.location}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, location: event.target.value }))
                    }
                    required
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100">
                <label>
                  <span>Alamat</span>
                  <input
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, address: event.target.value }))
                    }
                  />
                </label>
                <label>
                  <span>Nama Ketua</span>
                  <input
                    value={form.leaderName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, leaderName: event.target.value }))
                    }
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100">
                <label>
                  <span>Email Kontak</span>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contactEmail: event.target.value }))
                    }
                  />
                </label>
                <label>
                  <span>Telepon Kontak</span>
                  <input
                    value={form.contactPhone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contactPhone: event.target.value }))
                    }
                  />
                </label>
              </div>
              <button className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50" type="submit">
                Simpan Profil
              </button>
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
                    ? `${activeProfile.contactEmail || '-'} / ${activeProfile.contactPhone || '-'}`
                    : '-'}
                </dd>
              </div>
              <div>
                <dt>Ketua</dt>
                <dd>{activeProfile?.leaderName || '-'}</dd>
              </div>
            </dl>
          )}
          <button
            className="text-sm font-black text-emerald-700 transition hover:text-emerald-800"
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
          </button>
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
