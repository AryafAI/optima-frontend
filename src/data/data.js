// Mock data for Optima frontend.
// Replace these with API calls when the backend is ready.

export const PRODUCTS = [
  { id: 8999,  name: 'Wedding Dress',     basePrice: 100, color: '#7c3aed' },
  { id: 12717, name: 'Graduation Dress',  basePrice: 80,  color: '#0ea5e9' },
  { id: 10013, name: 'Party Dress',       basePrice: 120, color: '#06b6d4' },
]

export const VALID_DISCOUNTS = [
  { value: 0,    label: '0% (No discount)' },
  { value: 0.25, label: '25%' },
  { value: 0.35, label: '35%' },
  { value: 0.45, label: '45%' },
]

export const MONTHS = [
  { value: 1,  label: 'January'   },
  { value: 2,  label: 'February'  },
  { value: 3,  label: 'March'     },
  { value: 4,  label: 'April'     },
  { value: 5,  label: 'May'       },
  { value: 6,  label: 'June'      },
  { value: 7,  label: 'July'      },
  { value: 8,  label: 'August'    },
  { value: 9,  label: 'September' },
  { value: 10, label: 'October'   },
  { value: 11, label: 'November'  },
  { value: 12, label: 'December'  },
]

export const SCENARIOS = [
  { id: 'price_change',       label: 'Price Increase',    icon: 'arrow-up' },
  { id: 'discount_change',    label: 'Discount Change',   icon: 'tag' },
  { id: 'extended_discount',  label: 'Extended Discount', icon: 'calendar' },
]

// Latest 4 weekly rows per product.
// In production: GET /products + /history?product_id=...&limit=4
// Each row mirrors the backend's training schema: quantity sold, weekly sales, production cost.
export const LATEST_PRODUCT_ROWS = {
  8999: [   // Wedding Dress
    { week: '2024-W18', quantity:  68, sales: 6800,  productionCost: 2720 },
    { week: '2024-W19', quantity:  72, sales: 7200,  productionCost: 2880 },
    { week: '2024-W20', quantity:  81, sales: 8100,  productionCost: 3240 },
    { week: '2024-W21', quantity:  77, sales: 7700,  productionCost: 3080 },
  ],
  12717: [  // Graduation Dress
    { week: '2024-W18', quantity: 102, sales: 8160,  productionCost: 3264 },
    { week: '2024-W19', quantity: 110, sales: 8800,  productionCost: 3520 },
    { week: '2024-W20', quantity:  98, sales: 7840,  productionCost: 3136 },
    { week: '2024-W21', quantity: 115, sales: 9200,  productionCost: 3680 },
  ],
  10013: [  // Party Dress
    { week: '2024-W18', quantity:  92, sales: 11040, productionCost: 4416 },
    { week: '2024-W19', quantity: 105, sales: 12600, productionCost: 5040 },
    { week: '2024-W20', quantity:  98, sales: 11760, productionCost: 4704 },
    { week: '2024-W21', quantity: 110, sales: 13200, productionCost: 5280 },
  ],
}

// Compute the 4 overview KPIs from the latest rows of all selected products.
export function computeOverviewKpis(rowsByProduct = LATEST_PRODUCT_ROWS) {
  let totalQty   = 0
  let totalSales = 0
  let totalCost  = 0
  let topProduct = { name: '—', sales: 0, id: null }

  for (const [pid, rows] of Object.entries(rowsByProduct)) {
    const productSales = rows.reduce((s, r) => s + r.sales, 0)
    if (productSales > topProduct.sales) {
      const meta = PRODUCTS.find((p) => p.id === Number(pid))
      topProduct = { name: meta?.name || `Product ${pid}`, sales: productSales, id: Number(pid) }
    }
    for (const r of rows) {
      totalQty   += r.quantity
      totalSales += r.sales
      totalCost  += r.productionCost
    }
  }

  return {
    totalQuantity: totalQty,
    totalSales:    totalSales,
    totalProfit:   totalSales - totalCost,
    topProduct:    topProduct,
  }
}

// Mock baseline & predicted data per scenario.
// Price + Discount scenarios: a single comparison (Baseline vs Predicted), no months.
// Extended Discount: monthly grouped bars.
export const MOCK_SCENARIO_RESULTS = {
  price_change: {
    type: 'single',
    bars: [
      { label: 'Baseline',  value: 51860, kind: 'baseline' },
      { label: 'Predicted', value: 62020, kind: 'predicted' },
    ],
    totals: {
      baseline:  51860,
      predicted: 62020,
      changePct: 19.6,
    },
  },
  discount_change: {
    type: 'single',
    bars: [
      { label: 'Baseline',  value: 51860, kind: 'baseline' },
      { label: 'Predicted', value: 58300, kind: 'predicted' },
    ],
    totals: {
      baseline:  51860,
      predicted: 58300,
      changePct: 12.4,
    },
  },
  extended_discount: {
    type: 'monthly',
    months: [
      { month: 'March', baseline: 47000, predicted: 71000 },
      { month: 'April', baseline: 58000, predicted: 85000 },
      { month: 'May',   baseline: 70000, predicted: 102000 },
    ],
    totals: {
      baseline:  175000,
      predicted: 258000,
      changePct: 47.4,
    },
  },
}

// Initial chat history
export const INITIAL_CHAT = [
  {
    id: 1,
    sender: 'user',
    text:   'What if I apply 35% discount on Wedding Dress?',
    time:   '10:42 AM',
  },
  {
    id: 2,
    sender: 'bot',
    text:   'Applying 35% discount on Wedding Dress is predicted to increase sales by 19.6%. The chart on the left has been updated.',
    time:   '10:42 AM',
  },
]

// Mock chat parser — detects scenario type and returns both a text reply
// and a scenarioResult that the dashboard can use to update the chart and summary.
export function generateMockBotReply(userMessage) {
  const lower = userMessage.toLowerCase()

  // Extended discount → monthly chart
  if ((lower.includes('discount') || lower.includes('reduce') || lower.includes('off')) &&
      (lower.includes('month') || lower.includes('quarter') ||
       lower.includes('through') || lower.includes('extended'))) {
    return {
      text: 'Running an extended discount across the selected period is predicted to increase total sales by ~47%. The chart and summary cards have been updated.',
      scenarioId: 'extended_discount',
      scenarioResult: MOCK_SCENARIO_RESULTS.extended_discount,
    }
  }

  // Discount change → single comparison
  if (lower.includes('discount') || lower.includes('% off') || lower.includes('promo')) {
    return {
      text: 'Applying that discount is predicted to lift sales by ~12.4%. The chart and summary cards have been updated.',
      scenarioId: 'discount_change',
      scenarioResult: MOCK_SCENARIO_RESULTS.discount_change,
    }
  }

  // Price increase → single comparison
  if (lower.includes('price') || lower.includes('increase') || lower.includes('raise') ||
      lower.includes('sar')   || lower.includes('higher')) {
    return {
      text: 'A price increase of that size is predicted to lift overall revenue by ~19.6%. The chart and summary cards have been updated.',
      scenarioId: 'price_change',
      scenarioResult: MOCK_SCENARIO_RESULTS.price_change,
    }
  }

  // Stats / comparisons → no chart update
  if (lower.includes('best')  || lower.includes('top')   || lower.includes('worst') ||
      lower.includes('which') || lower.includes('compare')) {
    return {
      text: 'Based on the latest weekly data, the Party Dress is the top performer, followed by the Graduation Dress and the Wedding Dress.',
    }
  }

  return {
    text: 'I can simulate price increases, discount changes, and extended discount campaigns. Try: "What if I raise the Party Dress price by 10 SAR?" or "What if I apply a 35% discount on the Wedding Dress for March through May?"',
  }
}
