// STIP Calculator Types and Logic

export interface PerformanceRating {
  score: 1 | 2 | 3 | 4 | 5
  label: string
  multiplier: number
  multiplierMin: number // Lower end of range (-10%)
  multiplierMax: number // Upper end of range (+10%)
}

// Performance rating scale - ordered 1 to 5 for left-to-right display
// Base payout percentages: 0%, 75%, 100%, 125%, 150%
// Actual payouts can vary +/- 10% based on manager's bonus pool allocation
export const ratingScale: PerformanceRating[] = [
  { score: 1, label: "Needs Improvement", multiplier: 0, multiplierMin: 0, multiplierMax: 0 },
  { score: 2, label: "Progressing", multiplier: 0.75, multiplierMin: 0.65, multiplierMax: 0.85 },
  { score: 3, label: "Effective", multiplier: 1.0, multiplierMin: 0.90, multiplierMax: 1.10 },
  { score: 4, label: "Excellent", multiplier: 1.25, multiplierMin: 1.15, multiplierMax: 1.35 },
  { score: 5, label: "Outstanding", multiplier: 1.5, multiplierMin: 1.40, multiplierMax: 1.60 },
]

// Payout scale calculation - converts achievement % to payout %
export function calculatePayoutPercent(achievementPercent: number): number {
  // Below 80% = 0% payout
  if (achievementPercent < 80) return 0
  // 80% achievement = 40% payout, scales linearly to 100% = 100% payout
  if (achievementPercent < 100) {
    return 40 + ((achievementPercent - 80) / 20) * 60
  }
  // 100% to 125% achievement scales from 100% to 150% payout
  if (achievementPercent < 125) {
    return 100 + ((achievementPercent - 100) / 25) * 50
  }
  // Above 125% = capped at 150%
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


