import './KPICard.css'

// Clean, focused KPI card. Big number, no sparkline.
export default function KPICard({ icon, label, value, sub, accent = 'blue' }) {
  return (
    <div className={`kpi-card kpi-${accent}`}>
      <div className={`kpi-icon kpi-icon-${accent}`}>{icon}</div>
      <div className="kpi-text">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  )
}
