"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

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
          <div className="grid gap-6 sm:grid-cols-2">
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
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Team Financial Performance</CardTitle>
            <CardDescription>
              Adjust the sliders to explore different financial performance scenarios. Each metric is weighted equally (33.3%).
            </CardDescription>
            <div className="mt-2 rounded-lg bg-secondary/50 border border-secondary p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Note: </span>
                Financial targets are measured at the lowest applicable level (Corporate &gt; Segment &gt; Business Group &gt; Business Unit). Product line managers are measured on their individual product lines.
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

            {/* Adj. EBITDA Scenario */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Adj. EBITDA</Label>
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

              {/* Visual rating scale with individual sliders */}
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="mb-4 text-sm font-medium">Payout Range by Rating (estimates - ranges overlap)</p>
                
                <div className="space-y-4">
                  {ratingScale.map((rating) => {
                    const maxValue = rating.multiplierMax * 100
                    const minValue = rating.multiplierMin * 100
                    const midValue = rating.multiplier * 100
                    const isSelected = personalRating.score === rating.score
                    const colors = {
                      1: { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
                      2: { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
                      3: { bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
                      4: { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400' },
                      5: { bg: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
                    }
                    const color = colors[rating.score as keyof typeof colors]
                    
                    return (
                      <div 
                        key={rating.score}
                        className={`transition-opacity ${isSelected ? 'opacity-100' : 'opacity-50'}`}
                      >
                        {/* Rating label and range */}
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${color.text}`}>{rating.score}</span>
                            <span className="text-xs text-muted-foreground">{rating.label}</span>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">
                            {maxValue === 0 ? '0%' : `${minValue.toFixed(0)}% - ${maxValue.toFixed(0)}%`}
                          </span>
                        </div>
                        
                        {/* Slider track from 0 to max */}
                        <div className="relative h-6">
                          {/* Background track (full 0-150% for context) */}
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-muted" />
                          
                          {/* Filled range showing min to max */}
                          {maxValue > 0 && (
                            <div 
                              className={`absolute top-1/2 -translate-y-1/2 h-2 rounded-full ${color.bg} ${isSelected ? 'opacity-80' : 'opacity-40'}`}
                              style={{ 
                                left: `${(minValue / 150) * 100}%`, 
                                width: `${((maxValue - minValue) / 150) * 100}%` 
                              }}
                            />
                          )}
                          
                          {/* Midpoint marker (typical value) */}
                          {maxValue > 0 && (
                            <div 
                              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-background ${color.bg} ${isSelected ? '' : 'opacity-60'}`}
                              style={{ left: `${(midValue / 150) * 100}%`, transform: 'translate(-50%, -50%)' }}
                            />
                          )}
                          
                          {/* Zero marker for rating 1 */}
                          {maxValue === 0 && (
                            <div 
                              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-background ${color.bg} ${isSelected ? '' : 'opacity-60'}`}
                              style={{ left: '0%', transform: 'translate(0%, -50%)' }}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Scale markers */}
                <div className="relative h-5 mt-2">
                  {[0, 50, 100, 150].map((val) => (
                    <div
                      key={val}
                      className="absolute flex flex-col items-center"
                      style={{ left: `${(val / 150) * 100}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className="w-px h-2 bg-muted-foreground/30" />
                      <span className="text-[10px] text-muted-foreground">{val}%</span>
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
