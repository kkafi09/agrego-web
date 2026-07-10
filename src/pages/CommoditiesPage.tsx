import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

type CommodityFormState = {
  _id?: string
  name: string
  unit: string
  minimumQualityScore: string
  qualityParameters: string
}

const emptyCommodityForm: CommodityFormState = {
  name: '',
  unit: '',
  minimumQualityScore: '',
  qualityParameters: '',
}

export function CommoditiesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [saved, setSaved] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState<CommodityFormState>(emptyCommodityForm)

  const commodityList = useQuery(api.masterData.searchCommodities, { searchTerm })
  const createCommodity = useMutation(api.masterData.createCommodity)
  const updateCommodity = useMutation(api.masterData.updateCommodity)
  const deleteCommodity = useMutation(api.masterData.deleteCommodity)

  function updateField(field: keyof CommodityFormState, value: string) {
    setSaved(false)
    setForm((current) => ({ ...current, [field]: value }))
  }

  function openCreateDialog() {
    setForm(emptyCommodityForm)
    setSaved(false)
    setIsDialogOpen(true)
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="grid gap-2 sm:w-80">
            <Label>Cari Komoditas</Label>
            <Input
              className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari komoditas"
            />
          </label>
          <Button className="h-11 rounded-lg bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800" type="button" onClick={openCreateDialog}>
            Tambah Komoditas
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {commodityList === undefined ? (
          <p className="text-sm font-bold text-emerald-700">Memuat data komoditas...</p>
        ) : commodityList.length === 0 ? (
          <p className="text-sm font-bold text-emerald-700">Belum ada komoditas terdaftar.</p>
        ) : (
          commodityList.map((commodity) => (
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={commodity._id}>
              <div className="grid gap-1">
                <span className="font-mono text-xs font-black text-emerald-700">{commodity._id}</span>
                <strong className="text-base font-black text-slate-950">{commodity.name}</strong>
              </div>
              <dl className="mt-4 grid gap-3">
                <div>
                  <dt className="text-xs font-semibold text-slate-500">Unit</dt>
                  <dd className="mt-1 text-sm font-black text-slate-950">{commodity.unit}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-500">Minimum QS</dt>
                  <dd className="mt-1 text-sm font-black text-slate-950">{commodity.minimumQualityScore}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-500">Parameter</dt>
                  <dd className="mt-1 text-sm font-black text-slate-950">{commodity.qualityParameters.join(', ') || '-'}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setForm({
                      _id: commodity._id,
                      name: commodity.name,
                      unit: commodity.unit,
                      minimumQualityScore: String(commodity.minimumQualityScore),
                      qualityParameters: commodity.qualityParameters.join(', '),
                    })
                    setSaved(false)
                    setIsDialogOpen(true)
                  }}
                >
                  Ubah
                </Button>
                <Button
                  variant="destructive"
                  type="button"
                  onClick={async () => {
                    if (window.confirm(`Hapus ${commodity.name}?`)) {
                      try {
                        await deleteCommodity({ commodityId: commodity._id })
                        if (form._id === commodity._id) {
                          setForm(emptyCommodityForm)
                        }
                      } catch (err) {
                        alert('Gagal menghapus komoditas: ' + (err as Error).message)
                      }
                    }
                  }}
                >
                  Hapus
                </Button>
              </div>
            </article>
          ))
        )}
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form._id ? 'Ubah komoditas' : 'Tambah komoditas'}</DialogTitle>
            <DialogDescription>Data ini akan digunakan di setoran, kontrak, QC, dan alokasi.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
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
                setForm(emptyCommodityForm)
                setIsDialogOpen(false)
              } catch (err) {
                alert('Gagal menyimpan data: ' + (err as Error).message)
              }
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <Label>Nama Komoditas</Label>
                <Input className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800" value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
              </label>
              <label className="grid gap-2">
                <Label>Minimum QS</Label>
                <Input className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800" max="100" min="0" type="number" value={form.minimumQualityScore} onChange={(event) => updateField('minimumQualityScore', event.target.value)} required />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <Label>Unit</Label>
                <Input className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800" value={form.unit} onChange={(event) => updateField('unit', event.target.value)} required />
              </label>
              <label className="grid gap-2">
                <Label>Parameter Kualitas</Label>
                <Input className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800" value={form.qualityParameters} onChange={(event) => updateField('qualityParameters', event.target.value)} placeholder="Pisahkan dengan koma" required />
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button className="bg-emerald-700 text-white hover:bg-emerald-800" type="submit">
                {form._id ? 'Simpan Perubahan' : 'Tambah Komoditas'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {saved ? <p className="text-sm font-bold text-emerald-700">Data komoditas berhasil disimpan.</p> : null}
    </>
  )
}
