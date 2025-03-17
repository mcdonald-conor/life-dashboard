"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

import TodoList from "./todo-list"
import WeeklySchedule from "./weekly-schedule"
import RemindersPanel from "./reminders-panel"
import SettingsPanel from "./settings-panel"
import QuickStats from "./quick-stats"
import PomodoroTimer from "./pomodoro-timer"
import WaterTracker from "./water-tracker"
import HabitTracker from "./habit-tracker"
import MoodTracker from "./mood-tracker"
import FitnessTracker from "./fitness-tracker"
import SleepTracker from "./sleep-tracker"
import AssignmentTracker from "./assignment-tracker"
import StudyResources from "./study-resources"
import TutoringTracker from "./tutoring-tracker"
import StudyTopicTracker from "./study-topic-tracker"

// Define life areas
const LIFE_AREAS = ["personal", "university", "tutoring"] as const
type LifeArea = (typeof LIFE_AREAS)[number] | "all"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showSettings, setShowSettings] = useState(false)

  // Load user preferences from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem("dashboard-active-tab")
    if (savedTab) {
      setActiveTab(savedTab)
    }
  }, [])

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem("dashboard-active-tab", activeTab)
  }, [activeTab])

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Life Dashboard</h1>
        <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </header>

      {showSettings ? (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="university">University</TabsTrigger>
            <TabsTrigger value="tutoring">Tutoring</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Shows summary of everything */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PomodoroTimer />
              <WaterTracker />
            </div>

            <QuickStats />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Today's Tasks</CardTitle>
                    <CardDescription>Your to-dos for today</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <TodoList limit={5} area="all" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Today's Schedule</CardTitle>
                    <CardDescription>Your timeboxed activities</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <WeeklySchedule todayOnly limit={3} area="all" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Habits</CardTitle>
                  <CardDescription>Track your daily habits</CardDescription>
                </CardHeader>
                <CardContent>
                  <HabitTracker limit={5} area="all" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Reminders</CardTitle>
                <CardDescription>Your next supplements, water, and medications</CardDescription>
              </CardHeader>
              <CardContent>
                <RemindersPanel limit={5} area="all" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Tab */}
          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TodoList area="personal" />
              <WeeklySchedule area="personal" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MoodTracker />
              <FitnessTracker />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <SleepTracker />
              <HabitTracker area="personal" />
              <RemindersPanel area="personal" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Focus Timer</CardTitle>
                <CardDescription>Stay focused on your personal tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <PomodoroTimer />
              </CardContent>
            </Card>
          </TabsContent>

          {/* University Tab */}
          <TabsContent value="university" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TodoList area="university" />
              <WeeklySchedule area="university" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <AssignmentTracker />
              <StudyTopicTracker />
              <StudyResources />
              <HabitTracker area="university" />
              <RemindersPanel area="university" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Focus Timer</CardTitle>
                <CardDescription>Stay focused on your university tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <PomodoroTimer />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tutoring Tab */}
          <TabsContent value="tutoring" className="space-y-4">
            <TutoringTracker />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TodoList area="tutoring" />
              <WeeklySchedule area="tutoring" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <HabitTracker area="tutoring" />
              <RemindersPanel area="tutoring" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Focus Timer</CardTitle>
                <CardDescription>Stay focused on your tutoring tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <PomodoroTimer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

