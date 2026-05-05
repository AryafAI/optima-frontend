// API client for the Optima FastAPI backend.
//
// Defaults to http://localhost:8000 so the integration works out of the box.
// To point at a different backend, create a .env file with:
//     VITE_API_URL=https://api.your-host.com
// To force mock-only mode (e.g. for offline demos), set:
//     VITE_API_URL=
//
// All calls return null when the API is disabled. On network/HTTP errors we
// throw so the caller can decide whether to fall back to mock data.

const RAW = import.meta.env.VITE_API_URL
const API_URL = RAW === undefined ? 'http://localhost:8000' : RAW.trim()

export const isApiEnabled = () => Boolean(API_URL)
export const apiUrl       = () => API_URL

async function postJson(path, body, signal) {
  if (!API_URL) return null
  const res = await fetch(`${API_URL}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
    signal,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Request failed (${res.status})`)
  }
  return res.json()
}

async function getJson(path, signal) {
  if (!API_URL) return null
  const res = await fetch(`${API_URL}${path}`, { signal })
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json()
}

// Lightweight health probe — used on app load to decide whether the dashboard
// runs in "Live API" mode or falls back to mock data with a warning.
export async function pingBackend(timeoutMs = 2500) {
  if (!API_URL) return { ok: false, reason: 'disabled' }
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_URL}/`, { signal: ctrl.signal })
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` }
    return { ok: true }
  } catch (e) {
    return { ok: false, reason: e.name === 'AbortError' ? 'timeout' : 'unreachable' }
  } finally {
    clearTimeout(t)
  }
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
        month:     m.month,
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
