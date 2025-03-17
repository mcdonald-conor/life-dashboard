"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import TodoList from "@/components/todo-list"
import WeeklySchedule from "@/components/weekly-schedule"
import AssignmentTracker from "@/components/assignment-tracker"
import StudyTopicTracker from "@/components/study-topic-tracker"
import StudyResources from "@/components/study-resources"
import HabitTracker from "@/components/habit-tracker"
import RemindersPanel from "@/components/reminders-panel"

export default function UniversityPage() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Dashboard</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">University</h1>
      </header>

      <div className="space-y-6">
        {/* Tasks and Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>University Tasks</CardTitle>
              <CardDescription>Manage your academic tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <TodoList area="university" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Plan your study and class schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklySchedule area="university" />
            </CardContent>
          </Card>
        </div>

        {/* Study Management */}
        <div className="grid grid-cols-1 gap-6">
          <AssignmentTracker />
          <StudyTopicTracker />
          <StudyResources />
          <HabitTracker area="university" />
          <RemindersPanel area="university" />
        </div>
      </div>
    </div>
  )
}
