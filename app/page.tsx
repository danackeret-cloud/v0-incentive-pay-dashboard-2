import { DashboardHeader } from "@/components/dashboard-header"
import { STIPSummary } from "@/components/stip-summary"
import { PayoutScale } from "@/components/payout-scale"
import { TeamFinancials } from "@/components/team-financials"
import { PersonalPerformance } from "@/components/personal-performance"
import { FormulaBreakdown } from "@/components/formula-breakdown"
import { demoSTIPData, calculateTeamFinancialPerformance } from "@/lib/bonus-data"

export default function STIPDashboard() {
  const teamPerformance = calculateTeamFinancialPerformance(demoSTIPData.teamFinancials)
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <DashboardHeader employee={demoSTIPData.employee} />

        {/* Summary Cards */}
        <section className="mt-8">
          <STIPSummary data={demoSTIPData} />
        </section>

        {/* Formula Breakdown */}
        <section className="mt-8">
          <FormulaBreakdown data={demoSTIPData} />
        </section>

        {/* Payout Scale */}
        <section className="mt-8">
          <PayoutScale currentAchievement={teamPerformance.weightedAchievement} />
        </section>

        {/* Two Column Layout for Details */}
        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Team Financials */}
          <TeamFinancials 
            metrics={demoSTIPData.teamFinancials} 
            teamLevel={demoSTIPData.employee.teamLevel}
          />
          
          {/* Personal Performance */}
          <PersonalPerformance 
            avPriorities={demoSTIPData.avPriorities}
            individualGoals={demoSTIPData.individualGoals}
            rating={demoSTIPData.personalRating}
          />
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
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
