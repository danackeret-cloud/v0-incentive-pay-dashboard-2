"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { calculatePayoutPercent, formatPercent } from "@/lib/bonus-data"

interface PayoutScaleProps {
  currentAchievement: number
}

export function PayoutScale({ currentAchievement }: PayoutScaleProps) {
  const currentPayout = calculatePayoutPercent(currentAchievement)
  
  // Scale markers
  const markers = [
    { achievement: 0.8, payout: 0.4, label: "80%", payoutLabel: "40%" },
    { achievement: 1.0, payout: 1.0, label: "100%", payoutLabel: "100%" },
    { achievement: 1.2, payout: 1.5, label: "120%", payoutLabel: "150%" },
  ]
  
  // Calculate position on the visual scale (0-100%)
  const getPosition = (achievement: number): number => {
    if (achievement <= 0.8) return (achievement / 0.8) * 20
    if (achievement <= 1.0) return 20 + ((achievement - 0.8) / 0.2) * 30
    if (achievement <= 1.2) return 50 + ((achievement - 1.0) / 0.2) * 30
    return Math.min(100, 80 + ((achievement - 1.2) / 0.2) * 20)
  }
  
  const currentPosition = getPosition(currentAchievement)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Scale</CardTitle>
        <CardDescription>
          How your team&apos;s achievement percentage translates to payout percentage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Scale */}
        <div className="relative pt-8 pb-4">
          {/* Scale track */}
          <div className="relative h-4 rounded-full bg-secondary overflow-hidden">
            {/* Zero zone (below 80%) */}
            <div 
              className="absolute left-0 top-0 h-full bg-destructive/30"
              style={{ width: "20%" }}
            />
            {/* Lower cliff zone (80-100%) */}
            <div 
              className="absolute top-0 h-full bg-chart-3/50"
              style={{ left: "20%", width: "30%" }}
            />
            {/* Target zone (100-120%) */}
            <div 
              className="absolute top-0 h-full bg-accent/50"
              style={{ left: "50%", width: "30%" }}
            />
            {/* Max zone (120%+) */}
            <div 
              className="absolute top-0 h-full bg-primary/50"
              style={{ left: "80%", width: "20%" }}
            />
            
            {/* Progress fill */}
            <div 
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-500"
              style={{ width: `${currentPosition}%` }}
            />
          </div>
          
          {/* Current position marker */}
          <div 
            className="absolute -top-1 transition-all duration-500"
            style={{ left: `calc(${currentPosition}% - 12px)` }}
          >
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-md shadow-md">
                {formatPercent(currentAchievement)}
              </div>
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-primary" />
            </div>
          </div>
          
          {/* Scale markers */}
          <div className="flex justify-between mt-4 text-xs text-muted-foreground">
            <span>0%</span>
            {markers.map((marker) => (
              <div 
                key={marker.label}
                className="flex flex-col items-center"
                style={{ 
                  position: "absolute", 
                  left: `${getPosition(marker.achievement)}%`,
                  transform: "translateX(-50%)"
                }}
              >
                <div className="h-2 w-px bg-border mb-1" />
                <span className="font-medium">{marker.label}</span>
              </div>
            ))}
            <span>140%+</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-destructive/30" />
            <div className="text-sm">
              <div className="font-medium">Below 80%</div>
              <div className="text-muted-foreground">0% Payout</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-chart-3/50" />
            <div className="text-sm">
              <div className="font-medium">80-100%</div>
              <div className="text-muted-foreground">40-100% Payout</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent/50" />
            <div className="text-sm">
              <div className="font-medium">100-120%</div>
              <div className="text-muted-foreground">100-150% Payout</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary/50" />
            <div className="text-sm">
              <div className="font-medium">Above 120%</div>
              <div className="text-muted-foreground">150% Max</div>
            </div>
          </div>
        </div>
        
        {/* Current Status */}
        <div className="bg-secondary/50 rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Your Team Achievement</div>
            <div className="text-xl font-bold">{formatPercent(currentAchievement)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Results in Payout</div>
            <div className="text-xl font-bold text-primary">{formatPercent(currentPayout)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
