"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  STIPData, 
  calculateSTIPPayout,
  formatCurrency,
  formatPercent 
} from "@/lib/bonus-data"
import { X, Equal, ArrowRight } from "lucide-react"

interface FormulaBreakdownProps {
  data: STIPData
}

export function FormulaBreakdown({ data }: FormulaBreakdownProps) {
  const payout = calculateSTIPPayout(data)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>How Your STIP is Calculated</CardTitle>
        <CardDescription>
          Understanding the formula behind your short-term incentive payout
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Formula */}
        <div className="flex flex-wrap items-center justify-center gap-3 py-6 px-4 bg-secondary/50 rounded-lg">
          {/* Team Financial Performance */}
          <div className="flex flex-col items-center p-4 bg-card rounded-lg border min-w-[140px]">
            <div className="text-xs text-muted-foreground mb-1">Team Financial</div>
            <div className="text-xl font-bold text-primary">
              {formatPercent(payout.teamFinancialPayout)}
            </div>
            <div className="text-xs text-muted-foreground">Performance</div>
          </div>
          
          <X className="h-5 w-5 text-muted-foreground" />
          
          {/* Personal Rating */}
          <div className="flex flex-col items-center p-4 bg-card rounded-lg border min-w-[140px]">
            <div className="text-xs text-muted-foreground mb-1">Personal Rating</div>
            <div className="text-xl font-bold text-primary">
              {formatPercent(payout.personalMultiplier)}
            </div>
            <div className="text-xs text-muted-foreground">{data.personalRating.label}</div>
          </div>
          
          <Equal className="h-5 w-5 text-muted-foreground" />
          
          {/* Final Payout Percent */}
          <div className="flex flex-col items-center p-4 bg-primary/10 rounded-lg border border-primary min-w-[140px]">
            <div className="text-xs text-muted-foreground mb-1">STIP Payout</div>
            <div className="text-xl font-bold text-primary">
              {formatPercent(payout.finalPayoutPercent)}
            </div>
            <div className="text-xs text-muted-foreground">of Target</div>
          </div>
        </div>
        
        {/* Step by Step Calculation */}
        <div className="space-y-4">
          <div className="text-sm font-medium">Step-by-Step Calculation</div>
          
          <div className="space-y-3">
            {/* Step 1: Target Bonus */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <div className="font-medium">Target Bonus</div>
                  <div className="text-sm text-muted-foreground">
                    Base Salary ({formatCurrency(data.employee.baseSalary)}) × Target % ({formatPercent(data.employee.targetBonusPercent)})
                  </div>
                </div>
              </div>
              <div className="font-bold">{formatCurrency(payout.targetBonus)}</div>
            </div>
            
            {/* Step 2: Team Financial */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <div className="font-medium">Team Financial Payout</div>
                  <div className="text-sm text-muted-foreground">
                    Average of Orders, Revenue, and Margin payouts
                  </div>
                </div>
              </div>
              <div className="font-bold">{formatPercent(payout.teamFinancialPayout)}</div>
            </div>
            
            {/* Step 3: Personal Rating */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <div className="font-medium">Personal Rating Multiplier</div>
                  <div className="text-sm text-muted-foreground">
                    Rating {data.personalRating.score} ({data.personalRating.label})
                  </div>
                </div>
              </div>
              <div className="font-bold">{formatPercent(payout.personalMultiplier)}</div>
            </div>
            
            {/* Final Calculation */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <ArrowRight className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-medium">Final STIP Payout</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(payout.targetBonus)} × {formatPercent(payout.teamFinancialPayout)} × {formatPercent(payout.personalMultiplier)}
                  </div>
                </div>
              </div>
              <div className="text-xl font-bold text-primary">{formatCurrency(payout.finalPayoutAmount)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
