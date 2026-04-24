"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ratingScale, formatCurrency } from "@/lib/stip-calculator"

interface PayoutScaleVisualProps {
  teamFinancialPayout: number // The weighted payout percentage (0-150)
  personalRating: number // The rating score (1-5)
  targetBonus: number // Target bonus amount in dollars
  onPersonalRatingChange?: (rating: typeof ratingScale[number]) => void
}

export function PayoutScaleVisual({ 
  teamFinancialPayout, 
  personalRating, 
  targetBonus,
  onPersonalRatingChange
}: PayoutScaleVisualProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Chart dimensions and margins
  const width = 500
  const height = 250
  const margin = { top: 25, right: 45, bottom: 40, left: 75 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  // X-axis: Team Financial Payout (0-150%)
  const xScale = (payout: number) => (payout / 150) * chartWidth + margin.left
  
  // Y-axis: Rating tiers (1-5, displayed bottom to top)
  const ratings = [...ratingScale].reverse() // 5 at top, 1 at bottom
  const yStep = chartHeight / (ratings.length - 1)
  const yScale = (ratingIndex: number) => margin.top + ratingIndex * yStep
  const yScaleInverse = (y: number) => {
    const index = Math.round((y - margin.top) / yStep)
    return Math.max(0, Math.min(ratings.length - 1, index))
  }

  // Find current position
  const currentRatingIndex = ratings.findIndex(r => r.score === personalRating)
  const markerX = xScale(Math.min(teamFinancialPayout, 150))
  const markerY = yScale(currentRatingIndex)

  // Calculate final payout for display
  const currentRating = ratingScale.find(r => r.score === personalRating)
  const finalPayoutDollars = (targetBonus * teamFinancialPayout / 100) * (currentRating?.multiplier || 1)

  // Key X-axis points for Team Financial Payout
  const xTicks = [0, 40, 100, 150]

  // Get SVG coordinates from mouse/touch event
  const getSVGCoords = useCallback((e: MouseEvent | TouchEvent) => {
    if (!svgRef.current) return null
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    // Convert to SVG coordinates
    const scaleX = width / rect.width
    const scaleY = height / rect.height
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }, [width, height])

  // Handle drag - only updates personal rating (y-axis)
  const handleDrag = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return
    const coords = getSVGCoords(e)
    if (!coords) return

    // Update rating (y-axis only - team financial comes from sliders)
    const ratingIndex = yScaleInverse(coords.y)
    const newRating = ratings[ratingIndex]
    if (onPersonalRatingChange && newRating && newRating.score !== personalRating) {
      onPersonalRatingChange(newRating)
    }
  }, [isDragging, getSVGCoords, yScaleInverse, ratings, personalRating, onPersonalRatingChange])

  // Mouse/touch event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global listeners for drag
  useEffect(() => {
    if (isDragging) {
      const handleMove = (e: MouseEvent | TouchEvent) => handleDrag(e)
      const handleUp = () => setIsDragging(false)
      
      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
      window.addEventListener('touchmove', handleMove)
      window.addEventListener('touchend', handleUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
        window.removeEventListener('touchmove', handleMove)
        window.removeEventListener('touchend', handleUp)
      }
    }
  }, [isDragging, handleDrag])

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
          <p className="mb-2 text-xs text-muted-foreground text-center">Drag the marker up or down to change your performance rating</p>
          <svg 
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`} 
            className={`w-full min-w-[400px] ${isDragging ? 'cursor-grabbing' : ''}`}
            preserveAspectRatio="xMidYMid meet"
          >
            
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
              x={12}
              y={margin.top + chartHeight / 2}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-medium"
              transform={`rotate(-90, 12, ${margin.top + chartHeight / 2})`}
            >
              Rating (Multiplier)
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

            {/* Y-axis tick labels - Rating with multiplier range on single line */}
            {ratings.map((rating, index) => (
              <text
                key={`ylabel-${rating.score}`}
                x={margin.left - 8}
                y={yScale(index) + 4}
                textAnchor="end"
                className={`text-[10px] ${
                  rating.score === personalRating ? "fill-primary font-semibold" : "fill-muted-foreground"
                }`}
              >
                {rating.score} (~{rating.multiplier === 0 ? "0%" : `${(rating.multiplier * 100).toFixed(0)}%`})
              </text>
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

                {/* Marker circle - draggable */}
                <g 
                  onMouseDown={handleMouseDown}
                  onTouchStart={() => setIsDragging(true)}
                  className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  style={{ touchAction: 'none' }}
                >
                  <circle
                    cx={markerX}
                    cy={markerY}
                    r="18"
                    fill="transparent"
                    className="hover:fill-primary/10"
                  />
                  <circle
                    cx={markerX}
                    cy={markerY}
                    r="14"
                    fill="currentColor"
                    className={`text-primary ${isDragging ? 'opacity-80' : ''}`}
                  />
                  <circle
                    cx={markerX}
                    cy={markerY}
                    r="9"
                    fill="white"
                  />
                  {/* Drag handle icon */}
                  <g className="text-primary">
                    <circle cx={markerX - 3} cy={markerY - 2} r="1.5" fill="currentColor" />
                    <circle cx={markerX + 3} cy={markerY - 2} r="1.5" fill="currentColor" />
                    <circle cx={markerX - 3} cy={markerY + 2} r="1.5" fill="currentColor" />
                    <circle cx={markerX + 3} cy={markerY + 2} r="1.5" fill="currentColor" />
                  </g>
                </g>
                
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


      </CardContent>
    </Card>
  )
}
