export interface KPI {
  id: string
  name: string
  weight: number
  threshold: number
  target: number
  maximum: number
  current: number
  unit: string
  category: "individual" | "team" | "company"
}

export interface PayoutTier {
  level: "threshold" | "target" | "maximum"
  percentage: number
  label: string
  description: string
}

export interface Employee {
  id: string
  name: string
  title: string
  department: string
  baseSalary: number
  targetBonusPercent: number
  performanceRating: number
}

export const currentEmployee: Employee = {
  id: "emp-001",
  name: "Sarah Chen",
  title: "Senior Account Executive",
  department: "Sales",
  baseSalary: 95000,
  targetBonusPercent: 20,
  performanceRating: 4.2,
}

export const payoutTiers: PayoutTier[] = [
  {
    level: "threshold",
    percentage: 50,
    label: "Threshold",
    description: "Minimum performance level to qualify for any bonus payout",
  },
  {
    level: "target",
    percentage: 100,
    label: "Target",
    description: "Expected performance level for full target bonus",
  },
  {
    level: "maximum",
    percentage: 150,
    label: "Maximum",
    description: "Outstanding performance earns up to 150% of target bonus",
  },
]

export const kpis: KPI[] = [
  {
    id: "kpi-1",
    name: "Revenue Achievement",
    weight: 30,
    threshold: 80,
    target: 100,
    maximum: 120,
    current: 108,
    unit: "%",
    category: "individual",
  },
  {
    id: "kpi-2",
    name: "Order Volume",
    weight: 20,
    threshold: 150,
    target: 200,
    maximum: 250,
    current: 187,
    unit: "orders",
    category: "individual",
  },
  {
    id: "kpi-3",
    name: "Performance Rating",
    weight: 15,
    threshold: 3.0,
    target: 4.0,
    maximum: 5.0,
    current: 4.2,
    unit: "/5",
    category: "individual",
  },
  {
    id: "kpi-4",
    name: "Team Revenue",
    weight: 15,
    threshold: 85,
    target: 100,
    maximum: 115,
    current: 103,
    unit: "%",
    category: "team",
  },
  {
    id: "kpi-5",
    name: "Company Profit Margin",
    weight: 10,
    threshold: 12,
    target: 15,
    maximum: 18,
    current: 14.2,
    unit: "%",
    category: "company",
  },
  {
    id: "kpi-6",
    name: "Company Revenue Growth",
    weight: 10,
    threshold: 5,
    target: 10,
    maximum: 15,
    current: 11.5,
    unit: "%",
    category: "company",
  },
]

export function calculateKPIScore(kpi: KPI): number {
  const { threshold, target, maximum, current } = kpi

  if (current < threshold) {
    return 0
  } else if (current >= maximum) {
    return 150
  } else if (current >= target) {
    // Between target and maximum: 100% to 150%
    const progress = (current - target) / (maximum - target)
    return 100 + progress * 50
  } else {
    // Between threshold and target: 50% to 100%
    const progress = (current - threshold) / (target - threshold)
    return 50 + progress * 50
  }
}

export function calculateWeightedScore(kpis: KPI[]): number {
  let totalWeightedScore = 0
  let totalWeight = 0

  for (const kpi of kpis) {
    const score = calculateKPIScore(kpi)
    totalWeightedScore += score * (kpi.weight / 100)
    totalWeight += kpi.weight
  }

  return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0
}

export function calculateBonusAmount(
  employee: Employee,
  kpis: KPI[]
): { amount: number; percentage: number } {
  const weightedScore = calculateWeightedScore(kpis)
  const targetBonus = employee.baseSalary * (employee.targetBonusPercent / 100)
  const bonusMultiplier = weightedScore / 100
  const amount = targetBonus * bonusMultiplier

  return {
    amount: Math.round(amount),
    percentage: Math.round(weightedScore),
  }
}

export function getCategoryKPIs(kpis: KPI[], category: KPI["category"]): KPI[] {
  return kpis.filter((kpi) => kpi.category === category)
}

export function getCategoryWeight(kpis: KPI[], category: KPI["category"]): number {
  return getCategoryKPIs(kpis, category).reduce((sum, kpi) => sum + kpi.weight, 0)
}

export function getCategoryScore(kpis: KPI[], category: KPI["category"]): number {
  const categoryKPIs = getCategoryKPIs(kpis, category)
  if (categoryKPIs.length === 0) return 0

  const totalWeight = categoryKPIs.reduce((sum, kpi) => sum + kpi.weight, 0)
  const weightedScore = categoryKPIs.reduce((sum, kpi) => {
    const score = calculateKPIScore(kpi)
    return sum + score * (kpi.weight / totalWeight)
  }, 0)

  return Math.round(weightedScore)
}
