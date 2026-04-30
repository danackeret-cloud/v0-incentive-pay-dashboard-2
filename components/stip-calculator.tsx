"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ratingScale,
  calculatePayoutPercent,
  calculateTeamFinancialPayout,
  calculateFinalPayout,
  formatCurrency,
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

  // Scenario inputs - achievement percentages relative to target (100% = on target)
  const [ordersScenario, setOrdersScenario] = useState(100) // % of target achieved
  const [revenueScenario, setRevenueScenario] = useState(100)
  const [marginScenario, setMarginScenario] = useState(100)

  // Personal rating - default to Average (score 3)
  const [personalRating, setPersonalRating] = useState<PerformanceRating>(ratingScale[2])

  // Local input state for target percent field
  const [targetPercentInput, setTargetPercentInput] = useState("15")

  // Calculate results
  const teamFinancials = useMemo(
    () => calculateTeamFinancialPayout(ordersScenario, revenueScenario, marginScenario),
    [ordersScenario, revenueScenario, marginScenario]
  )

  const finalResults = useMemo(
    () => calculateFinalPayout(baseSalary, targetPercent, teamFinancials.weightedPayout, personalRating),
    [baseSalary, targetPercent, teamFinancials.weightedPayout, personalRating]
  )

  // Snap thresholds (as percentages of target)
  const snapPoints = [80, 100, 125]
  const snapTolerance = 3 // Will snap if within 3% of a threshold

  // Snap value to nearest threshold if close enough
  const snapToThreshold = (value: number): number => {
    for (const snapPoint of snapPoints) {
      if (Math.abs(value - snapPoint) <= snapTolerance) {
        return snapPoint
      }
    }
    return value
  }

  // Format scenario value for display
  const formatScenarioLabel = (value: number): string => {
    if (value === 100) return "On Target"
    if (value > 100) return `+${value - 100}% above target`
    return `${100 - value}% below target`
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
              <span className="font-semibold text-foreground">Note: </span>Organization type only affects the third financial metric. 
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
        {/* Team Financial Performance Scenarios */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Team Financial Scenarios</CardTitle>
            <CardDescription>
              Adjust the sliders to explore different financial performance scenarios. Each metric is weighted equally (33.3%).
            </CardDescription>
            <div className="mt-2 rounded-lg bg-secondary/50 border border-secondary p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">How to use: </span>
                Move the sliders to simulate scenarios like &quot;What if revenue is 10% above target?&quot; or &quot;What if orders are 20% below target?&quot;
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-6">
            {/* Orders Scenario */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Orders</Label>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  ordersScenario >= 100 ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                }`}>
                  {formatScenarioLabel(ordersScenario)}
                </span>
              </div>
              <div className="relative pt-2">
                {/* Tick marks at 80%, 100%, 125% */}
                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '8px' }}>
                  <div className="w-px h-3 bg-destructive" style={{ position: 'absolute', left: '40%' }} />
                  <div className="w-px h-3 bg-muted-foreground" style={{ position: 'absolute', left: '50%' }} />
                  <div className="w-px h-3 bg-accent" style={{ position: 'absolute', left: '62.5%' }} />
                </div>
                <Slider
                  value={[ordersScenario]}
                  onValueChange={([v]) => setOrdersScenario(snapToThreshold(v))}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-lg">{ordersScenario}% of target</span>
                <span className="text-muted-foreground">
                  = <span className="font-semibold text-foreground">{teamFinancials.ordersPayout.toFixed(0)}% payout</span>
                </span>
              </div>
              {/* Scale markers */}
              <div className="relative h-5 text-xs text-muted-foreground mt-1">
                <span className="absolute text-destructive font-medium" style={{ left: '40%', transform: 'translateX(-50%)' }}>80%</span>
                <span className="absolute font-medium" style={{ left: '50%', transform: 'translateX(-50%)' }}>100%</span>
                <span className="absolute text-accent font-medium" style={{ left: '62.5%', transform: 'translateX(-50%)' }}>125%</span>
              </div>
            </div>

            {/* Revenue Scenario */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Revenue</Label>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  revenueScenario >= 100 ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                }`}>
                  {formatScenarioLabel(revenueScenario)}
                </span>
              </div>
              <div className="relative pt-2">
                {/* Tick marks at 80%, 100%, 125% */}
                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '8px' }}>
                  <div className="w-px h-3 bg-destructive" style={{ position: 'absolute', left: '40%' }} />
                  <div className="w-px h-3 bg-muted-foreground" style={{ position: 'absolute', left: '50%' }} />
                  <div className="w-px h-3 bg-accent" style={{ position: 'absolute', left: '62.5%' }} />
                </div>
                <Slider
                  value={[revenueScenario]}
                  onValueChange={([v]) => setRevenueScenario(snapToThreshold(v))}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-lg">{revenueScenario}% of target</span>
                <span className="text-muted-foreground">
                  = <span className="font-semibold text-foreground">{teamFinancials.revenuePayout.toFixed(0)}% payout</span>
                </span>
              </div>
              {/* Scale markers */}
              <div className="relative h-5 text-xs text-muted-foreground mt-1">
                <span className="absolute text-destructive font-medium" style={{ left: '40%', transform: 'translateX(-50%)' }}>80%</span>
                <span className="absolute font-medium" style={{ left: '50%', transform: 'translateX(-50%)' }}>100%</span>
                <span className="absolute text-accent font-medium" style={{ left: '62.5%', transform: 'translateX(-50%)' }}>125%</span>
              </div>
            </div>

            {/* Margin/EBITDA Scenario */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  {orgType === "pl" ? "Adj. Gross Margin" : "Adj. EBITDA"}
                </Label>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  marginScenario >= 100 ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
                }`}>
                  {formatScenarioLabel(marginScenario)}
                </span>
              </div>
              <div className="relative pt-2">
                {/* Tick marks at 80%, 100%, 125% */}
                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '8px' }}>
                  <div className="w-px h-3 bg-destructive" style={{ position: 'absolute', left: '40%' }} />
                  <div className="w-px h-3 bg-muted-foreground" style={{ position: 'absolute', left: '50%' }} />
                  <div className="w-px h-3 bg-accent" style={{ position: 'absolute', left: '62.5%' }} />
                </div>
                <Slider
                  value={[marginScenario]}
                  onValueChange={([v]) => setMarginScenario(snapToThreshold(v))}
                  min={0}
                  max={200}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-lg">{marginScenario}% of target</span>
                <span className="text-muted-foreground">
                  = <span className="font-semibold text-foreground">{teamFinancials.marginPayout.toFixed(0)}% payout</span>
                </span>
              </div>
              {/* Scale markers */}
              <div className="relative h-5 text-xs text-muted-foreground mt-1">
                <span className="absolute text-destructive font-medium" style={{ left: '40%', transform: 'translateX(-50%)' }}>80%</span>
                <span className="absolute font-medium" style={{ left: '50%', transform: 'translateX(-50%)' }}>100%</span>
                <span className="absolute text-accent font-medium" style={{ left: '62.5%', transform: 'translateX(-50%)' }}>125%</span>
              </div>
            </div>

            {/* Weighted Result */}
            <div className="mt-auto rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
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
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Personal Performance Rating</CardTitle>
            <CardDescription>
              Managers divide a fixed bonus pool among their team based on individual performance against AV Priorities and Individual/Team Goals. Higher performers receive a larger % of salary; lower performers receive less.
            </CardDescription>
            <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                <span className="font-semibold">Note: </span>Percentages below are estimates and can vary based on how your manager allocates the pool.
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 flex flex-col space-y-6">
              {/* Rating buttons - 1 to 5 left to right */}
              <div className="grid grid-cols-5 gap-2">
                {ratingScale.map((rating) => (
                  <button
                    key={rating.score}
                    onClick={() => setPersonalRating(rating)}
                    className={`rounded-lg border-2 p-4 text-center transition-all flex flex-col items-center justify-between min-h-[100px] ${
                      personalRating.score === rating.score
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl font-bold">{rating.score}</span>
                    <span className="text-[9px] leading-tight text-center break-words hyphens-auto flex-1 flex items-center">{rating.label}</span>
                    <span className="text-[10px] font-medium opacity-80">
                      {rating.multiplier === 0 ? "0%" : `~${(rating.multiplier * 100).toFixed(0)}%`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Rating scale table */}
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
                      <span>
                        {rating.multiplier === 0 
                          ? "0%" 
                          : `${(rating.multiplierMin * 100).toFixed(0)}% - ${(rating.multiplierMax * 100).toFixed(0)}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected rating highlight */}
              <div className="mt-auto rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Estimated Rating Multiplier</p>
                    <p className="text-xs text-muted-foreground">
                      {personalRating.label} ({personalRating.multiplier > 0 ? `${(personalRating.multiplierMin * 100).toFixed(0)}%-${(personalRating.multiplierMax * 100).toFixed(0)}%` : "0%"})
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {personalRating.multiplier === 0 ? "0%" : `~${(personalRating.multiplier * 100).toFixed(0)}%`}
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
