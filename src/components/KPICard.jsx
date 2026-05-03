import { LineChart, Line, ResponsiveContainer } from 'recharts'
import './KPICard.css'

export default function KPICard({ icon, label, value, delta, deltaPositive, sub, spark, accent = 'blue' }) {
  return (
    <div className={`kpi-card kpi-${accent}`}>
      <div className="kpi-top">
        <div className={`kpi-icon kpi-icon-${accent}`}>{icon}</div>
        <div className="kpi-text">
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{value}</div>
          <div className="kpi-sub-row">
            <span className="kpi-sub">{sub}</span>
            {delta && (
              <span className={`kpi-delta ${deltaPositive ? 'positive' : 'negative'}`}>
                {deltaPositive ? '↑' : '↓'} {delta}
              </span>
            )}
          </div>
        </div>
      </div>
      {spark && (
        <div className="kpi-spark">
          <ResponsiveContainer width="100%" height={56}>
            <LineChart data={spark.map((v, i) => ({ x: i, v }))}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={accent === 'purple' ? '#7c6df2' : '#3b82f6'}
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
