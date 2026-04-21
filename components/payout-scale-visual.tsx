"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ratingScale } from "@/lib/stip-calculator"

interface PayoutScaleVisualProps {
  teamFinancialPayout: number // The weighted payout percentage (0-150)
  personalRating: number // The rating score (1-5)
}

export function PayoutScaleVisual({ teamFinancialPayout, personalRating }: PayoutScaleVisualProps) {
  // Chart dimensions and margins
  const width = 450
  const height = 280
  const margin = { top: 30, right: 30, bottom: 60, left: 100 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  // X-axis: Team Financial Payout (0-150%)
  const xScale = (payout: number) => (payout / 150) * chartWidth + margin.left
  
  // Y-axis: Rating tiers (1-5, displayed bottom to top)
  const ratings = [...ratingScale].reverse() // 5 at top, 1 at bottom
  const yStep = chartHeight / (ratings.length - 1)
  const yScale = (ratingIndex: number) => margin.top + ratingIndex * yStep

  // Find current position
  const currentRatingIndex = ratings.findIndex(r => r.score === personalRating)
  const markerX = xScale(Math.min(teamFinancialPayout, 150))
  const markerY = yScale(currentRatingIndex)

  // Calculate final payout for display
  const currentRating = ratingScale.find(r => r.score === personalRating)
  const finalPayout = (teamFinancialPayout / 100) * (currentRating?.multiplier || 1) * 100

  // Key X-axis points
  const xTicks = [0, 40, 100, 150]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Matrix</CardTitle>
        <CardDescription>
          See how team financial payout and personal rating combine
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* SVG Chart */}
        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px]" preserveAspectRatio="xMidYMid meet">
            
            {/* Grid lines - vertical (X-axis ticks) */}
            {xTicks.map((payout) => (
              <line
                key={`v-${payout}`}
                x1={xScale(payout)}
                y1={margin.top}
                x2={xScale(payout)}
                y2={height - margin.bottom}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4,4"
                className="text-border"
              />
            ))}

            {/* Grid lines - horizontal (for each rating) */}
            {ratings.map((_, index) => (
              <line
                key={`h-${index}`}
                x1={margin.left}
                y1={yScale(index)}
                x2={width - margin.right}
                y2={yScale(index)}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4,4"
                className="text-border"
              />
            ))}

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
              x={margin.left + chartWidth / 2}
              y={height - 10}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-medium"
            >
              Team Financial Payout %
            </text>

            {/* Y-axis label */}
            <text
              x={15}
              y={margin.top + chartHeight / 2}
              textAnchor="middle"
              className="fill-foreground text-[11px] font-medium"
              transform={`rotate(-90, 15, ${margin.top + chartHeight / 2})`}
            >
              Personal Performance Rating
            </text>

            {/* X-axis tick labels */}
            {xTicks.map((payout) => (
              <text
                key={`xlabel-${payout}`}
                x={xScale(payout)}
                y={height - margin.bottom + 18}
                textAnchor="middle"
                className={`text-[10px] ${
                  payout === 40 ? "fill-destructive font-semibold" :
                  payout === 150 ? "fill-accent font-semibold" :
                  "fill-muted-foreground"
                }`}
              >
                {payout}%
              </text>
            ))}

            {/* Y-axis tick labels - Rating with multiplier */}
            {ratings.map((rating, index) => (
              <g key={`ylabel-${rating.score}`}>
                <text
                  x={margin.left - 8}
                  y={yScale(index) + 4}
                  textAnchor="end"
                  className={`text-[10px] font-medium ${
                    rating.score === personalRating ? "fill-primary" : "fill-foreground"
                  }`}
                >
                  {rating.score} - {rating.label}
                </text>
                <text
                  x={margin.left - 8}
                  y={yScale(index) + 14}
                  textAnchor="end"
                  className={`text-[9px] ${
                    rating.score === personalRating ? "fill-primary" : "fill-muted-foreground"
                  }`}
                >
                  ({rating.multiplier === 0 ? "0%" : `${(rating.multiplier * 100).toFixed(0)}%`})
                </text>
              </g>
            ))}

            {/* Current position marker */}
            {currentRatingIndex >= 0 && (
              <>
                {/* Crosshair lines */}
                <line
                  x1={markerX}
                  y1={margin.top}
                  x2={markerX}
                  y2={height - margin.bottom}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary/40"
                />
                <line
                  x1={margin.left}
                  y1={markerY}
                  x2={width - margin.right}
                  y2={markerY}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary/40"
                />

                {/* Marker circle */}
                <circle
                  cx={markerX}
                  cy={markerY}
                  r="12"
                  fill="currentColor"
                  className="text-primary"
                />
                <circle
                  cx={markerX}
                  cy={markerY}
                  r="7"
                  fill="white"
                />
                
                {/* Final payout label */}
                <rect
                  x={markerX + 15}
                  y={markerY - 12}
                  width="80"
                  height="24"
                  rx="4"
                  fill="currentColor"
                  className="text-primary"
                />
                <text
                  x={markerX + 55}
                  y={markerY + 4}
                  textAnchor="middle"
                  className="fill-primary-foreground text-[11px] font-bold"
                >
                  {finalPayout.toFixed(0)}% final
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 rounded-lg bg-muted/50 p-4 text-sm">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Final Payout</span> = Team Financial Payout % × Personal Rating Multiplier
          </p>
          <p className="mt-1 text-muted-foreground">
            Current: <span className="font-medium text-foreground">{teamFinancialPayout.toFixed(0)}%</span> × <span className="font-medium text-foreground">{((currentRating?.multiplier || 1) * 100).toFixed(0)}%</span> = <span className="font-bold text-primary">{finalPayout.toFixed(0)}%</span> of target bonus
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
