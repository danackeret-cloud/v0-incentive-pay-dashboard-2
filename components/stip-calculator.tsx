"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  ratingScale,
  defaultTargets,
  calculatePayoutPercent,
  calculateAchievementPercent,
  calculateTeamFinancialPayout,
  calculateFinalPayout,
  formatCurrency,
  formatLargeCurrency,
  type PerformanceRating,
} from "@/lib/stip-calculator"
import { PayoutScaleVisual } from "./payout-scale-visual"
import { ResultsPanel } from "./results-panel"

export function STIPCalculator() {
  // Employee inputs
  const [baseSalary, setBaseSalary] = useState(125000)
  const [targetPercent, setTargetPercent] = useState(15)

  // Financial targets (editable, defaults to $100M, $100M, $50M)
  const [ordersTarget, setOrdersTarget] = useState(defaultTargets.orders)
  const [revenueTarget, setRevenueTarget] = useState(defaultTargets.revenue)
  const [marginTarget, setMarginTarget] = useState(defaultTargets.margin)

  // Actual amounts (what the sliders control) - default to 100% of target
  const [ordersActual, setOrdersActual] = useState(defaultTargets.orders)
  const [revenueActual, setRevenueActual] = useState(defaultTargets.revenue)
  const [marginActual, setMarginActual] = useState(defaultTargets.margin)

  // Personal rating - default to Average (score 3)
  const [personalRating, setPersonalRating] = useState<PerformanceRating>(ratingScale[2])

  // Calculate achievement percentages
  const ordersAchievement = calculateAchievementPercent(ordersActual, ordersTarget)
  const revenueAchievement = calculateAchievementPercent(revenueActual, revenueTarget)
  const marginAchievement = calculateAchievementPercent(marginActual, marginTarget)

  // Calculate results
  const teamFinancials = useMemo(
    () => calculateTeamFinancialPayout(ordersAchievement, revenueAchievement, marginAchievement),
    [ordersAchievement, revenueAchievement, marginAchievement]
  )

  const finalResults = useMemo(
    () => calculateFinalPayout(baseSalary, targetPercent, teamFinancials.weightedPayout, personalRating),
    [baseSalary, targetPercent, teamFinancials.weightedPayout, personalRating]
  )

  // Average achievement for visual
  const avgAchievement = (ordersAchievement + revenueAchievement + marginAchievement) / 3

  // Slider range: 0% to 150% of target
  const getSliderMax = (target: number) => target * 1.5

  return (
    <div className="space-y-6">
      {/* Your Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>Enter your compensation details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="salary">Base Salary</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="salary"
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value))}
                  className="pl-7"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">STIP Target %</Label>
              <div className="relative">
                <Input
                  id="target"
                  type="number"
                  value={targetPercent}
                  onChange={(e) => setTargetPercent(Number(e.target.value))}
                  className="pr-7"
                  min={0}
                  max={100}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-lg bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Target Bonus:</span>{" "}
              {formatCurrency(finalResults.targetBonus)} ({targetPercent}% of {formatCurrency(baseSalary)})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Two-column layout: Team Financials & Personal Rating */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Financial Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team Financial Performance</CardTitle>
            <CardDescription>
              Adjust the sliders to simulate different financial outcomes. Each metric is weighted equally (33.3%).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Orders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Orders</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Target:</span>
                  <div className="relative w-28">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={ordersTarget / 1000000}
                      onChange={(e) => {
                        const newTarget = Number(e.target.value) * 1000000
                        setOrdersTarget(newTarget)
                        // Keep actual at same achievement %
                        const currentAchievement = ordersActual / ordersTarget
                        setOrdersActual(newTarget * currentAchievement)
                      }}
                      className="h-8 pl-5 pr-7 text-sm"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">M</span>
                  </div>
                </div>
              </div>
              <Slider
                value={[ordersActual]}
                onValueChange={([v]) => setOrdersActual(v)}
                min={0}
                max={getSliderMax(ordersTarget)}
                step={ordersTarget / 100}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-lg">{formatLargeCurrency(ordersActual)}</span>
                <span className="text-muted-foreground">
                  {ordersAchievement.toFixed(0)}% of target = <span className="font-semibold text-foreground">{teamFinancials.ordersPayout.toFixed(0)}% payout</span>
                </span>
              </div>
              {/* Scale markers - positioned as % of slider width (0-150% maps to 0-100% width) */}
              <div className="relative h-8 text-xs text-muted-foreground">
                <div className="absolute left-0 -translate-x-1/2 text-center">
                  <div>$0</div>
                  <div>0%</div>
                </div>
                <div className="absolute text-center" style={{ left: `${(80/150)*100}%`, transform: 'translateX(-50%)' }}>
                  <div className="text-destructive">{formatLargeCurrency(ordersTarget * 0.8)}</div>
                  <div className="text-destructive font-medium">80%</div>
                </div>
                <div className="absolute text-center" style={{ left: `${(100/150)*100}%`, transform: 'translateX(-50%)' }}>
                  <div>{formatLargeCurrency(ordersTarget)}</div>
                  <div>100%</div>
                </div>
                <div className="absolute text-center" style={{ left: `${(120/150)*100}%`, transform: 'translateX(-50%)' }}>
                  <div className="text-accent">{formatLargeCurrency(ordersTarget * 1.2)}</div>
                  <div className="text-accent font-medium">120%</div>
                </div>
                <div className="absolute right-0 translate-x-1/2 text-center">
                  <div>{formatLargeCurrency(ordersTarget * 1.5)}</div>
                  <div>150%</div>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Revenue</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Target:</span>
                  <div className="relative w-28">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={revenueTarget / 1000000}
                      onChange={(e) => {
                        const newTarget = Number(e.target.value) * 1000000
                        setRevenueTarget(newTarget)
                        const currentAchievement = revenueActual / revenueTarget
                        setRevenueActual(newTarget * currentAchievement)
                      }}
                      className="h-8 pl-5 pr-7 text-sm"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">M</span>
                  </div>
                </div>
              </div>
              <Slider
                value={[revenueActual]}
                onValueChange={([v]) => setRevenueActual(v)}
                min={0}
                max={getSliderMax(revenueTarget)}
                step={revenueTarget / 100}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-lg">{formatLargeCurrency(revenueActual)}</span>
                <span className="text-muted-foreground">
                  {revenueAchievement.toFixed(0)}% of target = <span className="font-semibold text-foreground">{teamFinancials.revenuePayout.toFixed(0)}% payout</span>
                </span>
              </div>
              {/* Scale markers - positioned as % of slider width (0-150% maps to 0-100% width) */}
              <div className="relative h-8 text-xs text-muted-foreground">
                <div className="absolute left-0 -translate-x-1/2 text-center">
                  <div>$0</div>
                  <div>0%</div>
                </div>
                <div className="absolute text-center" style={{ left: `${(80/150)*100}%`, transform: 'translateX(-50%)' }}>
                  <div className="text-destructive">{formatLargeCurrency(revenueTarget * 0.8)}</div>
                  <div className="text-destructive font-medium">80%</div>
                </div>
                <div className="absolute text-center" style={{ left: `${(100/150)*100}%`, transform: 'translateX(-50%)' }}>
                  <div>{formatLargeCurrency(revenueTarget)}</div>
                  <div>100%</div>
                </div>
                <div className="absolute text-center" style={{ left: `${(120/150)*100}%`, transform: 'translateX(-50%)' }}>
                  <div className="text-accent">{formatLargeCurrency(revenueTarget * 1.2)}</div>
                  <div className="text-accent font-medium">120%</div>
                </div>
                <div className="absolute right-0 translate-x-1/2 text-center">
                  <div>{formatLargeCurrency(revenueTarget * 1.5)}</div>
                  <div>150%</div>
                </div>
              </div>
            </div>

            {/* Margin (in dollars) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Adj. Gross Margin</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Target:</span>
                  <div className="relative w-28">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={marginTarget / 1000000}
                      onChange={(e) => {
                        const newTarget = Number(e.target.value) * 1000000
                        setMarginTarget(newTarget)
                        const currentAchievement = marginActual / marginTarget
                        setMarginActual(newTarget * currentAchievement)
                      }}
                      className="h-8 pl-5 pr-7 text-sm"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">M</span>
                  </div>
                </div>
              </div>
              <Slider
                value={[marginActual]}
                onValueChange={([v]) => setMarginActual(v)}
                min={0}
                max={getSliderMax(marginTarget)}
                step={marginTarget / 100}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-lg">{formatLargeCurrency(marginActual)}</span>
                <span className="text-muted-foreground">
                  {marginAchievement.toFixed(0)}% of target = <span className="font-semibold text-foreground">{teamFinancials.marginPayout.toFixed(0)}% payout</span>
                </span>
              </div>
              {/* Scale markers - positioned as % of slider width (0-150% maps to 0-100% width) */}
              <div className="relative h-8 text-xs text-muted-foreground">
                <div className="absolute left-0 -translate-x-1/2 text-center">
                  <div>$0</div>
                  <div>0%</div>
                </div>
                <div className="absolute text-center" style={{ left: `${(80/150)*100}%`, transform: 'translateX(-50%)' }}>
                  <div className="text-destructive">{formatLargeCurrency(marginTarget * 0.8)}</div>
                  <div className="text-destructive font-medium">80%</div>
                </div>
                <div className="absolute text-center" style={{ left: `${(100/150)*100}%`, transform: 'translateX(-50%)' }}>
                  <div>{formatLargeCurrency(marginTarget)}</div>
                  <div>100%</div>
                </div>
                <div className="absolute text-center" style={{ left: `${(120/150)*100}%`, transform: 'translateX(-50%)' }}>
                  <div className="text-accent">{formatLargeCurrency(marginTarget * 1.2)}</div>
                  <div className="text-accent font-medium">120%</div>
                </div>
                <div className="absolute right-0 translate-x-1/2 text-center">
                  <div>{formatLargeCurrency(marginTarget * 1.5)}</div>
                  <div>150%</div>
                </div>
              </div>
            </div>

            {/* Weighted Result */}
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weighted Team Financials Payout</p>
                  <p className="text-xs text-muted-foreground">
                    ({teamFinancials.ordersPayout.toFixed(0)}% + {teamFinancials.revenuePayout.toFixed(0)}% + {teamFinancials.marginPayout.toFixed(0)}%) / 3
                  </p>
                </div>
                <span className="text-2xl font-bold text-primary">{teamFinancials.weightedPayout.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Rating */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Performance Rating</CardTitle>
            <CardDescription>
              Your manager assigns a rating based on your AV Priorities and Individual/Team Goals. This rating is a multiplier on your team financial payout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Rating buttons - 1 to 5 left to right */}
              <div className="grid grid-cols-5 gap-2">
                {ratingScale.map((rating) => (
                  <button
                    key={rating.score}
                    onClick={() => setPersonalRating(rating)}
                    className={`rounded-lg border-2 p-3 text-center transition-all ${
                      personalRating.score === rating.score
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="block text-2xl font-bold">{rating.score}</span>
                    <span className="block text-[10px] leading-tight">{rating.label}</span>
                    <span className="mt-1 block text-sm font-medium opacity-80">
                      {rating.multiplier === 0 ? "0%" : `${(rating.multiplier * 100).toFixed(0)}%`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Relative rating explanation */}
              <div className="rounded-lg bg-secondary/50 border border-secondary p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Note:</span> Your performance rating is relative - you are rated against your peers in the smallest organizational unit with at least 20 employees.
                </p>
              </div>

              {/* Rating scale explanation */}
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="mb-3 text-sm font-medium">Rating Scale</p>
                <div className="space-y-2">
                  {ratingScale.map((rating) => (
                    <div 
                      key={rating.score}
                      className={`flex items-center justify-between text-sm ${
                        personalRating.score === rating.score ? "font-medium text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <span>{rating.score} - {rating.label}</span>
                      <span>{rating.multiplier === 0 ? "0%" : `${(rating.multiplier * 100).toFixed(0)}%`}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected rating highlight */}
              <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Your Rating Multiplier</p>
                    <p className="text-sm text-muted-foreground">{personalRating.label}</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {personalRating.multiplier === 0 ? "0%" : `${(personalRating.multiplier * 100).toFixed(0)}%`}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Scale Visualization */}
      <PayoutScaleVisual 
        currentAchievement={avgAchievement} 
        personalMultiplier={personalRating.multiplier}
      />

      {/* Results */}
      <ResultsPanel
        targetBonus={finalResults.targetBonus}
        teamFinancialPayout={teamFinancials.weightedPayout}
        personalMultiplier={personalRating.multiplier}
        finalPayoutPercent={finalResults.finalPayoutPercent}
        finalPayoutAmount={finalResults.finalPayoutAmount}
        ratingLabel={personalRating.label}
      />
    </div>
  )
}
