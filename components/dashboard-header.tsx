"use client"

import { currentEmployee } from "@/lib/bonus-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"

export function DashboardHeader() {
  const initials = currentEmployee.name
    .split(" ")
    .map((n) => n[0])
    .join("")

  const currentDate = new Date()
  const quarter = Math.ceil((currentDate.getMonth() + 1) / 3)
  const year = currentDate.getFullYear()

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{currentEmployee.name}</h1>
            <p className="text-sm text-muted-foreground">
              {currentEmployee.title} • {currentEmployee.department}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>
              Q{quarter} {year} Performance Period
            </span>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Short-Term Incentive Plan
          </Badge>
        </div>
      </div>
    </header>
  )
}
