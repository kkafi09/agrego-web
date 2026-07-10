interface StockSummary {
  commodityId: string
  commodityName: string
  totalKg: number
  readyKg: number
  qualityGrade: string | null
}

interface CommodityStockListProps {
  stocks: StockSummary[]
}

export default function CommodityStockList({ stocks }: CommodityStockListProps) {
  const formatKg = (val: number) => {
    return `${val.toLocaleString('id-ID')} kg`
  }

  if (stocks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm font-semibold text-slate-500">Belum ada stok tercatat.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {stocks.map((stock) => (
        <article className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={stock.commodityId}>
          <div>
            <strong className="block text-sm font-black text-slate-950">{stock.commodityName}</strong>
            <span className="mt-1 block text-xs font-semibold text-slate-500">{formatKg(stock.readyKg)} siap dialokasi</span>
          </div>
          
          <div className="grid gap-2 sm:min-w-48">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-black text-slate-950">{formatKg(stock.totalKg)}</span>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">Grade QS {stock.qualityGrade ?? '-'}</span>
            </div>
            
          </div>
        </article>
      ))}
    </div>
  )
}
