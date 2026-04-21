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
      <div className="container mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Formula summary */}
          <div className="hidden items-center gap-2 text-sm sm:flex">
            <span className="font-medium text-muted-foreground">{formatCurrency(targetBonus)}</span>
            <span className="text-muted-foreground">×</span>
            <span className="font-medium text-primary">{teamFinancialPayout.toFixed(0)}%</span>
            <span className="text-muted-foreground">×</span>
            <span className="font-medium text-accent">{(personalMultiplier * 100).toFixed(0)}%</span>
          </div>
          
          {/* Mobile - compact version */}
          <div className="flex items-center gap-3 sm:hidden">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Team</p>
              <p className="text-sm font-semibold text-primary">{teamFinancialPayout.toFixed(0)}%</p>
            </div>
            <span className="text-muted-foreground">×</span>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Rating</p>
              <p className="text-sm font-semibold text-accent">{(personalMultiplier * 100).toFixed(0)}%</p>
            </div>
          </div>

          {/* Right side - Final payout */}
          <div className="flex items-center gap-4">
            {/* Difference indicator */}
            <div className={`hidden items-center gap-1 text-sm sm:flex ${
              isZeroPayout 
                ? "text-destructive" 
                : difference >= 0 
                  ? "text-accent" 
                  : "text-destructive"
            }`}>
              {isZeroPayout ? (
                <Minus className="h-4 w-4" />
              ) : difference > 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : difference < 0 ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
              <span className="font-medium">
                {difference >= 0 ? "+" : ""}{formatCurrency(difference)}
              </span>
            </div>
            
            {/* Final payout */}
            <div className={`rounded-lg px-4 py-2 ${
              isZeroPayout 
                ? "bg-destructive/10" 
                : "bg-primary"
            }`}>
              <p className={`text-[10px] uppercase tracking-wide ${
                isZeroPayout 
                  ? "text-destructive" 
                  : "text-primary-foreground/70"
              }`}>
                Final Payout
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
