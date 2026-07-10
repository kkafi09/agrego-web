import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

type CommodityFormState = {
  _id?: string
  name: string
  unit: string
  minimumQualityScore: number
  qualityParameters: string
}

export function CommoditiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<CommodityFormState>({
    name: '',
    unit: 'kg',
    minimumQualityScore: 85,
    qualityParameters: 'Kadar air, grade, kerusakan',
  })

  const commodityList = useQuery(api.masterData.searchCommodities, { searchTerm })

  const createCommodity = useMutation(api.masterData.createCommodity)
  const updateCommodity = useMutation(api.masterData.updateCommodity)
  const deleteCommodity = useMutation(api.masterData.deleteCommodity)

  function updateField(field: keyof CommodityFormState, value: any) {
    setSaved(false)
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">AGREGO / Data Master</p>
          <h1>Manajemen komoditas</h1>
        </div>
        <div className="operator-panel">
          <span>Total komoditas</span>
          <strong>{commodityList?.length ?? 0}</strong>
        </div>
      </header>
      <section className="pool-grid">
        {commodityList === undefined ? (
          <p className="success-note">Memuat data komoditas...</p>
        ) : commodityList.length === 0 ? (
          <p className="success-note">Belum ada komoditas terdaftar.</p>
        ) : (
          commodityList.map((commodity) => (
            <article className="pool-card" key={commodity._id}>
              <div>
                <span>{commodity._id}</span>
                <strong>{commodity.name}</strong>
              </div>
              <dl>
                <div>
                  <dt>Unit</dt>
                  <dd>{commodity.unit}</dd>
                </div>
                <div>
                  <dt>Minimum QS</dt>
                  <dd>{commodity.minimumQualityScore}</dd>
                </div>
                <div>
                  <dt>Parameter</dt>
                  <dd>{commodity.qualityParameters.join(', ')}</dd>
                </div>
              </dl>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  className="text-action"
                  type="button"
                  onClick={() => {
                    setForm({
                      _id: commodity._id,
                      name: commodity.name,
                      unit: commodity.unit,
                      minimumQualityScore: commodity.minimumQualityScore,
                      qualityParameters: commodity.qualityParameters.join(', '),
                    })
                    setSaved(false)
                  }}
                >
                  Ubah
                </button>
                <button
                  className="text-action text-danger"
                  type="button"
                  onClick={async () => {
                    if (window.confirm(`Hapus ${commodity.name}?`)) {
                      try {
                        await deleteCommodity({ commodityId: commodity._id })
                        if (form._id === commodity._id) {
                          setForm({
                            name: '',
                            unit: 'kg',
                            minimumQualityScore: 85,
                            qualityParameters: '',
                          })
                        }
                      } catch (err) {
                        alert('Gagal menghapus komoditas: ' + (err as Error).message)
                      }
                    }
                  }}
                >
                  Hapus
                </button>
              </div>
            </article>
          ))
        )}
      </section>
      <section className="panel status-update-panel">
        <div className="filter-row">
          <label>
            <span>Cari Komoditas</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari komoditas"
            />
          </label>
        </div>
        <div className="section-heading">
          <p className="eyebrow">Tambah / Ubah Komoditas</p>
          <h2>Parameter kualitas</h2>
        </div>
        <form
          className="deposit-form"
          onSubmit={async (event) => {
            event.preventDefault()
            const paramsArray = form.qualityParameters
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean)

            try {
              if (form._id) {
                await updateCommodity({
                  commodityId: form._id as any,
                  name: form.name,
                  unit: form.unit,
                  minimumQualityScore: Number(form.minimumQualityScore),
                  qualityParameters: paramsArray,
                })
              } else {
                await createCommodity({
                  name: form.name,
                  unit: form.unit,
                  minimumQualityScore: Number(form.minimumQualityScore),
                  qualityParameters: paramsArray,
                })
              }
              setSaved(true)
              setForm({
                name: '',
                unit: 'kg',
                minimumQualityScore: 85,
                qualityParameters: 'Kadar air, grade, kerusakan',
              })
            } catch (err) {
              alert('Gagal menyimpan data: ' + (err as Error).message)
            }
          }}
        >
          <div className="form-grid">
            <label>
              <span>Nama Komoditas</span>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />
            </label>
            <label>
              <span>Minimum QS</span>
              <input
                max="100"
                min="0"
                type="number"
                value={form.minimumQualityScore}
                onChange={(event) => updateField('minimumQualityScore', Number(event.target.value))}
                required
              />
            </label>
          </div>
          <div className="form-grid">
            <label>
              <span>Unit</span>
              <input
                value={form.unit}
                onChange={(event) => updateField('unit', event.target.value)}
                required
              />
            </label>
            <label>
              <span>Parameter Kualitas (pisahkan dengan koma)</span>
              <input
                value={form.qualityParameters}
                onChange={(event) => updateField('qualityParameters', event.target.value)}
                placeholder="Kadar air, grade, kerusakan"
                required
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="primary-action" type="submit">
              {form._id ? 'Simpan Perubahan' : 'Tambah Komoditas'}
            </button>
            {form._id || form.name || form.unit !== 'kg' || form.minimumQualityScore !== 85 ? (
              <button
                className="text-action"
                type="button"
                onClick={() => {
                  setForm({
                    name: '',
                    unit: 'kg',
                    minimumQualityScore: 85,
                    qualityParameters: 'Kadar air, grade, kerusakan',
                  })
                  setSaved(false)
                }}
              >
                Batal
              </button>
            ) : null}
          </div>
          {saved ? <p className="success-note">Data komoditas berhasil disimpan.</p> : null}
        </form>
      </section>
    </>
  )
}
