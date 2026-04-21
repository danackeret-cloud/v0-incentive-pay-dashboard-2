"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  TeamFinancialMetric, 
  calculatePayoutPercent,
  formatCurrency,
  formatPercent 
} from "@/lib/bonus-data"
import { ShoppingCart, DollarSign, TrendingUp } from "lucide-react"

interface TeamFinancialsProps {
  metrics: TeamFinancialMetric[]
  teamLevel: string
}

const metricIcons: Record<string, typeof ShoppingCart> = {
  orders: ShoppingCart,
  revenue: DollarSign,
  margin: TrendingUp,
}

export function TeamFinancials({ metrics, teamLevel }: TeamFinancialsProps) {
  const weight = 100 / metrics.length
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Financial Performance</CardTitle>
            <CardDescription>
              Equally weighted metrics at your {teamLevel} level
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {formatPercent(weight / 100)} each
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {metrics.map((metric) => {
          const achievement = metric.actual / metric.target
          const payout = calculatePayoutPercent(achievement)
          const Icon = metricIcons[metric.id] || TrendingUp
          
          // Determine status color
          let statusColor = "text-accent"
          let statusBg = "bg-accent/10"
          if (achievement < 0.8) {
            statusColor = "text-destructive"
            statusBg = "bg-destructive/10"
          } else if (achievement < 1.0) {
            statusColor = "text-chart-3"
            statusBg = "bg-chart-3/10"
          } else if (achievement >= 1.2) {
            statusColor = "text-primary"
            statusBg = "bg-primary/10"
          }
          
          return (
            <div key={metric.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${statusBg}`}>
                    <Icon className={`h-4 w-4 ${statusColor}`} />
                  </div>
                  <div>
                    <div className="font-medium">{metric.name}</div>
                    <div className="text-sm text-muted-foreground">{metric.description}</div>
                  </div>
                </div>
                <Badge className={`${statusBg} ${statusColor} border-0`}>
                  {formatPercent(payout)} payout
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Actual: {metric.unit === "currency" 
                      ? formatCurrency(metric.actual) 
                      : metric.unit === "percentage"
                        ? formatPercent(metric.actual)
                        : metric.actual.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    Target: {metric.unit === "currency" 
                      ? formatCurrency(metric.target) 
                      : metric.unit === "percentage"
                        ? formatPercent(metric.target)
                        : metric.target.toLocaleString()}
                  </span>
                </div>
                
                {/* Progress bar with markers */}
                <div className="relative">
                  <Progress 
                    value={Math.min(achievement * 100, 140)} 
                    className="h-2"
                  />
                  {/* 80% marker */}
                  <div 
                    className="absolute top-0 h-2 w-px bg-chart-3"
                    style={{ left: "57%" }} // 80/140 ≈ 57%
                  />
                  {/* 100% marker */}
                  <div 
                    className="absolute top-0 h-2 w-px bg-accent"
                    style={{ left: "71.4%" }} // 100/140 ≈ 71.4%
                  />
                  {/* 120% marker */}
                  <div 
                    className="absolute top-0 h-2 w-px bg-primary"
                    style={{ left: "85.7%" }} // 120/140 ≈ 85.7%
                  />
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Achievement: <span className={`font-medium ${statusColor}`}>{formatPercent(achievement)}</span></span>
                  <span>Weight: {formatPercent(weight / 100)}</span>
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Weighted Summary */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Weighted Team Financial Payout</div>
              <div className="text-sm text-muted-foreground">
                Average of all metric payouts
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatPercent(
                  metrics.reduce((sum, m) => sum + calculatePayoutPercent(m.actual / m.target), 0) / metrics.length
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
