"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
import { StickyResultsBar } from "./sticky-results-bar"

export function STIPCalculator() {
  // Employee inputs
  const [baseSalary, setBaseSalary] = useState(125000)
  const [targetPercent, setTargetPercent] = useState(15)
  const [orgType, setOrgType] = useState<"pl" | "function">("pl") // pl = Segment/Product Line, function = Corporate Function

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

  // Local input states for target fields (allows clearing while typing)
  const [targetPercentInput, setTargetPercentInput] = useState("15")
  const [ordersTargetInput, setOrdersTargetInput] = useState((defaultTargets.orders / 1000000).toString())
  const [revenueTargetInput, setRevenueTargetInput] = useState((defaultTargets.revenue / 1000000).toString())
  const [marginTargetInput, setMarginTargetInput] = useState((defaultTargets.margin / 1000000).toString())

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

  // Slider range: 0% to 200% of target
  const getSliderMax = (target: number) => target * 2

  // Snap thresholds (as percentages of target)
  const snapPoints = [80, 100, 125]
  const snapTolerance = 3 // Will snap if within 3% of a threshold

  // Snap value to nearest threshold if close enough
  const snapToThreshold = (value: number, target: number): number => {
    const percentOfTarget = (value / target) * 100
    for (const snapPoint of snapPoints) {
      if (Math.abs(percentOfTarget - snapPoint) <= snapTolerance) {
        return target * (snapPoint / 100)
      }
    }
    return value
  }

  return (
    <div className="space-y-6">
      {/* Your Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>Enter your compensation details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="salary">Base Salary</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="salary"
                  type="text"
                  value={baseSalary.toLocaleString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/,/g, '')
                    const num = Number(value)
                    if (!isNaN(num)) {
                      setBaseSalary(num)
                    }
                  }}
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
                  min={0}
                  max={100}
                  step={1}
                  value={targetPercentInput}
                  onChange={(e) => {
                    const value = e.target.value
                    setTargetPercentInput(value)
                    const num = Number(value)
                    if (!isNaN(num) && num >= 0 && num <= 100) {
                      setTargetPercent(num)
                    }
                  }}
                  onBlur={() => {
                    const num = Number(targetPercentInput)
                    if (isNaN(num) || num < 0 || num > 100) {
                      setTargetPercentInput(targetPercent.toString())
                    }
                  }}
                  className="pr-7"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Organization Type</Label>
              <RadioGroup
                value={orgType}
                onValueChange={(value) => setOrgType(value as "pl" | "function")}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pl" id="pl" />
                  <Label htmlFor="pl" className="font-normal cursor-pointer">Segment / Product Line</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="function" id="function" />
                  <Label htmlFor="function" className="font-normal cursor-pointer">Corporate Function</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-secondary/50 border border-secondary p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Note:</span> Organization type only affects the third financial metric. 
              Segment/Product Lines are measured on <span className="font-medium">Adj. Gross Margin</span>, while 
              Corporate Functions are measured on <span className="font-medium">Adj. EBITDA</span>.
            </p>
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
            <div className="mt-2 rounded-lg bg-secondary/50 border border-secondary p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Note:</span> The targets shown below are defaults for demonstration purposes. 
                Your manager will provide your team&apos;s actual financial targets.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Orders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Orders</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Target:</span>
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                    <Input
                      type="text"
                      value={ordersTargetInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '')
                        setOrdersTargetInput(value)
                        const num = Number(value)
                        if (!isNaN(num) && num > 0) {
                          const newTarget = num * 1000000
                          const currentAchievement = ordersTarget > 0 ? ordersActual / ordersTarget : 1
                          setOrdersTarget(newTarget)
                          setOrdersActual(newTarget * currentAchievement)
                        }
                      }}
                      onBlur={() => {
                        // Reset to current valid value on blur if empty/invalid
                        const num = Number(ordersTargetInput)
                        if (isNaN(num) || num <= 0) {
                          setOrdersTargetInput((ordersTarget / 1000000).toString())
                        }
                      }}
                      className="h-8 pl-5 pr-7 text-sm"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">M</span>
                  </div>
                </div>
              </div>
              <div className="relative pt-2">
                {/* Tick marks at 80%, 100%, 125% */}
                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '8px' }}>
                  <div className="w-px h-3 bg-destructive" style={{ position: 'absolute', left: '40%' }} />
                  <div className="w-px h-3 bg-muted-foreground" style={{ position: 'absolute', left: '50%' }} />
                  <div className="w-px h-3 bg-accent" style={{ position: 'absolute', left: '62.5%' }} />
                </div>
                <Slider
                  value={[ordersActual]}
                  onValueChange={([v]) => setOrdersActual(snapToThreshold(v, ordersTarget))}
                  min={0}
                  max={getSliderMax(ordersTarget)}
                  step={ordersTarget / 100}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-lg">{formatLargeCurrency(ordersActual)}</span>
                <span className="text-muted-foreground">
                  {ordersAchievement.toFixed(0)}% of target = <span className="font-semibold text-foreground">{teamFinancials.ordersPayout.toFixed(0)}% payout</span>
                </span>
              </div>
              {/* Scale markers - only 80%, 100%, 125% */}
              <div className="relative h-5 text-xs text-muted-foreground mt-1">
                <span className="absolute text-destructive font-medium" style={{ left: '40%', transform: 'translateX(-50%)' }}>80%</span>
                <span className="absolute font-medium" style={{ left: '50%', transform: 'translateX(-50%)' }}>100%</span>
                <span className="absolute text-accent font-medium" style={{ left: '62.5%', transform: 'translateX(-50%)' }}>125%</span>
              </div>
            </div>

            {/* Revenue */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Revenue</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Target:</span>
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                    <Input
                      type="text"
                      value={revenueTargetInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '')
                        setRevenueTargetInput(value)
                        const num = Number(value)
                        if (!isNaN(num) && num > 0) {
                          const newTarget = num * 1000000
                          const currentAchievement = revenueTarget > 0 ? revenueActual / revenueTarget : 1
                          setRevenueTarget(newTarget)
                          setRevenueActual(newTarget * currentAchievement)
                        }
                      }}
                      onBlur={() => {
                        const num = Number(revenueTargetInput)
                        if (isNaN(num) || num <= 0) {
                          setRevenueTargetInput((revenueTarget / 1000000).toString())
                        }
                      }}
                      className="h-8 pl-5 pr-7 text-sm"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">M</span>
                  </div>
                </div>
              </div>
              <div className="relative pt-2">
                {/* Tick marks at 80%, 100%, 125% */}
                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '8px' }}>
                  <div className="w-px h-3 bg-destructive" style={{ position: 'absolute', left: '40%' }} />
                  <div className="w-px h-3 bg-muted-foreground" style={{ position: 'absolute', left: '50%' }} />
                  <div className="w-px h-3 bg-accent" style={{ position: 'absolute', left: '62.5%' }} />
                </div>
                <Slider
                  value={[revenueActual]}
                  onValueChange={([v]) => setRevenueActual(snapToThreshold(v, revenueTarget))}
                  min={0}
                  max={getSliderMax(revenueTarget)}
                  step={revenueTarget / 100}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-lg">{formatLargeCurrency(revenueActual)}</span>
                <span className="text-muted-foreground">
                  {revenueAchievement.toFixed(0)}% of target = <span className="font-semibold text-foreground">{teamFinancials.revenuePayout.toFixed(0)}% payout</span>
                </span>
              </div>
              {/* Scale markers - only 80%, 100%, 125% */}
              <div className="relative h-5 text-xs text-muted-foreground mt-1">
                <span className="absolute text-destructive font-medium" style={{ left: '40%', transform: 'translateX(-50%)' }}>80%</span>
                <span className="absolute font-medium" style={{ left: '50%', transform: 'translateX(-50%)' }}>100%</span>
                <span className="absolute text-accent font-medium" style={{ left: '62.5%', transform: 'translateX(-50%)' }}>125%</span>
              </div>
            </div>

            {/* Margin/EBITDA (in dollars) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  {orgType === "pl" ? "Adj. Gross Margin" : "Adj. EBITDA"}
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Target:</span>
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                    <Input
                      type="text"
                      value={marginTargetInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '')
                        setMarginTargetInput(value)
                        const num = Number(value)
                        if (!isNaN(num) && num > 0) {
                          const newTarget = num * 1000000
                          const currentAchievement = marginTarget > 0 ? marginActual / marginTarget : 1
                          setMarginTarget(newTarget)
                          setMarginActual(newTarget * currentAchievement)
                        }
                      }}
                      onBlur={() => {
                        const num = Number(marginTargetInput)
                        if (isNaN(num) || num <= 0) {
                          setMarginTargetInput((marginTarget / 1000000).toString())
                        }
                      }}
                      className="h-8 pl-5 pr-7 text-sm"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">M</span>
                  </div>
                </div>
              </div>
              <div className="relative pt-2">
                {/* Tick marks at 80%, 100%, 125% */}
                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '8px' }}>
                  <div className="w-px h-3 bg-destructive" style={{ position: 'absolute', left: '40%' }} />
                  <div className="w-px h-3 bg-muted-foreground" style={{ position: 'absolute', left: '50%' }} />
                  <div className="w-px h-3 bg-accent" style={{ position: 'absolute', left: '62.5%' }} />
                </div>
                <Slider
                  value={[marginActual]}
                  onValueChange={([v]) => setMarginActual(snapToThreshold(v, marginTarget))}
                  min={0}
                  max={getSliderMax(marginTarget)}
                  step={marginTarget / 100}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-lg">{formatLargeCurrency(marginActual)}</span>
                <span className="text-muted-foreground">
                  {marginAchievement.toFixed(0)}% of target = <span className="font-semibold text-foreground">{teamFinancials.marginPayout.toFixed(0)}% payout</span>
                </span>
              </div>
              {/* Scale markers - only 80%, 100%, 125% */}
              <div className="relative h-5 text-xs text-muted-foreground mt-1">
                <span className="absolute text-destructive font-medium" style={{ left: '40%', transform: 'translateX(-50%)' }}>80%</span>
                <span className="absolute font-medium" style={{ left: '50%', transform: 'translateX(-50%)' }}>100%</span>
                <span className="absolute text-accent font-medium" style={{ left: '62.5%', transform: 'translateX(-50%)' }}>125%</span>
              </div>
            </div>

            {/* Weighted Result */}
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Team Financials Payout</p>
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
                    className={`rounded-lg border-2 p-4 text-center transition-all flex flex-col items-center justify-center min-h-[100px] ${
                      personalRating.score === rating.score
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl font-bold">{rating.score}</span>
                    <span className="text-[9px] leading-tight mt-1 text-center break-words hyphens-auto">{rating.label}</span>
                    <span className="mt-1 text-sm font-medium opacity-80">
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
        teamFinancialPayout={teamFinancials.weightedPayout} 
        personalRating={personalRating.score}
        targetBonus={finalResults.targetBonus}
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

      {/* Bottom padding for sticky bar */}
      <div className="h-32" />

      {/* Sticky Results Bar */}
      <StickyResultsBar
        targetBonus={finalResults.targetBonus}
        teamFinancialPayout={teamFinancials.weightedPayout}
        personalMultiplier={personalRating.multiplier}
        finalPayoutPercent={finalResults.finalPayoutPercent}
        finalPayoutAmount={finalResults.finalPayoutAmount}
      />
    </div>
  )
}
