import './SummaryCards.css'

// Three clean numeric cards. No mini chart, no long descriptions.
export default function SummaryCards({ totals }) {
  const change = (totals.predicted ?? 0) - (totals.baseline ?? 0)
  const sign   = change >= 0 ? '+' : '-'
  const absChange = Math.abs(change)
  const pct  = totals.changePct ?? 0
  const positive = pct >= 0

  return (
    <div className="summary-row">
      <div className="summary-card">
        <div className="summary-label">Baseline Sales</div>
        <div className="summary-value baseline">SAR {Math.round(totals.baseline).toLocaleString()}</div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Predicted Sales</div>
        <div className="summary-value predicted">SAR {Math.round(totals.predicted).toLocaleString()}</div>
      </div>

      <div className={`summary-card change ${positive ? 'pos' : 'neg'}`}>
        <div className="summary-label">Prediction Change</div>
        <div className={`summary-value ${positive ? 'green' : 'red'}`}>
          {positive ? '↑' : '↓'} {Math.abs(pct).toFixed(1)}%
        </div>
        <div className="summary-amount">
          {sign}SAR {Math.round(absChange).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
