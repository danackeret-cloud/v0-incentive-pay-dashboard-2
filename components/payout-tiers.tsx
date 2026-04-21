"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  currentEmployee,
  kpis,
  payoutTiers,
  calculateWeightedScore,
} from "@/lib/bonus-data"
import { cn } from "@/lib/utils"
import { Check, ChevronRight } from "lucide-react"

export function PayoutTiers() {
  const score = calculateWeightedScore(kpis)
  const targetBonus = currentEmployee.baseSalary * (currentEmployee.targetBonusPercent / 100)

  const getCurrentTier = () => {
    if (score >= 150) return "maximum"
    if (score >= 100) return "target"
    if (score >= 50) return "threshold"
    return null
  }

  const currentTier = getCurrentTier()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Tiers</CardTitle>
        <CardDescription>
          Your bonus scales based on performance level achieved
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Progress bar background */}
          <div className="absolute left-0 top-8 h-2 w-full rounded-full bg-secondary" />
          
          {/* Progress bar fill */}
          <div
            className="absolute left-0 top-8 h-2 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min((score / 150) * 100, 100)}%` }}
          />

          {/* Tier markers */}
          <div className="relative flex justify-between">
            {payoutTiers.map((tier, index) => {
              const isActive = currentTier === tier.level
              const isPassed =
                (tier.level === "threshold" && score >= 50) ||
                (tier.level === "target" && score >= 100) ||
                (tier.level === "maximum" && score >= 150)
              const bonusAtTier = Math.round(targetBonus * (tier.percentage / 100))

              return (
                <div
                  key={tier.level}
                  className={cn(
                    "flex flex-col items-center",
                    index === 0 && "items-start",
                    index === payoutTiers.length - 1 && "items-end"
                  )}
                >
                  {/* Marker dot */}
                  <div
                    className={cn(
                      "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                      isPassed
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card"
                    )}
                  >
                    {isPassed && <Check className="h-3 w-3" />}
                  </div>

                  {/* Tier info */}
                  <div
                    className={cn(
                      "mt-4 text-center",
                      index === 0 && "text-left",
                      index === payoutTiers.length - 1 && "text-right"
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isActive ? "text-primary" : "text-foreground"
                      )}
                    >
                      {tier.label}
                    </p>
                    <p className="text-lg font-bold">
                      ${bonusAtTier.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tier.percentage}% payout
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current status */}
        <div className="mt-8 rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Your Current Score</p>
              <p className="text-2xl font-bold text-primary">{Math.round(score)}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Current Payout Level</p>
              <p className="text-lg font-semibold capitalize">
                {currentTier || "Below Threshold"}
              </p>
            </div>
          </div>
          {score < 50 && (
            <p className="mt-2 text-sm text-destructive">
              You need {Math.round(50 - score)}% more to reach the threshold payout level.
            </p>
          )}
          {score >= 50 && score < 100 && (
            <p className="mt-2 text-sm text-muted-foreground">
              You need {Math.round(100 - score)}% more to reach target payout level.
            </p>
          )}
          {score >= 100 && score < 150 && (
            <p className="mt-2 text-sm text-accent">
              Great progress! You need {Math.round(150 - score)}% more to reach maximum payout.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
