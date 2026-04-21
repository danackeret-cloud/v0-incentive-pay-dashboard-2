"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  teams,
  ratingScale,
  defaultTargets,
  calculatePayoutPercent,
  calculateAchievementPercent,
  calculateTeamFinancialPayout,
  calculateFinalPayout,
  formatCurrency,
  formatLargeCurrency,
  type Team,
  type PerformanceRating,
} from "@/lib/stip-calculator"
import { PayoutScaleVisual } from "./payout-scale-visual"
import { ResultsPanel } from "./results-panel"

export function STIPCalculator() {
  // Employee inputs
  const [baseSalary, setBaseSalary] = useState(125000)
  const [targetPercent, setTargetPercent] = useState(15)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  // Financial targets (editable, defaults shown)
  const [ordersTarget, setOrdersTarget] = useState(defaultTargets.orders)
  const [revenueTarget, setRevenueTarget] = useState(defaultTargets.revenue)
  const [marginTarget, setMarginTarget] = useState(defaultTargets.margin)

  // Actual amounts (what the sliders control)
  const [ordersActual, setOrdersActual] = useState(defaultTargets.orders)
  const [revenueActual, setRevenueActual] = useState(defaultTargets.revenue)
  const [marginActual, setMarginActual] = useState(defaultTargets.margin)

  // Personal rating - default to Meets Expectations (score 3)
  const [personalRating, setPersonalRating] = useState<PerformanceRating>(ratingScale[2])

  // Handle team selection - updates targets
  const handleTeamChange = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId) || null
    setSelectedTeam(team)
    if (team) {
      setOrdersTarget(team.financialTargets.orders)
      setRevenueTarget(team.financialTargets.revenue)
      setMarginTarget(team.financialTargets.margin)
      // Reset actuals to targets
      setOrdersActual(team.financialTargets.orders)
      setRevenueActual(team.financialTargets.revenue)
      setMarginActual(team.financialTargets.margin)
    }
  }

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
  const getSliderMin = () => 0

  return (
    <div className="space-y-6">
      {/* Your Information */}
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>Enter your compensation details and select your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
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
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select
                value={selectedTeam?.id || ""}
                onValueChange={handleTeamChange}
              >
                <SelectTrigger id="team">
                  <SelectValue placeholder="Select a team (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTeam && (
                <p className="text-xs text-muted-foreground">Level: {selectedTeam.level}</p>
              )}
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
                      }}
                      className="h-8 pl-5 pr-7 text-sm"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">M</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{formatLargeCurrency(ordersActual)}</span>
                <span className="text-muted-foreground">
                  {ordersAchievement.toFixed(0)}% achievement = <span className="font-semibold text-foreground">{teamFinancials.ordersPayout.toFixed(0)}% payout</span>
                </span>
              </div>
              <Slider
                value={[ordersActual]}
                onValueChange={([v]) => setOrdersActual(v)}
                min={getSliderMin()}
                max={getSliderMax(ordersTarget)}
                step={ordersTarget / 100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span className="text-destructive">80%</span>
                <span>100%</span>
                <span className="text-accent">120%</span>
                <span>150%</span>
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
                      }}
                      className="h-8 pl-5 pr-7 text-sm"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">M</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{formatLargeCurrency(revenueActual)}</span>
                <span className="text-muted-foreground">
                  {revenueAchievement.toFixed(0)}% achievement = <span className="font-semibold text-foreground">{teamFinancials.revenuePayout.toFixed(0)}% payout</span>
                </span>
              </div>
              <Slider
                value={[revenueActual]}
                onValueChange={([v]) => setRevenueActual(v)}
                min={getSliderMin()}
                max={getSliderMax(revenueTarget)}
                step={revenueTarget / 100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span className="text-destructive">80%</span>
                <span>100%</span>
                <span className="text-accent">120%</span>
                <span>150%</span>
              </div>
            </div>

            {/* Margin (now in dollars) */}
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
                      }}
                      className="h-8 pl-5 pr-7 text-sm"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">M</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{formatLargeCurrency(marginActual)}</span>
                <span className="text-muted-foreground">
                  {marginAchievement.toFixed(0)}% achievement = <span className="font-semibold text-foreground">{teamFinancials.marginPayout.toFixed(0)}% payout</span>
                </span>
              </div>
              <Slider
                value={[marginActual]}
                onValueChange={([v]) => setMarginActual(v)}
                min={getSliderMin()}
                max={getSliderMax(marginTarget)}
                step={marginTarget / 100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$0</span>
                <span className="text-destructive">80%</span>
                <span>100%</span>
                <span className="text-accent">120%</span>
                <span>150%</span>
              </div>
            </div>

            {/* Weighted Result */}
            <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weighted Team Payout</p>
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
      <PayoutScaleVisual currentAchievement={avgAchievement} />

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
