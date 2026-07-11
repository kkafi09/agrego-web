import { useEffect, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import toast from 'react-hot-toast'
import { api } from '../../convex/_generated/api'
import type { AuthUser } from '../lib/auth'
import { getAuthToken } from '../lib/auth'
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
import ConfirmationDialog from '../components/forms/confirmation-dialog'

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

export function CommoditiesPage({ user }: { user: AuthUser | null }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [, setSaved] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<CommodityFormState>(emptyCommodityForm)
  const [commodityToDelete, setCommodityToDelete] = useState<{ id: string; name: string } | null>(null)

  const commodityList = useQuery(api.masterData.listCommodityNetwork, { token: getAuthToken(), searchTerm })
  const createCommodity = useMutation(api.masterData.createCommodity)
  const updateCommodity = useMutation(api.masterData.updateCommodity)
  const deleteCommodity = useMutation(api.masterData.deleteCommodity)
  const updateCommodityStatus = useMutation(api.masterData.updateCommodityStatus)
  const adoptCommodity = useMutation(api.masterData.adoptCommodity)
  const migrateCommoditiesToKoperasi = useMutation(api.masterData.migrateCommoditiesToKoperasi)

  useEffect(() => {
    if (user?.role === 'Admin') {
      void migrateCommoditiesToKoperasi({ token: getAuthToken() }).catch(() => undefined)
    }
  }, [migrateCommoditiesToKoperasi, user?.role])

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
          {user?.role === 'Admin' || user?.role === 'Koperasi' ? <Button className="h-11 rounded-lg bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800" type="button" onClick={openCreateDialog}>
            Tambah Komoditas
          </Button> : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Komoditas</th>
                {user?.role === 'Admin' ? <th className="px-4 py-3">Koperasi</th> : null}
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Minimum QS</th>
                <th className="px-4 py-3">Parameter</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commodityList === undefined ? (
                <tr><td colSpan={user?.role === 'Admin' ? 7 : 6} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">Memuat data komoditas...</td></tr>
              ) : commodityList.length === 0 ? (
                <tr><td colSpan={user?.role === 'Admin' ? 7 : 6} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">Belum ada komoditas terdaftar.</td></tr>
              ) : (
                commodityList.map((commodity) => (
                  <tr className="transition hover:bg-emerald-50/50" key={commodity.commodityId}>
                    <td className="px-4 py-3 font-black text-slate-950">{commodity.name}</td>
                    {user?.role === 'Admin' ? <td className="px-4 py-3 font-semibold text-slate-700">{commodity.ownerName} · {commodity.activeProviderCount} aktif</td> : null}
                    <td className="px-4 py-3 font-semibold text-slate-700">{commodity.unit}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{commodity.minimumQualityScore}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{commodity.qualityParameters.join(', ') || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${commodity.status === 'active' ? 'bg-emerald-50 text-emerald-700' : commodity.status === 'not_added' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {commodity.status === 'active' ? 'Aktif' : commodity.status === 'not_added' ? 'Belum ditambahkan' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {user?.role === 'Admin' ? <><Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setForm({
                               _id: commodity.commodityId,
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
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                           onClick={() => setCommodityToDelete({ id: commodity.commodityId, name: commodity.name })}
                        >
                          Hapus
                        </Button>
                        </> : user?.role === 'Koperasi' ? <>
                        {commodity.canEdit ? <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setForm({ _id: commodity.commodityId, name: commodity.name, unit: commodity.unit, minimumQualityScore: String(commodity.minimumQualityScore), qualityParameters: commodity.qualityParameters.join(', ') })
                            setSaved(false)
                            setIsDialogOpen(true)
                          }}
                        >Edit</Button> : null}
                        <Button
                          variant={commodity.status === 'active' ? 'outline' : 'default'}
                          size="sm"
                          type="button"
                          className={commodity.status === 'active' ? 'text-rose-700 hover:text-rose-800' : 'bg-emerald-700 text-white hover:bg-emerald-800'}
                          onClick={async () => {
                            try {
                              if (commodity.status === 'not_added') {
                                await adoptCommodity({ token: getAuthToken(), commodityId: commodity.commodityId })
                              } else {
                                await updateCommodityStatus({ token: getAuthToken(), commodityId: commodity.commodityId, status: commodity.status === 'active' ? 'inactive' : 'active' })
                              }
                              toast.success(commodity.status === 'active' ? 'Komoditas dinonaktifkan untuk koperasi.' : 'Komoditas ditambahkan ke jaringan koperasi.')
                            } catch (err) {
                              toast.error((err as Error).message || 'Gagal mengubah status komoditas.')
                            }
                          }}
                        >
                          {commodity.status === 'active' ? 'Nonaktifkan' : 'Tambahkan'}
                        </Button>
                        </> : <span className="text-xs font-semibold text-slate-500">Hanya lihat</span>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={isDialogOpen && (user?.role === 'Admin' || user?.role === 'Koperasi')} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white sm:max-w-2xl">
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

              setIsSaving(true)
              try {
                if (form._id) {
                  await updateCommodity({
                    token: getAuthToken(),
                    commodityId: form._id as any,
                    name: form.name,
                    unit: form.unit,
                    minimumQualityScore: Number(form.minimumQualityScore),
                    qualityParameters: paramsArray,
                  })
                } else {
                  await createCommodity({
                    token: getAuthToken(),
                    name: form.name,
                    unit: form.unit,
                    minimumQualityScore: Number(form.minimumQualityScore),
                    qualityParameters: paramsArray,
                  })
                }
                setSaved(true)
                setForm(emptyCommodityForm)
                setIsDialogOpen(false)
                toast.success('Data komoditas berhasil disimpan.')
              } catch (err) {
                toast.error((err as Error).message || 'Gagal menyimpan data komoditas.')
              } finally {
                setIsSaving(false)
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
              <Button className="bg-emerald-700 text-white hover:bg-emerald-800" type="submit" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : form._id ? 'Simpan Perubahan' : 'Tambah Komoditas'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={Boolean(commodityToDelete)}
        title="Hapus komoditas?"
        message={`Data ${commodityToDelete?.name ?? ''} akan dihapus.`}
        confirmLabel="Hapus"
        isDanger
        onCancel={() => setCommodityToDelete(null)}
        onConfirm={async () => {
          if (!commodityToDelete) return
          try {
            await deleteCommodity({ token: getAuthToken(), commodityId: commodityToDelete.id as any })
            if (form._id === commodityToDelete.id) setForm(emptyCommodityForm)
            toast.success('Komoditas berhasil dihapus.')
          } catch (err) {
            toast.error((err as Error).message || 'Gagal menghapus komoditas.')
          } finally {
            setCommodityToDelete(null)
          }
        }}
      />
    </>
  )
}
