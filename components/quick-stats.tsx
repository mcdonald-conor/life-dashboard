"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Bell, Droplets, Check, Plus, Timer } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface DashboardSettings {
  volumeUnit: "ml" | "fl oz"
  useMetricSystem: boolean
}

// Conversion functions
const mlToOz = (ml: number) => Number((ml / 29.5735).toFixed(1))

// Update QuickStats to show stats by area
export default function QuickStats() {
  const [stats, setStats] = useState({
    completedTasks: 0,
    totalTasks: 0,
    todayEvents: 0,
    activeReminders: 0,
    waterIntake: 0,
    completedHabits: 0,
    totalHabits: 0,
    completedPomodoros: 0,
    // Add stats by area
    personal: { tasks: 0, events: 0, habits: 0, reminders: 0 },
    university: { tasks: 0, events: 0, habits: 0, reminders: 0 },
    tutoring: { tasks: 0, events: 0, habits: 0, reminders: 0 },
  })

  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>({
    volumeUnit: "ml",
    useMetricSystem: true,
  })

  useEffect(() => {
    // Load dashboard settings
    const savedDashboardSettings = localStorage.getItem("dashboard-settings")
    if (savedDashboardSettings) {
      try {
        const parsed = JSON.parse(savedDashboardSettings)
        setDashboardSettings({
          volumeUnit: parsed.volumeUnit || "ml",
          useMetricSystem: parsed.useMetricSystem || true,
        })
      } catch (e) {
        console.error("Failed to parse dashboard settings", e)
      }
    }

    // Get todos
    const savedTodos = localStorage.getItem("todos")
    let todos = []
    if (savedTodos) {
      try {
        todos = JSON.parse(savedTodos)
      } catch (e) {
        console.error("Failed to parse todos", e)
      }
    }

    // Get events
    const savedEvents = localStorage.getItem("schedule-events")
    let events = []
    if (savedEvents) {
      try {
        events = JSON.parse(savedEvents)
      } catch (e) {
        console.error("Failed to parse events", e)
      }
    }

    // Get reminders
    const savedReminders = localStorage.getItem("reminders")
    let reminders = []
    if (savedReminders) {
      try {
        reminders = JSON.parse(savedReminders)
      } catch (e) {
        console.error("Failed to parse reminders", e)
      }
    }

    // Get habits
    const savedHabits = localStorage.getItem("habits")
    let habits = []
    if (savedHabits) {
      try {
        habits = JSON.parse(savedHabits)
      } catch (e) {
        console.error("Failed to parse habits", e)
      }
    }

    // Get completed pomodoros
    const savedPomodoros = localStorage.getItem("completed-pomodoros")
    let completedPomodoros = 0
    if (savedPomodoros) {
      try {
        completedPomodoros = JSON.parse(savedPomodoros)
      } catch (e) {
        console.error("Failed to parse completed pomodoros", e)
      }
    }

    // Calculate stats
    const completedTasks = todos.filter((todo: any) => todo.completed).length
    const totalTasks = todos.length

    const today = new Date().getDay()
    const todayEvents = events.filter((event: any) => event.day === today).length

    const activeReminders = reminders.filter(
      (reminder: any) => reminder.enabled && reminder.days.includes(today),
    ).length

    // Get water intake from localStorage (updated by the WaterTracker component)
    const waterLogs = localStorage.getItem("water-logs")
    let waterIntake = 0

    if (waterLogs) {
      try {
        const logs = JSON.parse(waterLogs)
        const todayStr = new Date().toISOString().split("T")[0]
        waterIntake = logs
          .filter((log: any) => log.timestamp.startsWith(todayStr))
          .reduce((total: number, log: any) => total + log.amount, 0)
      } catch (e) {
        console.error("Failed to parse water logs", e)
      }
    }

    // Get habits completed today
    const todayStr = new Date().toISOString().split("T")[0]
    const todayHabits = habits.filter((habit: any) => {
      const habitDay =
        habit.frequency === "daily" ||
        (habit.frequency === "weekly" && today === 1) ||
        (habit.frequency === "custom" && habit.customDays?.includes(today))

      return habitDay
    })

    const completedHabits = todayHabits.filter((habit: any) =>
      habit.completedDates.some((date: string) => date.startsWith(todayStr)),
    ).length

    // Calculate stats by area
    const areaStats = {
      personal: { tasks: 0, events: 0, habits: 0, reminders: 0 },
      university: { tasks: 0, events: 0, habits: 0, reminders: 0 },
      tutoring: { tasks: 0, events: 0, habits: 0, reminders: 0 },
    }

    // Count tasks by area
    todos.forEach((todo: any) => {
      if (todo.area && areaStats[todo.area as keyof typeof areaStats]) {
        areaStats[todo.area as keyof typeof areaStats].tasks++
      }
    })

    // Count events by area
    events.forEach((event: any) => {
      if (event.day === today && event.area && areaStats[event.area as keyof typeof areaStats]) {
        areaStats[event.area as keyof typeof areaStats].events++
      }
    })

    // Count habits by area
    todayHabits.forEach((habit: any) => {
      if (habit.area && areaStats[habit.area as keyof typeof areaStats]) {
        areaStats[habit.area as keyof typeof areaStats].habits++
      }
    })

    // Count reminders by area
    reminders.forEach((reminder: any) => {
      if (
        reminder.enabled &&
        reminder.days.includes(today) &&
        reminder.area &&
        areaStats[reminder.area as keyof typeof areaStats]
      ) {
        areaStats[reminder.area as keyof typeof areaStats].reminders++
      }
    })

    setStats({
      completedTasks,
      totalTasks,
      todayEvents,
      activeReminders,
      waterIntake,
      completedHabits,
      totalHabits: todayHabits.length,
      completedPomodoros,
      personal: areaStats.personal,
      university: areaStats.university,
      tutoring: areaStats.tutoring,
    })
  }, [])

  // Watch for dashboard settings changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "dashboard-settings" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          setDashboardSettings({
            volumeUnit: parsed.volumeUnit || "ml",
            useMetricSystem: parsed.useMetricSystem || true,
          })
        } catch (e) {
          console.error("Failed to parse dashboard settings", e)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Convert water intake for display
  const displayWaterIntake = dashboardSettings.volumeUnit === "fl oz" ? mlToOz(stats.waterIntake) : stats.waterIntake

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Tasks"
          value={`${stats.completedTasks}/${stats.totalTasks}`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
        />

        <StatCard
          title="Active Reminders"
          value={stats.activeReminders.toString()}
          icon={<Bell className="h-5 w-5" />}
          color="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
        />

        <StatCard
          title="Water Intake"
          value={`${displayWaterIntake} ${dashboardSettings.volumeUnit}`}
          icon={<Droplets className="h-5 w-5" />}
          color="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400"
        />

        <StatCard
          title="Habits"
          value={`${stats.completedHabits}/${stats.totalHabits}`}
          icon={<Check className="h-5 w-5" />}
          color="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
        />

        <StatCard
          title="Focus Sessions"
          value={stats.completedPomodoros.toString()}
          icon={<Timer className="h-5 w-5" />}
          color="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AreaStatCard
          title="Personal"
          stats={stats.personal}
          color="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
        />
        <AreaStatCard
          title="University"
          stats={stats.university}
          color="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <AreaStatCard
          title="Tutoring"
          stats={stats.tutoring}
          color="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
        />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-2 rounded-full ${color}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function AreaStatCard({
  title,
  stats,
  color,
}: {
  title: string
  stats: { tasks: number; events: number; habits: number; reminders: number }
  color: string
}) {
  const area = title.toLowerCase() as "personal" | "university" | "tutoring"
  const descriptions = {
    personal: "Personal development, health, and wellness",
    university: "Academic tasks and study management",
    tutoring: "Tutoring sessions and preparation",
  }

  return (
    <Link href={`/${area}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className={`p-2 rounded-md ${color} mb-3`}>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{descriptions[area]}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tasks:</span>
              <span className="font-medium">{stats.tasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Events:</span>
              <span className="font-medium">{stats.events}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Habits:</span>
              <span className="font-medium">{stats.habits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reminders:</span>
              <span className="font-medium">{stats.reminders}</span>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add {title} Task
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
