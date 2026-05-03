import { useState } from 'react'
import SidebarChat      from './components/SidebarChat.jsx'
import KPICard          from './components/KPICard.jsx'
import ScenarioControls from './components/ScenarioControls.jsx'
import ScenarioChart    from './components/ScenarioChart.jsx'
import SummaryCards     from './components/SummaryCards.jsx'
import {
  KPIS, PRODUCTS, MOCK_SCENARIO_RESULTS,
} from './data/data.js'
import { api, isApiEnabled, backendResultToChartData } from './api/client.js'
import './App.css'

export default function App() {
  // Scenario state
  const [scenarioId,    setScenarioId]    = useState('price_change')
  const [productId,     setProductId]     = useState(10013)  // Party Dress
  const [priceIncrease, setPriceIncrease] = useState(10)
  const [discount,      setDiscount]      = useState(0.25)
  const [startMonth,    setStartMonth]    = useState(3)
  const [endMonth,      setEndMonth]      = useState(5)
  const [running,       setRunning]       = useState(false)
  const [result,        setResult]        = useState(MOCK_SCENARIO_RESULTS.price_change)
  const [error,         setError]         = useState(null)

  const onScenarioChange = (id) => {
    setScenarioId(id)
    setResult(MOCK_SCENARIO_RESULTS[id])
    setError(null)
  }

  const handleRunScenario = async () => {
    setRunning(true)
    setError(null)

    const payloadLog = {
      scenario:       scenarioId,
      product_id:     productId,
      price_increase: scenarioId === 'price_change'    ? priceIncrease : undefined,
      new_discount:   scenarioId !== 'price_change'    ? discount      : undefined,
      start_month:    startMonth,
      end_month:      endMonth,
    }
    console.log('Run scenario →', payloadLog)

    // Try the real backend first; on any failure fall back to mock data.
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
        const shaped = backendResultToChartData(backendResult)
        if (shaped) {
          setResult(shaped)
          setRunning(false)
          return
        }
      } catch (err) {
        console.warn('Backend call failed, falling back to mock:', err)
        setError('Backend not reachable — showing mock results.')
      }
    }

    // Mock fallback
    setTimeout(() => {
      const base = MOCK_SCENARIO_RESULTS[scenarioId]
      const noise = () => 0.95 + Math.random() * 0.1
      const months = base.months.map((m) => ({
        ...m,
        baseline:  Math.round(m.baseline  * noise()),
        predicted: Math.round(m.predicted * noise()),
      }))
      const totalBaseline  = months.reduce((s, m) => s + m.baseline,  0)
      const totalPredicted = months.reduce((s, m) => s + m.predicted, 0)
      const changePct = ((totalPredicted - totalBaseline) / totalBaseline) * 100
      setResult({
        months,
        totals: {
          baseline:  Math.round(totalBaseline  / months.length),
          predicted: Math.round(totalPredicted / months.length),
          changePct: Number(changePct.toFixed(1)),
        },
      })
      setRunning(false)
    }, 400)
  }

  return (
    <div className="app">
      <SidebarChat />

      <main className="dashboard">
        <div className="kpi-row">
          <KPICard
            accent="blue"
            icon={<DollarIcon />}
            label={KPIS.totalSales.label}
            value={KPIS.totalSales.value}
            delta={KPIS.totalSales.delta}
            deltaPositive={KPIS.totalSales.deltaPositive}
            sub={KPIS.totalSales.sub}
            spark={KPIS.totalSales.spark}
          />
          <KPICard
            accent="purple"
            icon={<DressBigIcon />}
            label={KPIS.topProduct.label}
            value={KPIS.topProduct.value}
            sub={KPIS.topProduct.sub}
            spark={KPIS.topProduct.spark}
          />
          <KPICard
            accent="blue"
            icon={<TrendIcon />}
            label={KPIS.growth.label}
            value={KPIS.growth.value}
            delta={KPIS.growth.delta}
            deltaPositive={KPIS.growth.deltaPositive}
            sub={KPIS.growth.sub}
            spark={KPIS.growth.spark}
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
            <ScenarioChart data={result.months} />
          </div>
          <SummaryCards totals={result.totals} />
        </div>
      </main>
    </div>
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
function DressBigIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 2h6l-1 3 3 5-1 3 3 9H5l3-9-1-3 3-5z" />
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
