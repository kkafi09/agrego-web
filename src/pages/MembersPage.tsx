import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import toast from 'react-hot-toast'
import { api } from '../../convex/_generated/api'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'

type MemberFormState = {
  _id?: string
  name: string
  phone: string
  village: string
  primaryCommodityId: string
}

const emptyMemberForm: MemberFormState = {
  name: '',
  phone: '',
  village: '',
  primaryCommodityId: '',
}

export function MembersPage() {
  const currentKoperasi = useQuery(api.koperasi.getCurrentKoperasi, { token: getAuthToken() })
  const koperasiId = currentKoperasi?._id
  const commodities = useQuery(
    api.masterData.searchCommodities,
    koperasiId ? { searchTerm: '', token: getAuthToken(), koperasiId } : 'skip',
  )

  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<MemberFormState>(emptyMemberForm)
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null)
  const [memberToVerify, setMemberToVerify] = useState<{ id: string; name: string } | null>(null)

  const memberList = useQuery(
    api.masterData.searchMembers,
    koperasiId ? { koperasiId, searchTerm } : 'skip',
  )

  const createMember = useMutation(api.masterData.createMember)
  const updateMember = useMutation(api.masterData.updateMember)
  const deleteMember = useMutation(api.masterData.deleteMember)
  const verifyMember = useMutation(api.masterData.verifyMember)

  const hasCommodities = Boolean(commodities?.length)
  const isLoading = memberList === undefined
  const rows = memberList ?? []

  function updateField(field: keyof MemberFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function openCreateDialog() {
    setForm(emptyMemberForm)
    setIsDialogOpen(true)
  }

  function openEditDialog(member: NonNullable<typeof memberList>[number]) {
    setForm({
      _id: member._id,
      name: member.name,
      phone: member.phone,
      village: member.village || '',
      primaryCommodityId: member.primaryCommodityId || '',
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!koperasiId) {
      toast.error('Profil koperasi belum tersedia.')
      return
    }

    setIsSaving(true)
    try {
      if (form._id) {
        await updateMember({
          memberId: form._id as any,
          name: form.name,
          phone: form.phone,
          village: form.village || undefined,
          primaryCommodityId: form.primaryCommodityId ? (form.primaryCommodityId as any) : undefined,
        })
        toast.success('Data anggota berhasil diperbarui.')
      } else {
        await createMember({
          koperasiId,
          name: form.name,
          phone: form.phone,
          village: form.village || undefined,
          primaryCommodityId: form.primaryCommodityId ? (form.primaryCommodityId as any) : undefined,
        })
        toast.success('Anggota baru berhasil ditambahkan.')
      }
      setForm(emptyMemberForm)
      setIsDialogOpen(false)
    } catch (err) {
      toast.error((err as Error).message || 'Gagal menyimpan data anggota.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(memberId: string) {
    try {
      await deleteMember({ memberId: memberId as any })
      toast.success('Anggota berhasil dihapus.')
    } catch (err) {
      toast.error((err as Error).message || 'Gagal menghapus anggota.')
    }
  }

  return (
    <>
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Data Master</p>
          <h1>Manajemen anggota</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950">
          <span>Total anggota</span>
          <strong>{rows.length}</strong>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Anggota Koperasi</p>
            <h2>Data petani penyetor</h2>
          </div>
          <Button className="bg-emerald-700 hover:bg-emerald-800" type="button" onClick={openCreateDialog}>
            Tambah Anggota
          </Button>
        </div>

        <div className="mt-4 grid gap-2 sm:max-w-sm">
          <Label htmlFor="member-search">Cari Nama</Label>
          <Input
            id="member-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Cari anggota"
          />
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Dusun</th>
                  <th className="px-4 py-3">Komoditas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                      Memuat data anggota...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                      Belum ada anggota terdaftar.
                    </td>
                  </tr>
                ) : (
                  rows.map((member) => {
                    const commodityName =
                      commodities?.find((commodity) => commodity._id === member.primaryCommodityId)?.name || '-'

                    return (
                      <tr key={member._id} className="transition hover:bg-emerald-50/50">
                        <td className="px-4 py-3">
                          <strong className="block font-black text-slate-950">{member.name}</strong>
                          <span className="text-xs font-semibold text-slate-500">{member.phone}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{member.village || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{commodityName}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                            {member.status === 'active' ? 'Aktif' : 'Perlu Verifikasi'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {member.status !== 'active' ? <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              onClick={() => setMemberToVerify({ id: member._id, name: member.name })}
                            >
                              Verifikasi
                            </Button> : null}
                            <Button variant="outline" size="sm" type="button" onClick={() => openEditDialog(member)}>
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                              onClick={() => setMemberToDelete({ id: member._id, name: member.name })}
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form._id ? 'Ubah Anggota' : 'Tambah Anggota'}</DialogTitle>
            <DialogDescription>Lengkapi data anggota penyetor koperasi.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="member-name">Nama</Label>
                <Input id="member-name" value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="member-phone">Telepon</Label>
                <Input id="member-phone" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} required />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="member-village">Dusun</Label>
                <Input id="member-village" value={form.village} onChange={(event) => updateField('village', event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Komoditas</Label>
                <Select
                  value={form.primaryCommodityId}
                  onValueChange={(value) => updateField('primaryCommodityId', value)}
                  disabled={!hasCommodities}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={hasCommodities ? 'Pilih komoditas' : 'Belum ada komoditas'} />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {commodities?.map((commodity) => (
                      <SelectItem key={commodity._id} value={commodity._id}>
                        {commodity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!hasCommodities ? (
                  <p className="text-xs font-semibold text-slate-500">Tambahkan komoditas terlebih dahulu sebelum mengaitkan anggota.</p>
                ) : null}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button className="bg-emerald-700 hover:bg-emerald-800" type="submit" disabled={isSaving || !koperasiId}>
                {isSaving ? 'Menyimpan...' : form._id ? 'Simpan Perubahan' : 'Tambah Anggota'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        isOpen={Boolean(memberToVerify)}
        title="Verifikasi anggota?"
        message={`Pastikan data ${memberToVerify?.name ?? ''} sudah benar sebelum mengaktifkan anggota ini.`}
        confirmLabel="Verifikasi"
        onCancel={() => setMemberToVerify(null)}
        onConfirm={async () => {
          if (!memberToVerify) return
          try {
            await verifyMember({ token: getAuthToken(), memberId: memberToVerify.id as any })
            toast.success('Anggota berhasil diverifikasi.')
          } catch (err) {
            toast.error((err as Error).message || 'Gagal memverifikasi anggota.')
          } finally {
            setMemberToVerify(null)
          }
        }}
      />

      <ConfirmationDialog
        isOpen={Boolean(memberToDelete)}
        title="Hapus anggota?"
        message={`Data ${memberToDelete?.name ?? ''} akan dihapus.`}
        confirmLabel="Hapus"
        isDanger
        onCancel={() => setMemberToDelete(null)}
        onConfirm={async () => {
          if (!memberToDelete) return
          await handleDelete(memberToDelete.id)
          setMemberToDelete(null)
        }}
      />
    </>
  )
}
