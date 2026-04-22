import { STIPCalculator } from "@/components/stip-calculator"

export default function STIPCalculatorPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            STIP Calculator
          </h1>
          <p className="mt-2 text-balance text-muted-foreground">
            Explore how your short-term incentive plan (STIP) is calculated. Adjust the sliders to see how 
            team performance and your personal rating affect your bonus.
          </p>
          <p className="mt-1 text-sm text-muted-foreground/80">
            For salaried employees only.
          </p>
        </header>

        {/* Discretionary Disclaimer */}
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-semibold">Important:</span> This calculator is for informational purposes only. 
            Actual STIP payouts are not guaranteed and remain at the sole discretion of management. 
            All bonus payments are subject to approval and may be adjusted or withheld based on company performance and other factors.
          </p>
        </div>

        {/* How It Works */}
        <div className="mb-8 rounded-lg border bg-card p-4">
          <h2 className="font-semibold text-foreground">How STIP Works</h2>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
              Team Financials %
            </span>
            <span className="text-muted-foreground">x</span>
            <span className="rounded-full bg-accent/10 px-3 py-1 font-medium text-accent">
              Personal Rating %
            </span>
            <span className="text-muted-foreground">=</span>
            <span className="rounded-full bg-foreground px-3 py-1 font-medium text-background">
              Final STIP Payout %
            </span>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Team financials are based on Orders, Revenue, and Margin (equally weighted). 
            Personal rating is a 1-5 scale assigned by your manager.
          </p>
        </div>

        {/* Calculator */}
        <STIPCalculator />

        {/* Footer */}
        <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          <p className="text-balance">
            This calculator provides estimates for educational purposes only.
            Final bonus amounts are subject to management approval and actual financial results.
          </p>
          <p className="mt-2">
            Questions about your incentive plan? Contact HR or your manager.
          </p>
        </footer>
      </main>
    </div>
  )
}
