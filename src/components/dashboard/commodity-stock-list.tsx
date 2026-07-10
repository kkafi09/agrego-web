interface StockSummary {
  commodity: string
  totalKg: number
  readyKg: number
  quality: number
  trend: string
}

interface CommodityStockListProps {
  stocks: StockSummary[]
}

export default function CommodityStockList({ stocks }: CommodityStockListProps) {
  const formatKg = (val: number) => {
    return `${val.toLocaleString('id-ID')} kg`
  }

  return (
    <div className="commodity-stock-list">
      {stocks.map((stock) => (
        <article className="stock-item-row" key={stock.commodity}>
          <div className="stock-row-left">
            <strong className="stock-commodity-name">{stock.commodity}</strong>
            <span className="stock-trend-label">{stock.trend}</span>
          </div>
          
          <div className="stock-row-right">
            <div className="stock-values-wrapper">
              <span className="stock-weight-total">{formatKg(stock.totalKg)}</span>
              <span className="stock-qs-score">QS {stock.quality}</span>
            </div>
            
            <div className="stock-quality-bar" aria-label={`Quality score ${stock.quality}%`}>
              <div className="stock-quality-bar-fill" style={{ width: `${stock.quality}%` }} />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
