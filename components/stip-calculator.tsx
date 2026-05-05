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
  
  // Custom multiplier override (as percentage, e.g. 100 = 100%)
  const [customMultiplier, setCustomMultiplier] = useState<number>(ratingScale[2].multiplier * 100)

  // Local input state for target percent field
  const [targetPercentInput, setTargetPercentInput] = useState("15")

  // Calculate results
  const teamFinancials = useMemo(
    () => calculateTeamFinancialPayout(ordersScenario, revenueScenario, marginScenario),
    [ordersScenario, revenueScenario, marginScenario]
  )

  // Create a modified rating with the custom multiplier for calculations
  const effectiveRating = useMemo(() => ({
    ...personalRating,
    multiplier: customMultiplier / 100
  }), [personalRating, customMultiplier])

  const finalResults = useMemo(
    () => calculateFinalPayout(baseSalary, targetPercent, teamFinancials.weightedPayout, effectiveRating),
    [baseSalary, targetPercent, teamFinancials.weightedPayout, effectiveRating]
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
              Team financial performance determines the size of the Team Bonus Pool. Adjust the sliders to explore different financial performance scenarios. Each metric is weighted equally (33.3%).
            </CardDescription>
  <div className="mt-2 rounded-lg bg-secondary/50 border border-secondary p-3">
  <p className="text-xs text-muted-foreground">
    <span className="font-semibold text-foreground">Note: </span>
    Orders and Revenue are measured down to the BU level, Adj. EBITDA is measured down to the Business Group level.
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
            <CardTitle>Individual Performance Rating</CardTitle>
            <CardDescription>
              Managers divide a fixed bonus pool among their team based on individual performance against AV Priorities and Individual/Team Goals. Higher performers receive a larger % of salary; lower performers receive less.
            </CardDescription>
  <div className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
  <p className="text-xs text-amber-700 dark:text-amber-400">
    <span className="font-semibold">Note: </span>Payout percentages within each rating are not fixed. Managers have discretion to allocate within a range based on individual performance. Use the sliders to estimate different scenarios.
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
                    onClick={() => {
                      setPersonalRating(rating)
                      setCustomMultiplier(rating.multiplier * 100)
                    }}
                    className={`rounded-lg border-2 p-3 text-center transition-all flex flex-col items-center justify-center gap-1 min-h-[80px] ${
                      personalRating.score === rating.score
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl font-bold">{rating.score}</span>
                    <span className="text-[11px] leading-tight text-center break-words hyphens-auto">{rating.label}</span>
                  </button>
                ))}
              </div>

              {/* Interactive rating sliders */}
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="mb-4 text-sm text-muted-foreground">Managers divide the Team Bonus Pool among their team based on individual performance against AV Strategic Initiatives, Team Goals, and Individual Goals.</p>
                
                <div className="space-y-4">
                  {ratingScale.map((rating) => {
                    const maxValue = rating.multiplierMax * 100
                    const minValue = rating.multiplierMin * 100
                    const isSelected = personalRating.score === rating.score
                    const currentValue = isSelected ? customMultiplier : rating.multiplier * 100
                    
                    // Color configurations with hex values for gradients
                    const colorConfig = {
                      1: { text: 'text-red-600 dark:text-red-400', hex: '#ef4444' },
                      2: { text: 'text-orange-600 dark:text-orange-400', hex: '#f97316' },
                      3: { text: 'text-yellow-600 dark:text-yellow-400', hex: '#eab308' },
                      4: { text: 'text-green-600 dark:text-green-400', hex: '#22c55e' },
                      5: { text: 'text-blue-600 dark:text-blue-400', hex: '#3b82f6' },
                    }
                    const color = colorConfig[rating.score as keyof typeof colorConfig]
                    
                    // Calculate gradient stops for clearer feathering effect
                    const minStop = (minValue / 150) * 100
                    const maxStop = (maxValue / 150) * 100
                    const midStop = (minStop + maxStop) / 2
                    
                    // Rating 1 is fixed at 0%, not slideable
                    const isFixedZero = rating.score === 1
                    
                    return (
                      <div 
                        key={rating.score}
                        className={`transition-all cursor-pointer rounded-lg p-3 -mx-3 ${
                          isSelected 
                            ? 'bg-primary/10 ring-2 ring-primary/30' 
                            : 'opacity-40 hover:opacity-70 hover:bg-muted'
                        }`}
                        onClick={() => {
                          if (!isSelected) {
                            setPersonalRating(rating)
                            setCustomMultiplier(isFixedZero ? 0 : rating.multiplier * 100)
                          }
                        }}
                      >
                        {/* Rating label and current value */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${color.text}`}>{rating.score}</span>
                            <span className="text-xs text-muted-foreground">{rating.label}</span>
                          </div>
                          <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                            {isFixedZero ? '0%' : `${currentValue.toFixed(0)}%`}
                          </span>
                        </div>
                        
                        {isFixedZero ? (
                          /* Rating 1: Fixed at 0% - no slider, just a static indicator */
                          <div className="relative">
                            <div 
                              className="h-4 rounded-full"
                              style={{ 
                                background: `linear-gradient(to right, ${color.hex} 0%, ${color.hex}60 2%, ${color.hex}20 5%, transparent 10%)`
                              }}
                            />
                            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                              <span>Fixed at 0%</span>
                              <span></span>
                            </div>
                          </div>
                        ) : (
                          /* Ratings 2-5: Slideable */
                          <>
                            {/* Slider with gradient track */}
                            <div className="relative">
                              {/* Custom gradient track background - bold color in expected range, fades outward */}
                              <div 
                                className="absolute inset-x-0 h-4 rounded-full pointer-events-none"
                                style={{ 
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: `linear-gradient(to right, 
                                      ${color.hex}10 0%,
                                      ${color.hex}20 ${Math.max(0, minStop - 15)}%,
                                      ${color.hex}50 ${Math.max(0, minStop - 5)}%,
                                      ${color.hex}90 ${minStop}%,
                                      ${color.hex} ${midStop}%,
                                      ${color.hex}90 ${maxStop}%,
                                      ${color.hex}50 ${Math.min(100, maxStop + 5)}%,
                                      ${color.hex}20 ${Math.min(100, maxStop + 15)}%,
                                      ${color.hex}10 100%
                                    )`
                                }}
                              />
                              
                              <Slider
                                value={[currentValue]}
                                onValueChange={([v]) => {
                                  if (isSelected) {
                                    setCustomMultiplier(v)
                                  } else {
                                    setPersonalRating(rating)
                                    setCustomMultiplier(v)
                                  }
                                }}
                                min={0}
                                max={150}
                                step={1}
                                disabled={false}
                                className={`w-full ${isSelected ? '' : 'pointer-events-none'}`}
                              />
                            </div>
                            
                            {/* Scale markers */}
                            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                              <span>0%</span>
                              <span>150%</span>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Selected rating highlight */}
              <div className="mt-auto rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Individual Performance Multiplier</p>
                    <p className="text-xs text-muted-foreground">
                      Rating {personalRating.score}: {personalRating.label}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {customMultiplier.toFixed(0)}%
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
        personalMultiplier={customMultiplier / 100}
        targetBonus={finalResults.targetBonus}
      />

      {/* Results */}
      <ResultsPanel
        targetBonus={finalResults.targetBonus}
        teamFinancialPayout={teamFinancials.weightedPayout}
        personalMultiplier={customMultiplier / 100}
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
        personalMultiplier={customMultiplier / 100}
        finalPayoutPercent={finalResults.finalPayoutPercent}
        finalPayoutAmount={finalResults.finalPayoutAmount}
      />
    </div>
  )
}
