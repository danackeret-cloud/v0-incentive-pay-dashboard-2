"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  kpis,
  calculateKPIScore,
  getCategoryScore,
} from "@/lib/bonus-data"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from "recharts"

export function PerformanceChart() {
  // Data for radar chart - category scores
  const radarData = [
    {
      category: "Individual",
      score: getCategoryScore(kpis, "individual"),
      fullMark: 150,
    },
    {
      category: "Team",
      score: getCategoryScore(kpis, "team"),
      fullMark: 150,
    },
    {
      category: "Company",
      score: getCategoryScore(kpis, "company"),
      fullMark: 150,
    },
  ]

  // Data for bar chart - individual KPI scores
  const barData = kpis.map((kpi) => ({
    name: kpi.name.length > 15 ? kpi.name.substring(0, 15) + "..." : kpi.name,
    fullName: kpi.name,
    score: Math.round(calculateKPIScore(kpi)),
    weight: kpi.weight,
    category: kpi.category,
  }))

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "individual":
        return "hsl(var(--chart-1))"
      case "team":
        return "hsl(var(--chart-2))"
      case "company":
        return "hsl(var(--chart-4))"
      default:
        return "hsl(var(--chart-1))"
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>
            Overview of your performance across individual, team, and company metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 150]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-1" />
              <span>Individual: {getCategoryScore(kpis, "individual")}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-2" />
              <span>Team: {getCategoryScore(kpis, "team")}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-chart-4" />
              <span>Company: {getCategoryScore(kpis, "company")}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KPI Scores by Metric</CardTitle>
          <CardDescription>
            Individual performance scores across all KPIs with threshold and target markers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  domain={[0, 150]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string, props: { payload: { fullName: string; weight: number } }) => [
                    `${value}% (Weight: ${props.payload.weight}%)`,
                    props.payload.fullName,
                  ]}
                />
                <ReferenceLine
                  x={50}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="3 3"
                  label={{ value: "Threshold", fill: "hsl(var(--destructive))", fontSize: 10 }}
                />
                <ReferenceLine
                  x={100}
                  stroke="hsl(var(--accent))"
                  strokeDasharray="3 3"
                  label={{ value: "Target", fill: "hsl(var(--accent))", fontSize: 10 }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
