"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { calculatePayoutPercent } from "@/lib/stip-calculator"

interface PayoutScaleVisualProps {
  currentAchievement: number
}

export function PayoutScaleVisual({ currentAchievement }: PayoutScaleVisualProps) {
  const currentPayout = calculatePayoutPercent(currentAchievement)

  // Generate data points for the chart
  const dataPoints = []
  for (let i = 0; i <= 150; i += 5) {
    dataPoints.push({
      achievement: i,
      payout: calculatePayoutPercent(i),
    })
  }

  // Calculate position of current marker (0-150 range mapped to 0-100%)
  const markerPosition = Math.min(Math.max((currentAchievement / 150) * 100, 0), 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Scale Reference</CardTitle>
        <CardDescription>
          See how achievement percentage translates to payout percentage
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* SVG Chart */}
        <div className="relative h-64 w-full">
          <svg viewBox="0 0 400 200" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="26.67" height="33.33" patternUnits="userSpaceOnUse">
                <path d="M 26.67 0 L 0 0 0 33.33" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
              </pattern>
            </defs>
            <rect width="400" height="200" fill="url(#grid)" opacity="0.5" />

            {/* Axis labels - Achievement */}
            <text x="200" y="195" textAnchor="middle" className="fill-muted-foreground text-[10px]">Achievement %</text>
            
            {/* Axis labels - Payout */}
            <text x="10" y="100" textAnchor="middle" className="fill-muted-foreground text-[10px]" transform="rotate(-90, 10, 100)">Payout %</text>

            {/* X-axis tick labels */}
            <text x="0" y="185" textAnchor="start" className="fill-muted-foreground text-[9px]">0%</text>
            <text x="106.67" y="185" textAnchor="middle" className="fill-destructive text-[9px] font-medium">80%</text>
            <text x="266.67" y="185" textAnchor="middle" className="fill-muted-foreground text-[9px]">100%</text>
            <text x="320" y="185" textAnchor="middle" className="fill-accent text-[9px] font-medium">120%</text>
            <text x="400" y="185" textAnchor="end" className="fill-muted-foreground text-[9px]">150%</text>

            {/* Y-axis tick labels */}
            <text x="25" y="170" textAnchor="end" className="fill-muted-foreground text-[9px]">0%</text>
            <text x="25" y="143.33" textAnchor="end" className="fill-destructive text-[9px] font-medium">40%</text>
            <text x="25" y="103.33" textAnchor="end" className="fill-muted-foreground text-[9px]">100%</text>
            <text x="25" y="70" textAnchor="end" className="fill-accent text-[9px] font-medium">150%</text>

            {/* 80% achievement vertical line (cliff) */}
            <line x1="106.67" y1="0" x2="106.67" y2="170" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" className="text-destructive" />
            
            {/* 100% achievement vertical line */}
            <line x1="266.67" y1="0" x2="266.67" y2="170" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" className="text-muted-foreground" />
            
            {/* 120% achievement vertical line (max) */}
            <line x1="320" y1="0" x2="320" y2="170" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" className="text-accent" />

            {/* Payout curve */}
            <path
              d={`
                M 0 170
                L 106.67 170
                L 106.67 143.33
                L 266.67 103.33
                L 320 70
                L 400 70
              `}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-primary"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Zero payout zone fill */}
            <path
              d="M 0 170 L 106.67 170 L 106.67 170 L 0 170 Z"
              fill="currentColor"
              className="text-destructive/10"
            />

            {/* Current position marker */}
            {currentAchievement >= 0 && (
              <>
                <circle
                  cx={(currentAchievement / 150) * 400}
                  cy={170 - (currentPayout / 150) * 100}
                  r="8"
                  fill="currentColor"
                  className="text-primary"
                />
                <circle
                  cx={(currentAchievement / 150) * 400}
                  cy={170 - (currentPayout / 150) * 100}
                  r="5"
                  fill="white"
                />
                {/* Label for current position */}
                <rect
                  x={(currentAchievement / 150) * 400 - 30}
                  y={170 - (currentPayout / 150) * 100 - 28}
                  width="60"
                  height="20"
                  rx="4"
                  fill="currentColor"
                  className="text-primary"
                />
                <text
                  x={(currentAchievement / 150) * 400}
                  y={170 - (currentPayout / 150) * 100 - 14}
                  textAnchor="middle"
                  className="fill-primary-foreground text-[10px] font-bold"
                >
                  {currentPayout.toFixed(0)}% payout
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 text-sm md:grid-cols-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Below 80% = 0%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">80% = 40% payout</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">100% = 100% payout</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">120%+ = 150% max</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
