// Mock data for Optima frontend.
// Replace these with API calls when the backend is ready.

export const PRODUCTS = [
  { id: 8999,  name: 'Wedding Dress',     basePrice: 100, color: '#ec4899' },
  { id: 12717, name: 'Graduation Dress',  basePrice: 80,  color: '#6366f1' },
  { id: 10013, name: 'Party Dress',       basePrice: 120, color: '#7c6df2' },
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

// Top 3 KPI cards
export const KPIS = {
  totalSales: {
    label:  'Total Sales (This Month)',
    value:  'SAR 245,680',
    delta:  '+12.4%',
    deltaPositive: true,
    sub:    'vs Last Month',
    spark:  [120, 140, 135, 165, 180, 175, 195, 220, 215, 240, 245, 246],
  },
  topProduct: {
    label: 'Top Performing Product',
    value: 'Party Dress',
    sub:   'SAR 52,430 of total sales',
    spark: [60, 65, 68, 72, 75, 80, 85, 90, 95, 100, 110, 115],
  },
  growth: {
    label: 'Sales Growth (This Month)',
    value: '↑ 19.6%',
    delta: '+19.6%',
    deltaPositive: true,
    sub:   'vs Last Month',
    spark: [40, 60, 50, 70, 80, 75, 90, 110, 100, 130, 140, 150],
  },
}

// Mock baseline & predicted data per scenario
// In production, these come from POST /whatif/* endpoints
export const MOCK_SCENARIO_RESULTS = {
  price_change: {
    months: [
      { month: 'Mar 2024', baseline: 47000, predicted: 67000 },
      { month: 'Apr 2024', baseline: 58000, predicted: 75000 },
      { month: 'May 2024', baseline: 70000, predicted: 88000 },
    ],
    totals: {
      baseline:  51860,
      predicted: 62020,
      changePct: 19.6,
    },
  },
  discount_change: {
    months: [
      { month: 'Mar 2024', baseline: 47000, predicted: 58000 },
      { month: 'Apr 2024', baseline: 58000, predicted: 68000 },
      { month: 'May 2024', baseline: 70000, predicted: 78000 },
    ],
    totals: {
      baseline:  51860,
      predicted: 58300,
      changePct: 12.4,
    },
  },
  extended_discount: {
    months: [
      { month: 'Mar 2024', baseline: 47000, predicted: 71000 },
      { month: 'Apr 2024', baseline: 58000, predicted: 85000 },
      { month: 'May 2024', baseline: 70000, predicted: 102000 },
    ],
    totals: {
      baseline:  51860,
      predicted: 73000,
      changePct: 40.8,
    },
  },
}

// Mock chat messages
export const INITIAL_CHAT = [
  {
    id: 1,
    sender: 'user',
    text: 'What if I apply 35% discount on Wedding Dress?',
    time: '10:42 AM',
  },
  {
    id: 2,
    sender: 'bot',
    text: 'Applying 35% discount on Wedding Dress is predicted to increase sales by 19.6%.',
    time: '10:42 AM',
    chart: [40, 45, 42, 50, 55, 53, 60, 65, 68, 72, 78, 82],
    delta: '+19.6%',
  },
]

// Helper to generate a mock bot response based on the user message
export function generateMockBotReply(userMessage) {
  const lower = userMessage.toLowerCase()
  if (lower.includes('discount')) {
    return {
      text: 'Based on current data, applying that discount could increase predicted sales by around 12% — 20%.',
      chart: [50, 55, 58, 62, 65, 70, 72, 78, 82, 85, 88, 92],
      delta: '+15.2%',
    }
  }
  if (lower.includes('price') || lower.includes('increase') || lower.includes('raise')) {
    return {
      text: 'A price increase of that size is predicted to lift overall revenue by approximately 19.6%.',
      chart: [40, 45, 42, 50, 55, 53, 60, 65, 68, 72, 78, 82],
      delta: '+19.6%',
    }
  }
  if (lower.includes('best') || lower.includes('top') || lower.includes('worst')) {
    return {
      text: 'Across the last year, May and December were the strongest months for the Party Dress, while August was the weakest.',
    }
  }
  return {
    text: 'I can help you simulate price increases, discount changes, or extended discount campaigns. Try asking "What if I raise the Party Dress price by 10 SAR?"',
  }
}
