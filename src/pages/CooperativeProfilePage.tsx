import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function CooperativeProfilePage() {
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

  const activeProfile = defaultKoperasi || {
    name: 'Koperasi Tani Makmur',
    location: 'Jawa Barat',
    address: 'Jl. Desa Agri No. 12, Kabupaten Bandung',
    contactEmail: 'koperasi@tanmakmur.id',
    contactPhone: '022-7788-9900',
    leaderName: 'Ibu Ratna Permata',
  }

  const startEditing = () => {
    setForm({
      name: activeProfile.name,
      location: activeProfile.location,
      address: activeProfile.address || '',
      contactEmail: activeProfile.contactEmail || '',
      contactPhone: activeProfile.contactPhone || '',
      leaderName: activeProfile.leaderName || '',
    })
    setIsEditing(true)
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Data Master</p>
          <h1>Profil {activeProfile.name}</h1>
        </div>
        <div className="operator-panel">
          <span>Wilayah</span>
          <strong>{activeProfile.location}</strong>
        </div>
      </header>
      <section className="detail-layout">
        <article className="panel qc-detail-card">
          <div className="section-heading">
            <p className="eyebrow">Identitas</p>
            <h2>{activeProfile.name}</h2>
          </div>
          {isEditing ? (
            <form
              className="deposit-form"
              onSubmit={async (event) => {
                event.preventDefault()
                try {
                  await saveDefaultKoperasi({
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
              <div className="form-grid">
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
              <div className="form-grid">
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
              <div className="form-grid">
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
              <button className="primary-action" type="submit">
                Simpan Profil
              </button>
            </form>
          ) : (
            <dl className="detail-metrics single">
              <div>
                <dt>Alamat</dt>
                <dd>{activeProfile.address || '-'}</dd>
              </div>
              <div>
                <dt>Kontak</dt>
                <dd>
                  {activeProfile.contactEmail || activeProfile.contactPhone
                    ? `${activeProfile.contactEmail || '-'} / ${activeProfile.contactPhone || '-'}`
                    : '-'}
                </dd>
              </div>
              <div>
                <dt>Ketua</dt>
                <dd>{activeProfile.leaderName || '-'}</dd>
              </div>
            </dl>
          )}
          <button
            className="text-action"
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
        <article className="panel qc-detail-card">
          <div className="section-heading">
            <p className="eyebrow">Operasional</p>
            <h2>Kapasitas koperasi</h2>
          </div>
          <div className="parameter-grid">
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
