"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import TodoList from "@/components/todo-list"
import WeeklySchedule from "@/components/weekly-schedule"
import TutoringTracker from "@/components/tutoring-tracker"
import HabitTracker from "@/components/habit-tracker"
import RemindersPanel from "@/components/reminders-panel"

export default function TutoringPage() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Tutoring</h1>
      </header>

      <div className="space-y-6">
        {/* Tutoring Overview */}
        <TutoringTracker />

        {/* Tasks and Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tutoring Tasks</CardTitle>
              <CardDescription>Manage your tutoring-related tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <TodoList area="tutoring" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Plan your tutoring sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklySchedule area="tutoring" />
            </CardContent>
          </Card>
        </div>

        {/* Additional Tools */}
        <div className="grid grid-cols-1 gap-6">
          <HabitTracker area="tutoring" />
          <RemindersPanel area="tutoring" />
        </div>
      </div>
    </div>
  )
}
