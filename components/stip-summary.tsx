"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  STIPData, 
  calculateSTIPPayout, 
  formatCurrency, 
  formatPercent 
} from "@/lib/bonus-data"
import { TrendingUp, Target, User, DollarSign } from "lucide-react"

interface STIPSummaryProps {
  data: STIPData
}

export function STIPSummary({ data }: STIPSummaryProps) {
  const payout = calculateSTIPPayout(data)
  
  const cards = [
    {
      title: "Estimated Bonus",
      value: formatCurrency(payout.finalPayoutAmount),
      subtext: `${formatPercent(payout.finalPayoutPercent)} of target`,
      icon: DollarSign,
      highlight: true,
    },
    {
      title: "Target Bonus",
      value: formatCurrency(payout.targetBonus),
      subtext: `${formatPercent(data.employee.targetBonusPercent)} of base salary`,
      icon: Target,
    },
    {
      title: "Team Financial Performance",
      value: formatPercent(payout.teamFinancialPayout),
      subtext: `${formatPercent(payout.teamPerformance.weightedAchievement)} achievement`,
      icon: TrendingUp,
    },
    {
      title: "Personal Rating",
      value: `${data.personalRating.score}/5`,
      subtext: `${data.personalRating.label} (${formatPercent(data.personalRating.multiplier)})`,
      icon: User,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className={card.highlight ? "border-primary bg-primary/5" : ""}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.highlight ? "text-primary" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.highlight ? "text-primary" : "text-foreground"}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.subtext}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
