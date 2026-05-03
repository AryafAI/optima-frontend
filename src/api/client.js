// API client for the Optima FastAPI backend.
//
// Behavior:
//   - If VITE_API_URL is set (in .env), each call hits the real backend.
//   - If not set, calls return null and the UI falls back to mock data.
//   - On network/HTTP errors we throw so the caller can fall back to mocks.

const API_URL = import.meta.env.VITE_API_URL || ''

export const isApiEnabled = () => Boolean(API_URL)

async function postJson(path, body) {
  if (!API_URL) return null
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Request failed (${res.status})`)
  }
  return res.json()
}

async function getJson(path) {
  if (!API_URL) return null
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

export const api = {
  getProducts:    ()        => getJson('/products'),
  whatifPrice:    (payload) => postJson('/whatif/price',    payload),
  whatifDiscount: (payload) => postJson('/whatif/discount', payload),
  whatifExtended: (payload) => postJson('/whatif/extended', payload),
  chat:           (message) => postJson('/chat', { message }),
}

// Convert backend whatif response → chart-friendly shape used by ScenarioChart.
// price_change & discount_change return one row; extended_discount returns monthly_detail[].
export function backendResultToChartData(result) {
  if (!result) return null
  const months = []

  if (result.scenario === 'extended_discount' && Array.isArray(result.monthly_detail)) {
    for (const m of result.monthly_detail) {
      months.push({
        month:     `${m.month} 2024`,
        baseline:  m.baseline_sales,
        predicted: m.new_sales,
      })
    }
    const t = result.total || {}
    const baseline  = t.baseline_sales ?? 0
    const predicted = t.new_sales      ?? 0
    return {
      months,
      totals: {
        baseline:  Math.round(baseline  / Math.max(months.length, 1)),
        predicted: Math.round(predicted / Math.max(months.length, 1)),
        changePct: t.delta_pct ?? 0,
      },
    }
  }

  // Single-month scenarios: synthesize a 1-bar chart.
  const baseline  = result.baseline_sales || 0
  const predicted = result.new_sales      || 0
  months.push({ month: 'Current', baseline, predicted })

  return {
    months,
    totals: {
      baseline,
      predicted,
      changePct: result.difference_pct ?? 0,
    },
  }
}
