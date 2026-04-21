// STIP Structure Types and Data

export interface TeamFinancialMetric {
  id: string
  name: string
  target: number
  actual: number
  unit: "currency" | "percentage" | "number"
  description: string
}

export interface AVPriority {
  id: string
  name: string
  description: string
  selected: boolean
}

export interface IndividualGoal {
  id: string
  name: string
  description: string
  status: "on-track" | "at-risk" | "completed" | "not-started"
}

export interface PerformanceRating {
  score: 1 | 2 | 3 | 4 | 5
  label: string
  multiplier: number
}

export interface EmployeeData {
  name: string
  title: string
  department: string
  teamLevel: string // Corp > Segment > Group > BU > Product
  baseSalary: number
  targetBonusPercent: number
  fiscalYear: string
}

export interface STIPData {
  employee: EmployeeData
  teamFinancials: TeamFinancialMetric[]
  avPriorities: AVPriority[]
  individualGoals: IndividualGoal[]
  personalRating: PerformanceRating
}

// Performance rating scale
export const ratingScale: PerformanceRating[] = [
  { score: 5, label: "Exceptional", multiplier: 1.2 },
  { score: 4, label: "Above Expectations", multiplier: 1.1 },
  { score: 3, label: "Meets Expectations", multiplier: 1.0 },
  { score: 2, label: "Below Expectations", multiplier: 0.9 },
  { score: 1, label: "Unsatisfactory", multiplier: 0 },
]

// AV Priorities Menu
export const avPrioritiesMenu: Omit<AVPriority, "selected">[] = [
  { id: "mfg-supply", name: "Mfg & Supply Chain Resiliency", description: "Strengthen manufacturing capabilities and supply chain reliability" },
  { id: "branding", name: "Branding", description: "Enhance company brand recognition and market positioning" },
  { id: "oracle-fusion", name: "Oracle Fusion Implementation", description: "Support successful ERP system implementation" },
  { id: "commonality", name: "Commonality", description: "Drive product and process standardization across business units" },
  { id: "international", name: "International Expansion", description: "Expand presence in international markets" },
]

// Payout scale calculation for a single metric
export function calculatePayoutPercent(achievementPercent: number): number {
  // Below 80% = 0% payout
  if (achievementPercent < 0.8) return 0
  // 80% achievement = 40% payout, scales linearly to 100% = 100% payout
  if (achievementPercent < 1.0) {
    // Linear interpolation from (0.8, 0.4) to (1.0, 1.0)
    return 0.4 + ((achievementPercent - 0.8) / 0.2) * 0.6
  }
  // 100% to 120% achievement scales from 100% to 150% payout
  if (achievementPercent < 1.2) {
    // Linear interpolation from (1.0, 1.0) to (1.2, 1.5)
    return 1.0 + ((achievementPercent - 1.0) / 0.2) * 0.5
  }
  // Above 120% = capped at 150%
  return 1.5
}

// Calculate team financial performance
export function calculateTeamFinancialPerformance(metrics: TeamFinancialMetric[]): {
  individualAchievements: { id: string; name: string; achievement: number; payout: number }[]
  weightedAchievement: number
  weightedPayout: number
} {
  const weight = 1 / metrics.length // Equal weighting (33.33% each)
  
  const individualAchievements = metrics.map(metric => {
    const achievement = metric.actual / metric.target
    const payout = calculatePayoutPercent(achievement)
    return { id: metric.id, name: metric.name, achievement, payout }
  })
  
  const weightedAchievement = individualAchievements.reduce((sum, m) => sum + m.achievement * weight, 0)
  const weightedPayout = individualAchievements.reduce((sum, m) => sum + m.payout * weight, 0)
  
  return { individualAchievements, weightedAchievement, weightedPayout }
}

// Calculate final STIP payout
export function calculateSTIPPayout(data: STIPData): {
  targetBonus: number
  teamFinancialPayout: number
  personalMultiplier: number
  finalPayoutPercent: number
  finalPayoutAmount: number
  teamPerformance: ReturnType<typeof calculateTeamFinancialPerformance>
} {
  const targetBonus = data.employee.baseSalary * data.employee.targetBonusPercent
  const teamPerformance = calculateTeamFinancialPerformance(data.teamFinancials)
  const teamFinancialPayout = teamPerformance.weightedPayout
  const personalMultiplier = data.personalRating.multiplier
  
  const finalPayoutPercent = teamFinancialPayout * personalMultiplier
  const finalPayoutAmount = targetBonus * finalPayoutPercent
  
  return {
    targetBonus,
    teamFinancialPayout,
    personalMultiplier,
    finalPayoutPercent,
    finalPayoutAmount,
    teamPerformance,
  }
}

// Demo employee data
export const demoSTIPData: STIPData = {
  employee: {
    name: "Sarah Chen",
    title: "Senior Account Executive",
    department: "Tactical Missile Systems",
    teamLevel: "Business Unit",
    baseSalary: 125000,
    targetBonusPercent: 0.15,
    fiscalYear: "FY2026",
  },
  teamFinancials: [
    {
      id: "orders",
      name: "Orders",
      target: 48000000,
      actual: 52800000,
      unit: "currency",
      description: "New orders booked in fiscal year",
    },
    {
      id: "revenue",
      name: "Revenue",
      target: 42000000,
      actual: 44100000,
      unit: "currency",
      description: "Recognized revenue for fiscal year",
    },
    {
      id: "margin",
      name: "Adj. Gross Margin",
      target: 0.32,
      actual: 0.298,
      unit: "percentage",
      description: "Adjusted gross margin percentage",
    },
  ],
  avPriorities: [
    { ...avPrioritiesMenu[0], selected: true },
    { ...avPrioritiesMenu[2], selected: true },
    { ...avPrioritiesMenu[4], selected: true },
  ],
  individualGoals: [
    {
      id: "goal-1",
      name: "Expand APAC Distribution Network",
      description: "Establish partnerships with 3 new distributors in APAC region",
      status: "completed",
    },
    {
      id: "goal-2",
      name: "Achieve 95% Customer Satisfaction",
      description: "Maintain customer satisfaction score above 95% across all accounts",
      status: "on-track",
    },
    {
      id: "goal-3",
      name: "Mentor 2 Junior Team Members",
      description: "Provide mentorship and development support to new team members",
      status: "on-track",
    },
  ],
  personalRating: ratingScale[1], // 4 - Above Expectations
}

// Format currency
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toLocaleString()}`
}

// Format percentage
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}
