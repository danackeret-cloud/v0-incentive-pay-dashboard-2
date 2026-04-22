"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ratingScale, formatCurrency } from "@/lib/stip-calculator"

interface PayoutScaleVisualProps {
  teamFinancialPayout: number // The weighted payout percentage (0-150)
  personalRating: number // The rating score (1-5)
  targetBonus: number // Target bonus amount in dollars
}

export function PayoutScaleVisual({ teamFinancialPayout, personalRating, targetBonus }: PayoutScaleVisualProps) {
  // Chart dimensions and margins
  const width = 500
  const height = 220
  const margin = { top: 20, right: 40, bottom: 45, left: 110 }
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
  const finalPayoutPercent = (teamFinancialPayout / 100) * (currentRating?.multiplier || 1) * 100
  const finalPayoutDollars = (targetBonus * teamFinancialPayout / 100) * (currentRating?.multiplier || 1)

  // Key X-axis points for Team Financial Payout
  const xTicks = [0, 40, 100, 150]

  // Payout curve points (showing the cliff structure)
  // This shows payout % at different achievement levels mapped to x-axis position
  const curvePoints = [
    { achievement: 0, payout: 0 },
    { achievement: 80, payout: 0 },    // Below 80% = 0%
    { achievement: 80, payout: 40 },   // At 80% jumps to 40%
    { achievement: 100, payout: 100 }, // 100% = 100%
    { achievement: 125, payout: 150 }, // 125% = 150% (max)
    { achievement: 150, payout: 150 }, // Stays at 150%
  ]

  // Create SVG path for the curve
  const pathD = curvePoints
    .map((point, i) => {
      const x = xScale(point.payout) // X is payout %
      // Map to middle of chart for the curve visualization
      const curveY = margin.top + chartHeight / 2 - (point.payout / 150) * (chartHeight / 3)
      return i === 0 ? `M ${x} ${curveY}` : `L ${x} ${curveY}`
    })
    .join(" ")

  return (
    <Card>
      <CardHeader>
        <CardTitle>STIP Payout Visual</CardTitle>
        <CardDescription>
          Team Financial Performance % (x-axis) combined with Performance Rating (y-axis) determines your final bonus
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
                className={
                  payout === 40 ? "text-destructive/30" :
                  payout === 150 ? "text-accent/30" :
                  "text-border"
                }
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

            {/* Dollar amount labels on the right for each rating tier */}
            {ratings.map((rating, index) => {
              const dollarAmount = (targetBonus * teamFinancialPayout / 100) * rating.multiplier
              return (
                <text
                  key={`dollar-${rating.score}`}
                  x={width - margin.right + 5}
                  y={yScale(index) + 4}
                  textAnchor="start"
                  className={`text-[9px] ${
                    rating.score === personalRating ? "fill-primary font-bold" : "fill-muted-foreground"
                  }`}
                >
                  {formatCurrency(dollarAmount)}
                </text>
              )
            })}

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
              Team Financial Performance %
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
                  className="text-primary/50"
                />
                <line
                  x1={margin.left}
                  y1={markerY}
                  x2={width - margin.right}
                  y2={markerY}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-primary/50"
                />

                {/* Marker circle */}
                <circle
                  cx={markerX}
                  cy={markerY}
                  r="14"
                  fill="currentColor"
                  className="text-primary"
                />
                <circle
                  cx={markerX}
                  cy={markerY}
                  r="9"
                  fill="white"
                />
                
                {/* Final payout label - smart positioning to avoid cutoff */}
                {(() => {
                  // Determine label position based on marker location
                  const isNearTop = markerY < margin.top + 50
                  const isNearRight = markerX > width - margin.right - 60
                  
                  // Position label below if near top, otherwise above
                  const labelY = isNearTop ? markerY + 28 : markerY - 38
                  const textY = isNearTop ? markerY + 43 : markerY - 23
                  
                  // Position label to left if near right edge
                  const labelX = isNearRight ? markerX - 55 : markerX - 50
                  const textX = isNearRight ? markerX - 5 : markerX
                  
                  return (
                    <>
                      <rect
                        x={labelX}
                        y={labelY}
                        width="100"
                        height="22"
                        rx="4"
                        fill="currentColor"
                        className="text-primary"
                      />
                      <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        className="fill-primary-foreground text-[11px] font-bold"
                      >
                        {formatCurrency(finalPayoutDollars)}
                      </text>
                    </>
                  )
                })()}
              </>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-3 rounded-lg bg-muted/50 p-3">
          <div className="flex flex-col gap-2 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Formula:</span> Target Bonus x Team Financial % x Personal Rating % = Final Payout
            </p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Your Calculation:</span>{" "}
              {formatCurrency(targetBonus)} x {teamFinancialPayout.toFixed(0)}% x {((currentRating?.multiplier || 1) * 100).toFixed(0)}% = {" "}
              <span className="font-bold text-primary">{formatCurrency(finalPayoutDollars)}</span>
              {" "}({finalPayoutPercent.toFixed(0)}% of target)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
