"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/stip-calculator"

interface ResultsPanelProps {
  targetBonus: number
  teamFinancialPayout: number
  personalMultiplier: number
  finalPayoutPercent: number
  finalPayoutAmount: number
  ratingLabel: string
}

export function ResultsPanel({
  targetBonus,
  teamFinancialPayout,
  personalMultiplier,
  finalPayoutPercent,
  finalPayoutAmount,
  ratingLabel,
}: ResultsPanelProps) {
  const isZeroPayout = personalMultiplier === 0 || teamFinancialPayout === 0

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle>Estimated STIP Payout</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Formula Visualization */}
        <div className="mb-6 flex flex-col items-center gap-4 md:flex-row md:justify-center">
          <div className="flex flex-col items-center rounded-lg border bg-card p-4 text-center">
            <span className="text-sm text-muted-foreground">Target Bonus</span>
            <span className="text-xl font-bold">{formatCurrency(targetBonus)}</span>
          </div>
          <span className="text-2xl font-bold text-muted-foreground">x</span>
          <div className="flex flex-col items-center rounded-lg border bg-card p-4 text-center">
            <span className="text-sm text-muted-foreground">Team Financials</span>
            <span className="text-xl font-bold">{teamFinancialPayout.toFixed(1)}%</span>
          </div>
          <span className="text-2xl font-bold text-muted-foreground">x</span>
          <div className="flex flex-col items-center rounded-lg border bg-card p-4 text-center">
            <span className="text-sm text-muted-foreground">Performance Rating</span>
            <span className="text-xl font-bold">{(personalMultiplier * 100).toFixed(0)}%</span>
          </div>
          <span className="text-2xl font-bold text-muted-foreground">=</span>
          <div className={`flex flex-col items-center rounded-lg p-4 text-center ${isZeroPayout ? "bg-destructive/10" : "bg-primary"}`}>
            <span className={`text-sm ${isZeroPayout ? "text-destructive" : "text-primary-foreground/80"}`}>Est. Payout</span>
            <span className={`text-2xl font-bold ${isZeroPayout ? "text-destructive" : "text-primary-foreground"}`}>
              ~{formatCurrency(finalPayoutAmount)}
            </span>
          </div>
        </div>

        {/* Estimate disclaimer */}
        <div className="mt-4 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">This is an estimate.</span> Your actual payout may vary based on how your manager allocates the team&apos;s fixed bonus pool. Higher performers typically receive a larger percentage of their salary, while lower performers receive less.
          </p>
        </div>

        {/* Summary */}
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Est. % of Target</p>
              <p className="text-2xl font-bold">~{finalPayoutPercent.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. Payout Amount</p>
              <p className={`text-2xl font-bold ${isZeroPayout ? "text-destructive" : "text-accent"}`}>
                ~{formatCurrency(finalPayoutAmount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Est. Difference from Target</p>
              <p className={`text-2xl font-bold ${finalPayoutAmount >= targetBonus ? "text-accent" : "text-destructive"}`}>
                {finalPayoutAmount >= targetBonus ? "+" : ""}~{formatCurrency(Math.abs(finalPayoutAmount - targetBonus))}
              </p>
            </div>
          </div>
        </div>

        {/* Calculation breakdown */}
        <div className="mt-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Calculation:</p>
          <p className="font-mono text-xs">
            {formatCurrency(targetBonus)} x {teamFinancialPayout.toFixed(1)}% x {(personalMultiplier * 100).toFixed(0)}% = {formatCurrency(finalPayoutAmount)}
          </p>
        </div>

        {isZeroPayout && (
          <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {personalMultiplier === 0 
              ? "A 'Needs Improvement' rating results in $0 payout regardless of team performance."
              : "Team financial performance below 80% results in $0 payout."}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
