import { LineChart, Line, ResponsiveContainer } from 'recharts'
import './SummaryCards.css'

export default function SummaryCards({ totals }) {
  const trend = [40, 45, 50, 48, 56, 60, 65, 70, 75, 80, 88, 95]

  return (
    <div className="summary-row">
      <div className="summary-card">
        <div className="summary-label">Baseline Total</div>
        <div className="summary-value purple">SAR {totals.baseline.toLocaleString()}</div>
        <div className="summary-sub">Total sales without changes</div>
      </div>

      <div className="summary-card">
        <div className="summary-label">Predicted Total</div>
        <div className="summary-value blue">SAR {totals.predicted.toLocaleString()}</div>
        <div className="summary-sub">Total sales with scenario</div>
      </div>

      <div className="summary-card change">
        <div className="summary-label">Change</div>
        <div className="summary-value green">↑ {totals.changePct}%</div>
        <div className="summary-sub">Increase in sales</div>
      </div>

      <div className="summary-trend">
        <ResponsiveContainer width="100%" height={70}>
          <LineChart data={trend.map((v, i) => ({ x: i, v }))}>
            <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
