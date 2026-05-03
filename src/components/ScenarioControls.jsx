import { useState, useRef, useEffect } from 'react'
import { PRODUCTS, VALID_DISCOUNTS, MONTHS, SCENARIOS } from '../data/data.js'
import './ScenarioControls.css'

export default function ScenarioControls({
  scenarioId,
  onScenarioChange,
  productId,
  onProductChange,
  priceIncrease,
  onPriceIncreaseChange,
  discount,
  onDiscountChange,
  startMonth,
  onStartMonthChange,
  endMonth,
  onEndMonthChange,
  onRun,
  running,
}) {
  const [scenarioOpen, setScenarioOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setScenarioOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0]
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0]

  return (
    <div className="scenario-panel">
      <div className="scenario-header">
        <div>
          <h2 className="panel-title">Scenario Simulation</h2>
          <p className="panel-sub">Test different pricing scenarios and see the impact on sales</p>
        </div>

        <div className="scenario-pickers">
          <div className="scenario-pill ghost">Select Scenario</div>
          <div className="scenario-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="scenario-pill active"
              onClick={() => setScenarioOpen((v) => !v)}
              aria-expanded={scenarioOpen}
            >
              <UpRightIcon />
              <span>{scenario.label}</span>
              <ChevronIcon className={scenarioOpen ? 'rotated' : ''} />
            </button>
            {scenarioOpen && (
              <div className="scenario-menu">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`scenario-menu-item ${s.id === scenarioId ? 'selected' : ''}`}
                    onClick={() => {
                      onScenarioChange(s.id)
                      setScenarioOpen(false)
                    }}
                  >
                    <span>{s.label}</span>
                    {s.id === scenarioId && <CheckIcon />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="control-grid">
        <div className="control-group">
          <label className="control-label">Select Product</label>
          <ProductSelect value={productId} onChange={onProductChange} />
        </div>

        {scenarioId === 'price_change' && (
          <div className="control-group">
            <label className="control-label">Price Increase</label>
            <span className="control-sublabel">Amount (SAR)</span>
            <NumberStepper
              value={priceIncrease}
              onChange={onPriceIncreaseChange}
              min={0}
              max={500}
              step={5}
            />
            <div className="control-hint">Current Price: SAR {product.basePrice}</div>
          </div>
        )}

        {scenarioId === 'discount_change' && (
          <div className="control-group">
            <label className="control-label">Discount</label>
            <DiscountSelect value={discount} onChange={onDiscountChange} />
            <div className="control-hint">Choose a fixed promotional rate</div>
          </div>
        )}

        {scenarioId === 'extended_discount' && (
          <>
            <div className="control-group">
              <label className="control-label">Discount</label>
              <DiscountSelect value={discount} onChange={onDiscountChange} />
            </div>
            <div className="control-group">
              <label className="control-label">Select Period</label>
              <div className="month-row">
                <div className="month-col">
                  <span className="control-sublabel">Start Month</span>
                  <MonthSelect value={startMonth} onChange={onStartMonthChange} />
                </div>
                <div className="month-col">
                  <span className="control-sublabel">End Month</span>
                  <MonthSelect value={endMonth} onChange={onEndMonthChange} />
                </div>
              </div>
            </div>
          </>
        )}

        {scenarioId === 'price_change' && (
          <div className="control-group">
            <label className="control-label">Select Period</label>
            <div className="month-row">
              <div className="month-col">
                <span className="control-sublabel">Start Month</span>
                <MonthSelect value={startMonth} onChange={onStartMonthChange} />
              </div>
              <div className="month-col">
                <span className="control-sublabel">End Month</span>
                <MonthSelect value={endMonth} onChange={onEndMonthChange} />
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="run-button"
          onClick={onRun}
          disabled={running}
        >
          <SparkleIcon />
          <span>{running ? 'Running...' : 'Run Scenario'}</span>
        </button>
      </div>
    </div>
  )
}

function ProductSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  const current = PRODUCTS.find((p) => p.id === value) || PRODUCTS[0]
  return (
    <div className="custom-select" ref={ref}>
      <button type="button" className="select-trigger" onClick={() => setOpen((v) => !v)}>
        <span className="product-icon" aria-hidden="true">
          <DressIcon color={current.color} />
        </span>
        <span className="select-value">{current.name}</span>
        <ChevronIcon className={open ? 'rotated' : ''} />
      </button>
      {open && (
        <div className="select-menu">
          {PRODUCTS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`select-item ${p.id === value ? 'selected' : ''}`}
              onClick={() => { onChange(p.id); setOpen(false) }}
            >
              <span className="product-icon"><DressIcon color={p.color} /></span>
              <span>{p.name}</span>
              {p.id === value && <CheckIcon />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DiscountSelect({ value, onChange }) {
  return (
    <div className="native-select-wrapper">
      <select
        className="native-select"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      >
        {VALID_DISCOUNTS.map((d) => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>
      <ChevronIcon />
    </div>
  )
}

function MonthSelect({ value, onChange }) {
  return (
    <div className="native-select-wrapper">
      <span className="select-prefix" aria-hidden="true"><CalendarIcon /></span>
      <select
        className="native-select with-prefix"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
      >
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>{m.label} 2024</option>
        ))}
      </select>
    </div>
  )
}

function NumberStepper({ value, onChange, min = 0, max = 999, step = 1 }) {
  const dec = () => onChange(Math.max(min, value - step))
  const inc = () => onChange(Math.min(max, value + step))
  return (
    <div className="stepper">
      <button type="button" onClick={dec} aria-label="Decrease">−</button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseFloat(e.target.value)
          if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)))
        }}
      />
      <button type="button" onClick={inc} aria-label="Increase">+</button>
    </div>
  )
}

function ChevronIcon({ className = '' }) {
  return (
    <svg className={`chev ${className}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}
function UpRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7"/>
      <polyline points="7 7 17 7 17 17"/>
    </svg>
  )
}
function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}
function DressIcon({ color = '#7c6df2' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
      <path d="M9 2h6l-1 3 3 5-1 3 3 9H5l3-9-1-3 3-5z" />
    </svg>
  )
}
