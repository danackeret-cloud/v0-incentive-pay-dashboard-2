"use client"

import { formatCurrency } from "@/lib/stip-calculator"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface StickyResultsBarProps {
  targetBonus: number
  teamFinancialPayout: number
  personalMultiplier: number
  finalPayoutPercent: number
  finalPayoutAmount: number
}

export function StickyResultsBar({
  targetBonus,
  teamFinancialPayout,
  personalMultiplier,
  finalPayoutPercent,
  finalPayoutAmount,
}: StickyResultsBarProps) {
  const isZeroPayout = personalMultiplier === 0 || teamFinancialPayout === 0
  const difference = finalPayoutAmount - targetBonus
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center justify-between gap-6">
          {/* Left side - Formula with labels */}
          <div className="flex items-center gap-4">
            {/* Target Bonus */}
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Target Bonus</p>
              <p className="text-sm font-semibold">{formatCurrency(targetBonus)}</p>
            </div>
            
            <span className="text-muted-foreground text-lg">×</span>
            
            {/* Team Financials */}
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Team Financials</p>
              <p className="text-sm font-semibold text-primary">{teamFinancialPayout.toFixed(0)}%</p>
            </div>
            
            <span className="text-muted-foreground text-lg">×</span>
            
            {/* Performance Rating */}
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Performance Rating</p>
              <p className="text-sm font-semibold text-accent">{(personalMultiplier * 100).toFixed(0)}%</p>
            </div>
            
            <span className="text-muted-foreground text-lg">=</span>
          </div>

          {/* Right side - Final payout */}
          <div className="flex items-center gap-4">
            {/* Difference from target */}
            <div className="hidden sm:block text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">vs Target</p>
              <p className={`text-sm font-semibold flex items-center justify-center gap-1 ${
                isZeroPayout 
                  ? "text-destructive" 
                  : difference >= 0 
                    ? "text-accent" 
                    : "text-destructive"
              }`}>
                {isZeroPayout ? (
                  <Minus className="h-3 w-3" />
                ) : difference > 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : difference < 0 ? (
                  <ArrowDown className="h-3 w-3" />
                ) : (
                  <Minus className="h-3 w-3" />
                )}
                {difference >= 0 ? "+" : ""}{formatCurrency(difference)}
              </p>
            </div>
            
            {/* Final payout */}
            <div className={`rounded-lg px-5 py-2 ${
              isZeroPayout 
                ? "bg-destructive/10" 
                : "bg-primary"
            }`}>
              <p className={`text-[10px] uppercase tracking-wide ${
                isZeroPayout 
                  ? "text-destructive" 
                  : "text-primary-foreground/70"
              }`}>
                Final STIP Payout
              </p>
              <p className={`text-xl font-bold ${
                isZeroPayout 
                  ? "text-destructive" 
                  : "text-primary-foreground"
              }`}>
                {formatCurrency(finalPayoutAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
