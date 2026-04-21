"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  currentEmployee,
  kpis,
  calculateBonusAmount,
  calculateWeightedScore,
} from "@/lib/bonus-data"
import { TrendingUp, Target, DollarSign, Award } from "lucide-react"

export function BonusSummary() {
  const { amount, percentage } = calculateBonusAmount(currentEmployee, kpis)
  const targetBonus = currentEmployee.baseSalary * (currentEmployee.targetBonusPercent / 100)
  const maxBonus = targetBonus * 1.5
  const progressToMax = (amount / maxBonus) * 100

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Estimated Bonus</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            ${amount.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {percentage}% of target bonus
          </p>
          <Progress value={progressToMax} className="mt-2 h-2" />
          <p className="mt-1 text-xs text-muted-foreground">
            ${amount.toLocaleString()} / ${maxBonus.toLocaleString()} max
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Target Bonus</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${targetBonus.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {currentEmployee.targetBonusPercent}% of base salary
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Base:</span>
            <span className="text-xs font-medium">
              ${currentEmployee.baseSalary.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(calculateWeightedScore(kpis))}%
          </div>
          <p className="text-xs text-muted-foreground">
            Weighted performance score
          </p>
          <div className="mt-2 flex items-center gap-1">
            {percentage >= 100 ? (
              <span className="text-xs font-medium text-accent">Above Target</span>
            ) : percentage >= 50 ? (
              <span className="text-xs font-medium text-chart-3">On Track</span>
            ) : (
              <span className="text-xs font-medium text-destructive">Below Threshold</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance Rating</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currentEmployee.performanceRating.toFixed(1)}/5.0
          </div>
          <p className="text-xs text-muted-foreground">
            Individual performance score
          </p>
          <Progress
            value={(currentEmployee.performanceRating / 5) * 100}
            className="mt-2 h-2"
          />
        </CardContent>
      </Card>
    </div>
  )
}
