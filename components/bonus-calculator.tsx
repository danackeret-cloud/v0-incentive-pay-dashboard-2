"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { currentEmployee, kpis, payoutTiers } from "@/lib/bonus-data"

export function BonusCalculator() {
  const targetBonus = currentEmployee.baseSalary * (currentEmployee.targetBonusPercent / 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>How Your Bonus is Calculated</CardTitle>
        <CardDescription>
          Understanding the formula behind your short-term incentive pay
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formula explanation */}
        <div className="rounded-lg bg-secondary/50 p-6">
          <h3 className="mb-4 text-center text-lg font-semibold">Bonus Formula</h3>
          <div className="flex flex-wrap items-center justify-center gap-2 text-center">
            <div className="rounded-md bg-card px-4 py-2 shadow-sm">
              <p className="text-xs text-muted-foreground">Base Salary</p>
              <p className="font-mono font-bold">
                ${currentEmployee.baseSalary.toLocaleString()}
              </p>
            </div>
            <span className="text-xl font-bold text-muted-foreground">×</span>
            <div className="rounded-md bg-card px-4 py-2 shadow-sm">
              <p className="text-xs text-muted-foreground">Target %</p>
              <p className="font-mono font-bold">{currentEmployee.targetBonusPercent}%</p>
            </div>
            <span className="text-xl font-bold text-muted-foreground">×</span>
            <div className="rounded-md bg-card px-4 py-2 shadow-sm">
              <p className="text-xs text-muted-foreground">Performance Score</p>
              <p className="font-mono font-bold">50-150%</p>
            </div>
            <span className="text-xl font-bold text-muted-foreground">=</span>
            <div className="rounded-md bg-primary px-4 py-2 text-primary-foreground shadow-sm">
              <p className="text-xs opacity-90">Your Bonus</p>
              <p className="font-mono font-bold">
                ${Math.round(targetBonus * 0.5).toLocaleString()} - $
                {Math.round(targetBonus * 1.5).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Step by step */}
        <div className="space-y-4">
          <h3 className="font-semibold">Step-by-Step Calculation</h3>

          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                1
              </div>
              <div>
                <p className="font-medium">Calculate Target Bonus</p>
                <p className="text-sm text-muted-foreground">
                  Your base salary (${currentEmployee.baseSalary.toLocaleString()}) ×{" "}
                  {currentEmployee.targetBonusPercent}% ={" "}
                  <span className="font-semibold">
                    ${targetBonus.toLocaleString()} target bonus
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                2
              </div>
              <div>
                <p className="font-medium">Calculate Weighted Performance Score</p>
                <p className="text-sm text-muted-foreground">
                  Each KPI is scored from 0-150% based on your performance against
                  threshold/target/max, then weighted:
                </p>
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="px-2 py-1 text-left font-medium">KPI</th>
                        <th className="px-2 py-1 text-left font-medium">Weight</th>
                        <th className="px-2 py-1 text-left font-medium">Contribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kpis.map((kpi) => (
                        <tr key={kpi.id} className="border-b border-border/50">
                          <td className="px-2 py-1">{kpi.name}</td>
                          <td className="px-2 py-1">{kpi.weight}%</td>
                          <td className="px-2 py-1 text-muted-foreground">
                            Score × {kpi.weight}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                3
              </div>
              <div>
                <p className="font-medium">Apply Performance Multiplier</p>
                <p className="text-sm text-muted-foreground">
                  Your final bonus = Target Bonus × (Weighted Score / 100)
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  {payoutTiers.map((tier) => (
                    <div
                      key={tier.level}
                      className="rounded bg-secondary/70 px-3 py-2 text-center"
                    >
                      <p className="font-medium">{tier.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {tier.percentage}% = $
                        {Math.round(targetBonus * (tier.percentage / 100)).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important notes */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-2 font-semibold">Important Notes</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              • <strong>Threshold (50%):</strong> Minimum performance to receive any bonus
            </li>
            <li>
              • <strong>Target (100%):</strong> Expected performance for full target bonus
            </li>
            <li>
              • <strong>Maximum (150%):</strong> Outstanding performance cap
            </li>
            <li>
              • Individual KPIs account for {kpis.filter((k) => k.category === "individual").reduce((s, k) => s + k.weight, 0)}% of your total bonus
            </li>
            <li>
              • Team performance contributes {kpis.filter((k) => k.category === "team").reduce((s, k) => s + k.weight, 0)}% to your bonus
            </li>
            <li>
              • Company results contribute {kpis.filter((k) => k.category === "company").reduce((s, k) => s + k.weight, 0)}% to your bonus
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
