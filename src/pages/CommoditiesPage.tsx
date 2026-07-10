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
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Data Master</p>
          <h1>Manajemen komoditas</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950">
          <span>Total komoditas</span>
          <strong>{commodityList?.length ?? 0}</strong>
        </div>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100 xl:grid-cols-3">
        {commodityList === undefined ? (
          <p className="text-sm font-bold text-emerald-700">Memuat data komoditas...</p>
        ) : commodityList.length === 0 ? (
          <p className="text-sm font-bold text-emerald-700">Belum ada komoditas terdaftar.</p>
        ) : (
          commodityList.map((commodity) => (
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={commodity._id}>
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
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="text-sm font-black text-emerald-700 transition hover:text-emerald-800"
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
                  className="text-sm font-black text-rose-700 transition hover:text-rose-800"
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
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100">
          <label>
            <span>Cari Komoditas</span>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari komoditas"
            />
          </label>
        </div>
        <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Tambah / Ubah Komoditas</p>
          <h2>Parameter kualitas</h2>
        </div>
        <form
          className="mt-4 grid gap-4 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100 [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:font-semibold [&_textarea]:outline-none [&_textarea:focus]:border-emerald-500 [&_textarea:focus]:ring-4 [&_textarea:focus]:ring-emerald-100"
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
          <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100">
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
          <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100">
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
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50" type="submit">
              {form._id ? 'Simpan Perubahan' : 'Tambah Komoditas'}
            </button>
            {form._id || form.name || form.unit !== 'kg' || form.minimumQualityScore !== 85 ? (
              <button
                className="text-sm font-black text-emerald-700 transition hover:text-emerald-800"
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
          {saved ? <p className="text-sm font-bold text-emerald-700">Data komoditas berhasil disimpan.</p> : null}
        </form>
      </section>
    </>
  )
}
