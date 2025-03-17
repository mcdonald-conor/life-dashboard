"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import TodoList from "@/components/todo-list"
import WeeklySchedule from "@/components/weekly-schedule"
import MoodTracker from "@/components/mood-tracker"
import FitnessTracker from "@/components/fitness-tracker"
import SleepTracker from "@/components/sleep-tracker"
import HabitTracker from "@/components/habit-tracker"
import RemindersPanel from "@/components/reminders-panel"

export default function PersonalPage() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Personal</h1>
      </header>

      <div className="space-y-6">
        {/* Tasks and Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Tasks</CardTitle>
              <CardDescription>Manage your personal development tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <TodoList area="personal" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Plan your personal activities</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklySchedule area="personal" />
            </CardContent>
          </Card>
        </div>

        {/* Health and Wellness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MoodTracker />
          <FitnessTracker />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <SleepTracker />
          <HabitTracker area="personal" />
          <RemindersPanel area="personal" />
        </div>
      </div>
    </div>
  )
}
