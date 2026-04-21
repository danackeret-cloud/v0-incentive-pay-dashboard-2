"use client"

import { Badge } from "@/components/ui/badge"
import { EmployeeData } from "@/lib/bonus-data"
import { Building2, Calendar } from "lucide-react"

interface DashboardHeaderProps {
  employee: EmployeeData
}

export function DashboardHeader({ employee }: DashboardHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            STIP Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Short-Term Incentive Pay Overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Calendar className="h-3 w-3" />
            {employee.fiscalYear}
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <Building2 className="h-3 w-3" />
            {employee.teamLevel} Level
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xl font-semibold text-primary">
            {employee.name.split(" ").map(n => n[0]).join("")}
          </span>
        </div>
        <div>
          <div className="font-semibold text-foreground">{employee.name}</div>
          <div className="text-sm text-muted-foreground">
            {employee.title} • {employee.department}
          </div>
        </div>
      </div>
    </header>
  )
}
