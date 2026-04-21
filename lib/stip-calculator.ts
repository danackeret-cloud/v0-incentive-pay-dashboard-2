// STIP Calculator Types and Logic

export interface Team {
  id: string
  name: string
  level: string
  financialTargets: {
    orders: number
    revenue: number
    margin: number // as decimal, e.g. 0.32 for 32%
  }
}

export interface PerformanceRating {
  score: 1 | 2 | 3 | 4 | 5
  label: string
  multiplier: number
}

// Performance rating scale
export const ratingScale: PerformanceRating[] = [
  { score: 5, label: "Exceptional", multiplier: 1.2 },
  { score: 4, label: "Above Expectations", multiplier: 1.1 },
  { score: 3, label: "Meets Expectations", multiplier: 1.0 },
  { score: 2, label: "Below Expectations", multiplier: 0.9 },
  { score: 1, label: "Unsatisfactory", multiplier: 0 },
]

// Sample teams with different financial targets
export const teams: Team[] = [
  {
    id: "tms",
    name: "Tactical Missile Systems",
    level: "Business Unit",
    financialTargets: { orders: 480000000, revenue: 420000000, margin: 0.32 },
  },
  {
    id: "uas",
    name: "Uncrewed Aircraft Systems",
    level: "Business Unit",
    financialTargets: { orders: 350000000, revenue: 310000000, margin: 0.28 },
  },
  {
    id: "lss",
    name: "Loitering Munitions",
    level: "Product Line",
    financialTargets: { orders: 180000000, revenue: 145000000, margin: 0.35 },
  },
  {
    id: "power",
    name: "Power Solutions",
    level: "Segment",
    financialTargets: { orders: 220000000, revenue: 195000000, margin: 0.25 },
  },
  {
    id: "space",
    name: "Space Systems",
    level: "Business Unit",
    financialTargets: { orders: 95000000, revenue: 82000000, margin: 0.22 },
  },
  {
    id: "corp",
    name: "Corporate Functions",
    level: "Corporate",
    financialTargets: { orders: 1500000000, revenue: 1350000000, margin: 0.30 },
  },
]

// Payout scale calculation - converts achievement % to payout %
export function calculatePayoutPercent(achievementPercent: number): number {
  // Below 80% = 0% payout
  if (achievementPercent < 80) return 0
  // 80% achievement = 40% payout, scales linearly to 100% = 100% payout
  if (achievementPercent < 100) {
    return 40 + ((achievementPercent - 80) / 20) * 60
  }
  // 100% to 120% achievement scales from 100% to 150% payout
  if (achievementPercent < 120) {
    return 100 + ((achievementPercent - 100) / 20) * 50
  }
  // Above 120% = capped at 150%
  return 150
}

// Calculate team financial performance from three metrics
export function calculateTeamFinancialPayout(
  ordersAchievement: number,
  revenueAchievement: number,
  marginAchievement: number
): {
  ordersPayout: number
  revenuePayout: number
  marginPayout: number
  weightedPayout: number
} {
  const ordersPayout = calculatePayoutPercent(ordersAchievement)
  const revenuePayout = calculatePayoutPercent(revenueAchievement)
  const marginPayout = calculatePayoutPercent(marginAchievement)
  
  // Equal weighting: 33.33% each
  const weightedPayout = (ordersPayout + revenuePayout + marginPayout) / 3
  
  return { ordersPayout, revenuePayout, marginPayout, weightedPayout }
}

// Calculate final STIP payout
export function calculateFinalPayout(
  baseSalary: number,
  targetPercent: number,
  teamFinancialPayout: number,
  personalRating: PerformanceRating
): {
  targetBonus: number
  finalPayoutPercent: number
  finalPayoutAmount: number
} {
  const targetBonus = baseSalary * (targetPercent / 100)
  const finalPayoutPercent = (teamFinancialPayout / 100) * personalRating.multiplier
  const finalPayoutAmount = targetBonus * finalPayoutPercent
  
  return {
    targetBonus,
    finalPayoutPercent: finalPayoutPercent * 100, // Convert to percentage
    finalPayoutAmount,
  }
}

// Format currency
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Format large currency (millions)
export function formatLargeCurrency(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return formatCurrency(value)
}
