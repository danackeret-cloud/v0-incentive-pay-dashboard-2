"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  kpis,
  calculateKPIScore,
  getCategoryKPIs,
  getCategoryScore,
  getCategoryWeight,
  type KPI,
} from "@/lib/bonus-data"
import { cn } from "@/lib/utils"
import { User, Users, Building2 } from "lucide-react"

function KPICard({ kpi }: { kpi: KPI }) {
  const score = calculateKPIScore(kpi)
  const progressToTarget = Math.min(
    ((kpi.current - kpi.threshold) / (kpi.target - kpi.threshold)) * 100,
    100
  )
  const progressToMax = ((kpi.current - kpi.threshold) / (kpi.maximum - kpi.threshold)) * 100

  const getStatusColor = () => {
    if (score >= 100) return "bg-accent"
    if (score >= 50) return "bg-chart-3"
    return "bg-destructive"
  }

  const getStatusText = () => {
    if (score >= 150) return "Maximum"
    if (score >= 100) return "Above Target"
    if (score >= 50) return "On Track"
    return "Below Threshold"
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold">{kpi.name}</h4>
          <p className="text-sm text-muted-foreground">Weight: {kpi.weight}%</p>
        </div>
        <Badge variant="secondary" className={cn("text-white", getStatusColor())}>
          {getStatusText()}
        </Badge>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold">
            {kpi.current}
            <span className="text-sm font-normal text-muted-foreground">
              {kpi.unit}
            </span>
          </span>
          <span className="text-sm text-muted-foreground">
            Score: {Math.round(score)}%
          </span>
        </div>

        {/* Visual progress bar with threshold/target/max markers */}
        <div className="relative mt-3">
          <Progress value={Math.max(0, Math.min(progressToMax, 100))} className="h-3" />
          
          {/* Threshold marker */}
          <div
            className="absolute top-0 h-3 w-0.5 bg-muted-foreground"
            style={{ left: "0%" }}
            title="Threshold"
          />
          
          {/* Target marker */}
          <div
            className="absolute top-0 h-3 w-0.5 bg-foreground"
            style={{
              left: `${((kpi.target - kpi.threshold) / (kpi.maximum - kpi.threshold)) * 100}%`,
            }}
            title="Target"
          />
        </div>

        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>
            Threshold: {kpi.threshold}
            {kpi.unit}
          </span>
          <span>
            Target: {kpi.target}
            {kpi.unit}
          </span>
          <span>
            Max: {kpi.maximum}
            {kpi.unit}
          </span>
        </div>
      </div>
    </div>
  )
}

function CategorySummary({
  category,
  icon: Icon,
  label,
}: {
  category: KPI["category"]
  icon: React.ElementType
  label: string
}) {
  const categoryKPIs = getCategoryKPIs(kpis, category)
  const score = getCategoryScore(kpis, category)
  const weight = getCategoryWeight(kpis, category)

  return (
    <div className="flex items-center gap-4 rounded-lg bg-secondary/50 p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          {categoryKPIs.length} metrics • {weight}% of total weight
        </p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold">{score}%</p>
        <p className="text-xs text-muted-foreground">Category Score</p>
      </div>
    </div>
  )
}

export function KPIBreakdown() {
  const individualKPIs = getCategoryKPIs(kpis, "individual")
  const teamKPIs = getCategoryKPIs(kpis, "team")
  const companyKPIs = getCategoryKPIs(kpis, "company")

  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Breakdown</CardTitle>
        <CardDescription>
          Your bonus is calculated based on weighted performance across individual, team, and
          company metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Category summaries */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <CategorySummary category="individual" icon={User} label="Individual" />
          <CategorySummary category="team" icon={Users} label="Team" />
          <CategorySummary category="company" icon={Building2} label="Company" />
        </div>

        {/* Detailed KPIs by category */}
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {individualKPIs.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teamKPIs.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="company" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {companyKPIs.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
