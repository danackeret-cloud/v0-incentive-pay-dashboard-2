import { DashboardHeader } from "@/components/dashboard-header"
import { BonusSummary } from "@/components/bonus-summary"
import { PayoutTiers } from "@/components/payout-tiers"
import { KPIBreakdown } from "@/components/kpi-breakdown"
import { PerformanceChart } from "@/components/performance-chart"
import { BonusCalculator } from "@/components/bonus-calculator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function IncentiveDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-balance">
            Short-Term Incentive Pay Dashboard
          </h2>
          <p className="mt-1 text-muted-foreground text-pretty">
            Track your performance and understand how your bonus is calculated
          </p>
        </div>

        {/* Summary Cards */}
        <section className="mb-8">
          <BonusSummary />
        </section>

        {/* Payout Tiers */}
        <section className="mb-8">
          <PayoutTiers />
        </section>

        {/* Performance Charts */}
        <section className="mb-8">
          <PerformanceChart />
        </section>

        {/* Detailed Views */}
        <Tabs defaultValue="breakdown" className="mb-8">
          <TabsList>
            <TabsTrigger value="breakdown">KPI Breakdown</TabsTrigger>
            <TabsTrigger value="calculator">How It Works</TabsTrigger>
          </TabsList>
          <TabsContent value="breakdown" className="mt-4">
            <KPIBreakdown />
          </TabsContent>
          <TabsContent value="calculator" className="mt-4">
            <BonusCalculator />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="border-t pt-6 text-center text-sm text-muted-foreground">
          <p>
            This dashboard shows estimated bonus calculations based on current performance data.
            Final bonus amounts are subject to management approval and may vary.
          </p>
          <p className="mt-2">
            Questions about your incentive plan? Contact HR or your manager.
          </p>
        </footer>
      </main>
    </div>
  )
}
