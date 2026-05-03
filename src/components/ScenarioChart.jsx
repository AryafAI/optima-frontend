import { useState, useRef, useEffect } from 'react'
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import './ScenarioChart.css'

export default function ScenarioChart({ data }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const formatTick = (v) => {
    if (v >= 1000) return `${Math.round(v / 1000)}K`
    return v
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div className="chart-title-block">
          <h3 className="chart-title">Baseline vs Predicted Sales</h3>
          <div className="chart-legend">
            <span className="legend-dot baseline"></span>
            <span className="legend-text">Baseline</span>
            <span className="legend-dot predicted"></span>
            <span className="legend-text">Predicted</span>
          </div>
        </div>
        <div className="chart-period" ref={ref}>
          <button type="button" className="period-btn" onClick={() => setOpen((v) => !v)}>
            <span>Monthly</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {open && (
            <div className="period-menu">
              <button type="button" className="period-item selected">Monthly</button>
              <button type="button" className="period-item disabled">Weekly (soon)</button>
              <button type="button" className="period-item disabled">Yearly (soon)</button>
            </div>
          )}
        </div>
      </div>

      <div className="chart-area">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }} barCategoryGap={32}>
            <defs>
              <linearGradient id="grad-baseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#8b7df9" stopOpacity={1} />
                <stop offset="100%" stopColor="#6d5cf6" stopOpacity={1} />
              </linearGradient>
              <linearGradient id="grad-predicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#60a5fa" stopOpacity={1} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eef2f7" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={formatTick}
              label={{ value: 'Sales (SAR)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 11 } }}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
              formatter={(v) => [`SAR ${v.toLocaleString()}`, '']}
            />
            <Bar dataKey="baseline"  name="Baseline"  fill="url(#grad-baseline)"  radius={[8, 8, 0, 0]} />
            <Bar dataKey="predicted" name="Predicted" fill="url(#grad-predicted)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
