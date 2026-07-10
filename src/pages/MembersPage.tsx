import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

type MemberFormState = {
  _id?: string
  name: string
  phone: string
  village: string
  primaryCommodityId: string
}

export function MembersPage() {
  const defaultKoperasi = useQuery(api.koperasi.getDefaultKoperasi)
  const koperasiId = defaultKoperasi?._id

  const commodities = useQuery(api.masterData.searchCommodities, { searchTerm: '' })

  const [searchTerm, setSearchTerm] = useState('')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<MemberFormState>({
    name: '',
    phone: '',
    village: '',
    primaryCommodityId: '',
  })

  const memberList = useQuery(
    api.masterData.searchMembers,
    koperasiId ? { koperasiId, searchTerm } : 'skip',
  )

  const createMember = useMutation(api.masterData.createMember)
  const updateMember = useMutation(api.masterData.updateMember)
  const deleteMember = useMutation(api.masterData.deleteMember)

  function updateField(field: keyof MemberFormState, value: string) {
    setSaved(false)
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Data Master</p>
          <h1>Manajemen anggota</h1>
        </div>
        <div className="operator-panel">
          <span>Total anggota</span>
          <strong>{memberList?.length ?? 0}</strong>
        </div>
      </header>
      <section className="panel">
        <div className="section-heading inline">
          <div>
            <p className="eyebrow">Anggota Koperasi</p>
            <h2>Data petani penyetor</h2>
          </div>
          <span>Database Terkoneksi</span>
        </div>
        <div className="filter-row">
          <label>
            <span>Cari Nama</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari anggota"
            />
          </label>
        </div>
        <div className="candidate-list">
          {memberList === undefined ? (
            <p className="success-note">Memuat data anggota...</p>
          ) : memberList.length === 0 ? (
            <p className="success-note">Belum ada anggota terdaftar.</p>
          ) : (
            memberList.map((member) => {
              const commodityName =
                commodities?.find((c) => c._id === member.primaryCommodityId)?.name || '-'

              return (
                <button
                  className="candidate-card"
                  key={member._id}
                  type="button"
                  onClick={() => {
                    setForm({
                      _id: member._id,
                      name: member.name,
                      phone: member.phone,
                      village: member.village || '',
                      primaryCommodityId: member.primaryCommodityId || '',
                    })
                    setSaved(false)
                  }}
                >
                  <div>
                    <strong>{member.name}</strong>
                    <span>{member.phone}</span>
                  </div>
                  <div>
                    <span>{member.village || '-'}</span>
                    <b>{commodityName}</b>
                  </div>
                  <span className="status-pill">
                    {member.status === 'active' ? 'Aktif' : 'Perlu Verifikasi'}
                  </span>
                  <small
                    onClick={async (event) => {
                      event.stopPropagation()
                      if (window.confirm(`Hapus ${member.name}?`)) {
                        try {
                          await deleteMember({ memberId: member._id })
                          if (form._id === member._id) {
                            setForm({ name: '', phone: '', village: '', primaryCommodityId: '' })
                          }
                        } catch (err) {
                          alert('Gagal menghapus anggota: ' + (err as Error).message)
                        }
                      }
                    }}
                  >
                    Hapus
                  </small>
                </button>
              )
            })
          )}
        </div>
      </section>
      <section className="panel status-update-panel">
        <div className="section-heading">
          <p className="eyebrow">Tambah / Ubah Anggota</p>
          <h2>Form data anggota</h2>
        </div>
        <form
          className="deposit-form"
          onSubmit={async (event) => {
            event.preventDefault()
            if (!koperasiId) {
              alert('Profil Koperasi belum siap.')
              return
            }

            try {
              if (form._id) {
                await updateMember({
                  memberId: form._id as any,
                  name: form.name,
                  phone: form.phone,
                  village: form.village || undefined,
                  primaryCommodityId: form.primaryCommodityId
                    ? (form.primaryCommodityId as any)
                    : undefined,
                })
              } else {
                await createMember({
                  koperasiId,
                  name: form.name,
                  phone: form.phone,
                  village: form.village || undefined,
                  primaryCommodityId: form.primaryCommodityId
                    ? (form.primaryCommodityId as any)
                    : undefined,
                })
              }
              setSaved(true)
              setForm({ name: '', phone: '', village: '', primaryCommodityId: '' })
            } catch (err) {
              alert('Gagal menyimpan data: ' + (err as Error).message)
            }
          }}
        >
          <div className="form-grid">
            <label>
              <span>Nama</span>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />
            </label>
            <label>
              <span>Telepon</span>
              <input
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                required
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              <span>Dusun</span>
              <input
                value={form.village}
                onChange={(event) => updateField('village', event.target.value)}
              />
            </label>
            <label>
              <span>Komoditas</span>
              <select
                value={form.primaryCommodityId}
                onChange={(event) => updateField('primaryCommodityId', event.target.value)}
              >
                <option value="">Pilih Komoditas</option>
                {commodities?.map((commodity) => (
                  <option key={commodity._id} value={commodity._id}>
                    {commodity.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="primary-action" type="submit">
              {form._id ? 'Simpan Perubahan' : 'Tambah Anggota'}
            </button>
            {form._id || form.name || form.phone || form.village || form.primaryCommodityId ? (
              <button
                className="text-action"
                type="button"
                onClick={() => {
                  setForm({ name: '', phone: '', village: '', primaryCommodityId: '' })
                  setSaved(false)
                }}
              >
                Batal
              </button>
            ) : null}
          </div>
          {saved ? <p className="success-note">Data anggota berhasil disimpan.</p> : null}
        </form>
      </section>
    </>
  )
}
