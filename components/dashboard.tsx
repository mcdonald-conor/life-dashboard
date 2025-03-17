"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Timer, Droplets } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import TodoList from "./todo-list"
import QuickStats from "./quick-stats"
import SettingsPanel from "./settings-panel"
import PomodoroTimer from "./pomodoro-timer"
import WaterTracker from "./water-tracker"
import WeeklyOverview from "./weekly-overview"
import HabitTracker from "./habit-tracker"

export default function Dashboard() {
  const [showSettings, setShowSettings] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [showWater, setShowWater] = useState(false)

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Life Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowTimer(true)}>
            <Timer className="h-5 w-5" />
            <span className="sr-only">Focus Timer</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowWater(true)}>
            <Droplets className="h-5 w-5" />
            <span className="sr-only">Water Tracker</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </header>

      {/* Timer Modal */}
      <Dialog open={showTimer} onOpenChange={setShowTimer}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Focus Timer</DialogTitle>
            <DialogDescription>Stay focused on your tasks</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <PomodoroTimer />
          </div>
        </DialogContent>
      </Dialog>

      {/* Water Tracker Modal */}
      <Dialog open={showWater} onOpenChange={setShowWater}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Water Tracker</DialogTitle>
            <DialogDescription>Track your daily hydration</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <WaterTracker />
          </div>
        </DialogContent>
      </Dialog>

      {showSettings ? (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      ) : (
        <div className="space-y-6">
          {/* Quick Stats */}
          <QuickStats />

          {/* Daily Habits */}
          <Card>
            <CardContent className="pt-6">
              <HabitTracker limit={5} area="all" />
            </CardContent>
          </Card>

          {/* Tasks and Schedule */}
          <WeeklyOverview />
        </div>
      )}
    </div>
  )
}
