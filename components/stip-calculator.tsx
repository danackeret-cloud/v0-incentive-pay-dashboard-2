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
  const [selectedTeam, setSelectedTeam] = useState<Team>(teams[0])

  // Performance sliders (as percentages, e.g., 100 = 100%)
  const [ordersAchievement, setOrdersAchievement] = useState(100)
  const [revenueAchievement, setRevenueAchievement] = useState(100)
  const [marginAchievement, setMarginAchievement] = useState(100)
  const [personalRating, setPersonalRating] = useState<PerformanceRating>(ratingScale[2]) // Meets expectations

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
                value={selectedTeam.id}
                onValueChange={(value) => setSelectedTeam(teams.find((t) => t.id === value) || teams[0])}
              >
                <SelectTrigger id="team">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Level: {selectedTeam.level}</p>
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

      {/* Team Financial Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Team Financial Performance</CardTitle>
          <CardDescription>
            Adjust the sliders to see how your team&apos;s performance against financial targets affects payout.
            Each metric is weighted equally (33.3%).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Orders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Orders</Label>
                <p className="text-sm text-muted-foreground">
                  Target: {formatLargeCurrency(selectedTeam.financialTargets.orders)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">{ordersAchievement}%</span>
                <p className="text-sm text-muted-foreground">
                  Payout: <span className="font-medium text-foreground">{teamFinancials.ordersPayout.toFixed(0)}%</span>
                </p>
              </div>
            </div>
            <Slider
              value={[ordersAchievement]}
              onValueChange={([v]) => setOrdersAchievement(v)}
              min={0}
              max={150}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="text-destructive">80% (cliff)</span>
              <span>100%</span>
              <span className="text-accent">120% (max)</span>
              <span>150%</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Revenue</Label>
                <p className="text-sm text-muted-foreground">
                  Target: {formatLargeCurrency(selectedTeam.financialTargets.revenue)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">{revenueAchievement}%</span>
                <p className="text-sm text-muted-foreground">
                  Payout: <span className="font-medium text-foreground">{teamFinancials.revenuePayout.toFixed(0)}%</span>
                </p>
              </div>
            </div>
            <Slider
              value={[revenueAchievement]}
              onValueChange={([v]) => setRevenueAchievement(v)}
              min={0}
              max={150}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="text-destructive">80% (cliff)</span>
              <span>100%</span>
              <span className="text-accent">120% (max)</span>
              <span>150%</span>
            </div>
          </div>

          {/* Margin */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Adj. Gross Margin</Label>
                <p className="text-sm text-muted-foreground">
                  Target: {(selectedTeam.financialTargets.margin * 100).toFixed(0)}%
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">{marginAchievement}%</span>
                <p className="text-sm text-muted-foreground">
                  Payout: <span className="font-medium text-foreground">{teamFinancials.marginPayout.toFixed(0)}%</span>
                </p>
              </div>
            </div>
            <Slider
              value={[marginAchievement]}
              onValueChange={([v]) => setMarginAchievement(v)}
              min={0}
              max={150}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="text-destructive">80% (cliff)</span>
              <span>100%</span>
              <span className="text-accent">120% (max)</span>
              <span>150%</span>
            </div>
          </div>

          {/* Weighted Result */}
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weighted Team Financial Payout</p>
                <p className="text-sm text-muted-foreground">
                  ({teamFinancials.ordersPayout.toFixed(0)}% + {teamFinancials.revenuePayout.toFixed(0)}% + {teamFinancials.marginPayout.toFixed(0)}%) / 3
                </p>
              </div>
              <span className="text-3xl font-bold text-primary">{teamFinancials.weightedPayout.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Rating */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Performance Rating</CardTitle>
          <CardDescription>
            Your manager assigns a rating based on your AV Priorities and Individual/Team Goals.
            This rating is a multiplier on your team financial payout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
                  <span className="block text-xs leading-tight">{rating.label}</span>
                  <span className="mt-1 block text-sm font-medium opacity-80">
                    {rating.multiplier === 0 ? "0%" : `${(rating.multiplier * 100).toFixed(0)}%`}
                  </span>
                </button>
              ))}
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Selected:</span> {personalRating.label} ({personalRating.score}) - Your team financial payout will be multiplied by{" "}
                <span className="font-bold">{personalRating.multiplier === 0 ? "0%" : `${(personalRating.multiplier * 100).toFixed(0)}%`}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
