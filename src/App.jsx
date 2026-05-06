import { useState, useEffect } from 'react'
import SidebarChat      from './components/SidebarChat.jsx'
import KPICard          from './components/KPICard.jsx'
import ScenarioControls from './components/ScenarioControls.jsx'
import ScenarioChart    from './components/ScenarioChart.jsx'
import SummaryCards     from './components/SummaryCards.jsx'
import BackendStatus    from './components/BackendStatus.jsx'
import {
  PRODUCTS, MOCK_SCENARIO_RESULTS, computeOverviewKpis,
} from './data/data.js'
import { api, isApiEnabled, apiUrl, pingBackend } from './api/client.js'
import './App.css'

const formatSAR = (n) => `SAR ${Math.round(n).toLocaleString()}`
const formatNum = (n) => n.toLocaleString()

export default function App() {
  // Overview KPIs — start from local fallback, replace with real backend numbers on mount
  const [overview, setOverview] = useState(() => {
    const k = computeOverviewKpis()
    return {
      total_quantity_sold: k.totalQuantity,
      total_sales:         k.totalSales,
      total_profit:        k.totalProfit,
      top_product:         k.topProduct,
    }
  })

  // Real per-product prices fetched from /products. Map: { 8999: 56.5, ... }
  // Falls back to the hardcoded basePrice in PRODUCTS until /products responds.
  const [productPrices, setProductPrices] = useState(() => {
    const m = {}
    for (const p of PRODUCTS) m[p.id] = p.basePrice
    return m
  })

  // Scenario state
  const [scenarioId,    setScenarioId]    = useState('price_change')
  const [productId,     setProductId]     = useState(10013) // Party Dress
  const [priceIncrease, setPriceIncrease] = useState(10)
  const [discount,      setDiscount]      = useState(0.25)
  const [startMonth,    setStartMonth]    = useState(3)
  const [endMonth,      setEndMonth]      = useState(5)
  const [running,       setRunning]       = useState(false)
  const [result,        setResult]        = useState(MOCK_SCENARIO_RESULTS.price_change)
  const [error,         setError]         = useState(null)

  // Backend connection status: 'connecting' → 'live' | 'mock' | 'disabled'
  const [backendStatus,    setBackendStatus]    = useState(
    isApiEnabled() ? 'connecting' : 'disabled'
  )
  const [backendStatusErr, setBackendStatusErr] = useState(null)

  // Ping + fetch real KPIs and prices on mount.
  useEffect(() => {
    if (!isApiEnabled()) return
    let cancelled = false

    pingBackend().then((res) => {
      if (cancelled) return
      if (res.ok) {
        setBackendStatus('live')
        setBackendStatusErr(null)
      } else {
        setBackendStatus('mock')
        setBackendStatusErr(res.reason)
      }
    })

    // Real overview KPIs from /overview
    api.getOverview()
      .then((data) => { if (!cancelled && data) setOverview(data) })
      .catch((err) => console.warn('[overview] backend failed, using mock:', err?.message))

    // Real per-product current prices from /products
    api.getProducts()
      .then((list) => {
        if (cancelled || !Array.isArray(list)) return
        const next = {}
        for (const p of list) {
          if (typeof p.current_price === 'number') next[p.id] = p.current_price
        }
        if (Object.keys(next).length) setProductPrices(next)
      })
      .catch((err) => console.warn('[products] backend failed, using mock:', err?.message))

    return () => { cancelled = true }
  }, [])

  const onScenarioChange = (id) => {
    setScenarioId(id)
    setResult(MOCK_SCENARIO_RESULTS[id])
    setError(null)
  }

  // Chat → chart bridge: when the bot returns a scenarioResult, sync the dashboard.
  const handleScenarioFromChat = (id, scenarioResult) => {
    setScenarioId(id)
    setResult(scenarioResult)
  }

  const handleRunScenario = async () => {
    setRunning(true)
    setError(null)

    const payloadLog = {
      scenario:       scenarioId,
      product_id:     productId,
      price_increase: scenarioId === 'price_change' ? priceIncrease : undefined,
      new_discount:   scenarioId !== 'price_change' ? discount      : undefined,
      start_month:    startMonth,
      end_month:      endMonth,
    }
    console.log('Run scenario →', payloadLog)

    if (isApiEnabled()) {
      try {
        let backendResult = null
        if (scenarioId === 'price_change') {
          backendResult = await api.whatifPrice({
            product_id:     productId,
            price_increase: priceIncrease,
          })
        } else if (scenarioId === 'discount_change') {
          backendResult = await api.whatifDiscount({
            product_id:   productId,
            new_discount: discount,
          })
        } else if (scenarioId === 'extended_discount') {
          backendResult = await api.whatifExtended({
            product_id:   productId,
            start_month:  startMonth,
            end_month:    endMonth,
            new_discount: discount,
          })
        }
        const shaped = backendResultToScenario(scenarioId, backendResult)
        if (shaped) {
          setResult(shaped)
          setBackendStatus('live')
          setBackendStatusErr(null)
          setRunning(false)
          return
        }
      } catch (err) {
        console.warn('Backend call failed, falling back to mock:', err)
        const msg = err?.message || 'unknown error'
        setError(`Backend error: ${msg} — showing mock results.`)
        setBackendStatus('mock')
        setBackendStatusErr(msg)
      }
    }

    // Mock fallback with a small jitter to feel realistic
    setTimeout(() => {
      const base = MOCK_SCENARIO_RESULTS[scenarioId]
      const noise = () => 0.95 + Math.random() * 0.1
      let next
      if (base.type === 'monthly') {
        const months = base.months.map((m) => ({
          ...m,
          baseline:  Math.round(m.baseline  * noise()),
          predicted: Math.round(m.predicted * noise()),
        }))
        const totalBaseline  = months.reduce((s, m) => s + m.baseline,  0)
        const totalPredicted = months.reduce((s, m) => s + m.predicted, 0)
        const changePct = ((totalPredicted - totalBaseline) / totalBaseline) * 100
        next = {
          type: 'monthly',
          months,
          totals: {
            baseline:  totalBaseline,
            predicted: totalPredicted,
            changePct: Number(changePct.toFixed(1)),
          },
        }
      } else {
        const baselineV  = Math.round(base.totals.baseline  * noise())
        const predictedV = Math.round(base.totals.predicted * noise())
        const changePct  = ((predictedV - baselineV) / baselineV) * 100
        next = {
          type: 'single',
          bars: [
            { label: 'Baseline',  value: baselineV,  kind: 'baseline'  },
            { label: 'Predicted', value: predictedV, kind: 'predicted' },
          ],
          totals: {
            baseline:  baselineV,
            predicted: predictedV,
            changePct: Number(changePct.toFixed(1)),
          },
        }
      }
      setResult(next)
      setRunning(false)
    }, 400)
  }

  return (
    <div className="app">
      <SidebarChat
        onScenarioResult={handleScenarioFromChat}
        onBackendStatusChange={(next, msg) => {
          setBackendStatus(next)
          setBackendStatusErr(next === 'mock' ? (msg || 'unreachable') : null)
        }}
      />

      <main className="dashboard">
        <div className="dashboard-header">
          <BackendStatus
            status={backendStatus}
            apiUrl={apiUrl()}
            error={backendStatusErr}
          />
        </div>

        <div className="kpi-row">
          <KPICard
            accent="blue"
            icon={<BoxIcon />}
            label="Total Quantity Sold"
            value={formatNum(overview.total_quantity_sold)}
          />
          <KPICard
            accent="cyan"
            icon={<DollarIcon />}
            label="Total Sales"
            value={formatSAR(overview.total_sales)}
          />
          <KPICard
            accent="green"
            icon={<TrendIcon />}
            label="Total Profit"
            value={formatSAR(overview.total_profit)}
          />
          <KPICard
            accent="purple"
            icon={<DressBigIcon />}
            label="Top Selling Product"
            value={overview.top_product?.name || '—'}
          />
        </div>

        <div className="scenario-section">
          {error && <div className="banner-warning">{error}</div>}
          <div className="scenario-grid">
            <ScenarioControls
              scenarioId={scenarioId}
              onScenarioChange={onScenarioChange}
              productId={productId}
              onProductChange={setProductId}
              currentPrice={productPrices[productId]}
              priceIncrease={priceIncrease}
              onPriceIncreaseChange={setPriceIncrease}
              discount={discount}
              onDiscountChange={setDiscount}
              startMonth={startMonth}
              onStartMonthChange={setStartMonth}
              endMonth={endMonth}
              onEndMonthChange={setEndMonth}
              onRun={handleRunScenario}
              running={running}
            />
            <div className="chart-stack">
              <ScenarioChart result={result} />
              <SummaryCards totals={result.totals} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Convert FastAPI whatif/* response → scenario shape used by ScenarioChart + SummaryCards
function backendResultToScenario(scenarioId, result) {
  if (!result) return null
  if (scenarioId === 'extended_discount' && Array.isArray(result.monthly_detail)) {
    const months = result.monthly_detail.map((m) => ({
      month:     m.month,
      baseline:  m.baseline_sales,
      predicted: m.new_sales,
    }))
    const t = result.total || {}
    return {
      type: 'monthly',
      months,
      totals: {
        baseline:  t.baseline_sales ?? 0,
        predicted: t.new_sales      ?? 0,
        changePct: t.delta_pct      ?? 0,
      },
    }
  }
  // single comparison
  return {
    type: 'single',
    bars: [
      { label: 'Baseline',  value: result.baseline_sales || 0, kind: 'baseline'  },
      { label: 'Predicted', value: result.new_sales      || 0, kind: 'predicted' },
    ],
    totals: {
      baseline:  result.baseline_sales || 0,
      predicted: result.new_sales      || 0,
      changePct: result.difference_pct ?? 0,
    },
  }
}

function BoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  )
}
function DollarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )
}
function TrendIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 17 9 11 13 15 21 7"/>
      <polyline points="14 7 21 7 21 14"/>
    </svg>
  )
}
function DressBigIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 2h6l-1 3 3 5-1 3 3 9H5l3-9-1-3 3-5z" />
    </svg>
  )
}
