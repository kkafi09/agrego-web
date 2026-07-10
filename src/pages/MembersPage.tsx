import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
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
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6 [&_h1]:text-2xl [&_h1]:font-black [&_h1]:tracking-normal [&_h1]:text-slate-950 sm:[&_h1]:text-3xl">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">AGREGO / Data Master</p>
          <h1>Manajemen anggota</h1>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right [&_span]:block [&_span]:text-xs [&_span]:font-bold [&_span]:text-emerald-700 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-lg [&_strong]:font-black [&_strong]:text-slate-950">
          <span>Total anggota</span>
          <strong>{memberList?.length ?? 0}</strong>
        </div>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950 [&>span]:text-sm [&>span]:font-bold [&>span]:text-slate-500">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Anggota Koperasi</p>
            <h2>Data petani penyetor</h2>
          </div>
          <span>Database Terkoneksi</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100">
          <label>
            <Label>Cari Nama</Label>
            <Input
              className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari anggota"
            />
          </label>
        </div>
        <div className="grid gap-3">
          {memberList === undefined ? (
            <p className="text-sm font-bold text-emerald-700">Memuat data anggota...</p>
          ) : memberList.length === 0 ? (
            <p className="text-sm font-bold text-emerald-700">Belum ada anggota terdaftar.</p>
          ) : (
            memberList.map((member) => {
              const commodityName =
                commodities?.find((c) => c._id === member.primaryCommodityId)?.name || '-'

              return (
                <button
                  className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center"
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
                  <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
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
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-1 [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-slate-950">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Tambah / Ubah Anggota</p>
          <h2>Form data anggota</h2>
        </div>
        <form
          className="mt-4 grid gap-4 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100 [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-3 [&_textarea]:text-sm [&_textarea]:font-semibold [&_textarea]:outline-none [&_textarea:focus]:border-emerald-500 [&_textarea:focus]:ring-4 [&_textarea:focus]:ring-emerald-100"
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
          <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100">
            <label>
              <Label>Nama</Label>
              <Input
                className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />
            </label>
            <label>
              <Label>Telepon</Label>
              <Input
                className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                required
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 [&_label]:grid [&_label]:gap-2 [&_label>span]:text-sm [&_label>span]:font-bold [&_label>span]:text-slate-700 [&_input]:h-11 [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:bg-white [&_input]:px-3 [&_input]:text-sm [&_input]:font-semibold [&_input]:outline-none [&_input:focus]:border-emerald-500 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-100 [&_select]:h-11 [&_select]:rounded-lg [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:px-3 [&_select]:text-sm [&_select]:font-semibold [&_select]:outline-none [&_select:focus]:border-emerald-500 [&_select:focus]:ring-4 [&_select:focus]:ring-emerald-100">
            <label>
              <Label>Dusun</Label>
              <Input
                className="h-11 rounded-lg bg-white text-sm font-semibold text-slate-800"
                value={form.village}
                onChange={(event) => updateField('village', event.target.value)}
              />
            </label>
            <label>
              <Label>Komoditas</Label>
              <Select
                value={form.primaryCommodityId}
                onValueChange={(value) => updateField('primaryCommodityId', value)}
              >
                <SelectTrigger className="h-11 w-full rounded-lg bg-white text-sm font-semibold text-slate-800">
                  <SelectValue placeholder="Pilih komoditas" />
                </SelectTrigger>
                <SelectContent>
                  {commodities?.map((commodity) => (
                    <SelectItem key={commodity._id} value={commodity._id}>
                      {commodity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="h-11 rounded-lg bg-emerald-700 text-sm font-black text-white hover:bg-emerald-800" type="submit">
              {form._id ? 'Simpan Perubahan' : 'Tambah Anggota'}
            </Button>
            {form._id || form.name || form.phone || form.village || form.primaryCommodityId ? (
              <Button
                variant="ghost"
                className="text-sm font-black text-emerald-700 hover:text-emerald-800"
                type="button"
                onClick={() => {
                  setForm({ name: '', phone: '', village: '', primaryCommodityId: '' })
                  setSaved(false)
                }}
              >
                Batal
              </Button>
            ) : null}
          </div>
          {saved ? <p className="text-sm font-bold text-emerald-700">Data anggota berhasil disimpan.</p> : null}
        </form>
      </section>
    </>
  )
}
