"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PayoutScaleVisualProps {
  teamFinancialPayout: number // The actual weighted payout percentage (0-150)
  personalMultiplier: number
}

export function PayoutScaleVisual({ teamFinancialPayout, personalMultiplier }: PayoutScaleVisualProps) {
  // teamFinancialPayout is already the weighted average payout
  const teamPayout = teamFinancialPayout

  // Chart dimensions and margins
  const width = 400
  const height = 220
  const margin = { top: 20, right: 20, bottom: 50, left: 60 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  // Scale functions
  const xScale = (achievement: number) => (achievement / 150) * chartWidth + margin.left
  const yScale = (payout: number) => chartHeight - (payout / 180) * chartHeight + margin.top

  // Key points for the payout curve
  const curvePoints = [
    { x: 0, y: 0 },
    { x: 80, y: 0 },
    { x: 80, y: 40 },
    { x: 100, y: 100 },
    { x: 120, y: 150 },
    { x: 150, y: 150 },
  ]

  const pathD = curvePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.x)} ${yScale(p.y)}`)
    .join(' ')

  // Current marker position - need to reverse the payout to find the achievement
  // Since the curve is non-linear, we approximate based on payout ranges
  const getAchievementFromPayout = (payout: number) => {
    if (payout <= 0) return 0
    if (payout <= 40) return 80 // At 80% achievement = 40% payout
    if (payout <= 100) return 80 + ((payout - 40) / (100 - 40)) * (100 - 80) // Linear from 80-100
    if (payout <= 150) return 100 + ((payout - 100) / (150 - 100)) * (120 - 100) // Linear from 100-120
    return 120 // Max achievement for display purposes
  }
  const estimatedAchievement = getAchievementFromPayout(teamPayout)
  const markerX = xScale(Math.min(Math.max(estimatedAchievement, 0), 150))
  const markerY = yScale(teamPayout)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Scale Reference</CardTitle>
        <CardDescription>
          See how team financial achievement translates to payout percentage
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* SVG Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px]" preserveAspectRatio="xMidYMid meet">
            {/* Grid lines - horizontal */}
            {[0, 40, 100, 150].map((payout) => (
              <line
                key={`h-${payout}`}
                x1={margin.left}
                y1={yScale(payout)}
                x2={width - margin.right}
                y2={yScale(payout)}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray={payout === 100 ? "none" : "4,4"}
                className={payout === 100 ? "text-muted-foreground/30" : "text-border"}
              />
            ))}

            {/* Grid lines - vertical */}
            {[80, 100, 120].map((achievement) => (
              <line
                key={`v-${achievement}`}
                x1={xScale(achievement)}
                y1={margin.top}
                x2={xScale(achievement)}
                y2={height - margin.bottom}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4,4"
                className={
                  achievement === 80 ? "text-destructive/50" : 
                  achievement === 120 ? "text-accent/50" : 
                  "text-muted-foreground/30"
                }
              />
            ))}

            {/* Zero payout zone fill */}
            <rect
              x={margin.left}
              y={margin.top}
              width={xScale(80) - margin.left}
              height={chartHeight}
              fill="currentColor"
              className="text-destructive/10"
            />

            {/* Payout curve */}
            <path
              d={pathD}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-primary"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* X-axis */}
            <line
              x1={margin.left}
              y1={height - margin.bottom}
              x2={width - margin.right}
              y2={height - margin.bottom}
              stroke="currentColor"
              strokeWidth="2"
              className="text-foreground"
            />

            {/* Y-axis */}
            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={height - margin.bottom}
              stroke="currentColor"
              strokeWidth="2"
              className="text-foreground"
            />

            {/* X-axis label */}
            <text
              x={width / 2}
              y={height - 8}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-medium"
            >
              Team Financial Performance
            </text>

            {/* Y-axis label */}
            <text
              x={15}
              y={height / 2 - 10}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-medium"
              transform={`rotate(-90, 15, ${height / 2 - 10})`}
            >
              Team Financial Payout %
            </text>

            {/* X-axis tick labels */}
            <text x={xScale(0)} y={height - margin.bottom + 18} textAnchor="middle" className="fill-muted-foreground text-[10px]">0%</text>
            <text x={xScale(80)} y={height - margin.bottom + 18} textAnchor="middle" className="fill-destructive text-[10px] font-semibold">80%</text>
            <text x={xScale(100)} y={height - margin.bottom + 18} textAnchor="middle" className="fill-muted-foreground text-[10px]">100%</text>
            <text x={xScale(120)} y={height - margin.bottom + 18} textAnchor="middle" className="fill-accent text-[10px] font-semibold">120%</text>
            <text x={xScale(150)} y={height - margin.bottom + 18} textAnchor="middle" className="fill-muted-foreground text-[10px]">150%</text>

            {/* Y-axis tick labels */}
            <text x={margin.left - 8} y={yScale(0) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">0%</text>
            <text x={margin.left - 8} y={yScale(40) + 4} textAnchor="end" className="fill-destructive text-[10px] font-semibold">40%</text>
            <text x={margin.left - 8} y={yScale(100) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">100%</text>
            <text x={margin.left - 8} y={yScale(150) + 4} textAnchor="end" className="fill-accent text-[10px] font-semibold">150%</text>

            {/* Current position marker */}
            {teamFinancialPayout >= 0 && (
              <>
                {/* Marker circle */}
                <circle
                  cx={markerX}
                  cy={markerY}
                  r="10"
                  fill="currentColor"
                  className="text-primary"
                />
                <circle
                  cx={markerX}
                  cy={markerY}
                  r="6"
                  fill="white"
                />
                
                {/* Label box */}
                <rect
                  x={markerX - 35}
                  y={markerY - 32}
                  width="70"
                  height="20"
                  rx="4"
                  fill="currentColor"
                  className="text-primary"
                />
                <text
                  x={markerX}
                  y={markerY - 18}
                  textAnchor="middle"
                  className="fill-primary-foreground text-[10px] font-bold"
                >
                  {teamPayout.toFixed(0)}% payout
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
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "#f97316" }} />
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
