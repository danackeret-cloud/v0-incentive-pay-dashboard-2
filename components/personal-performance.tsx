"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AVPriority, 
  IndividualGoal, 
  PerformanceRating,
  ratingScale,
  formatPercent 
} from "@/lib/bonus-data"
import { CheckCircle2, Circle, AlertCircle, Clock, Star } from "lucide-react"

interface PersonalPerformanceProps {
  avPriorities: AVPriority[]
  individualGoals: IndividualGoal[]
  rating: PerformanceRating
}

const statusConfig = {
  "completed": { icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10", label: "Completed" },
  "on-track": { icon: Clock, color: "text-primary", bg: "bg-primary/10", label: "On Track" },
  "at-risk": { icon: AlertCircle, color: "text-chart-3", bg: "bg-chart-3/10", label: "At Risk" },
  "not-started": { icon: Circle, color: "text-muted-foreground", bg: "bg-secondary", label: "Not Started" },
}

export function PersonalPerformance({ avPriorities, individualGoals, rating }: PersonalPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Performance Rating</CardTitle>
        <CardDescription>
          Your manager&apos;s assessment based on AV Priorities and Individual Goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Rating Display */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= rating.score
                        ? "text-primary fill-primary"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <div>
                <div className="font-semibold text-lg">{rating.label}</div>
                <div className="text-sm text-muted-foreground">Rating: {rating.score} of 5</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatPercent(rating.multiplier)}
              </div>
              <div className="text-sm text-muted-foreground">Multiplier</div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="priorities" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="priorities">AV Priorities</TabsTrigger>
            <TabsTrigger value="goals">Individual & Team Goals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="priorities" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Company-wide priorities selected to focus your contributions
            </p>
            {avPriorities.filter(p => p.selected).map((priority) => (
              <div 
                key={priority.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
              >
                <CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <div className="font-medium">{priority.name}</div>
                  <div className="text-sm text-muted-foreground">{priority.description}</div>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Goals defined with your manager for this performance period
            </p>
            {individualGoals.map((goal) => {
              const config = statusConfig[goal.status]
              const Icon = config.icon
              return (
                <div 
                  key={goal.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{goal.name}</div>
                      <Badge variant="secondary" className={`${config.bg} ${config.color} border-0`}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{goal.description}</div>
                  </div>
                </div>
              )
            })}
          </TabsContent>
        </Tabs>
        
        {/* Rating Scale Reference */}
        <div className="pt-4 border-t">
          <div className="text-sm font-medium mb-3">Performance Rating Scale</div>
          <div className="grid grid-cols-5 gap-2">
            {ratingScale.map((r) => (
              <div 
                key={r.score}
                className={`p-2 rounded-lg text-center text-xs ${
                  r.score === rating.score 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary"
                }`}
              >
                <div className="font-bold">{r.score}</div>
                <div className={r.score === rating.score ? "text-primary-foreground/80" : "text-muted-foreground"}>
                  {formatPercent(r.multiplier)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
