"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Timer, Droplets, LogOut } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { signOut } from "next-auth/react"
import { useAuth } from "@/hooks/use-auth"

import TodoList from "./todo-list"
import QuickStats from "./quick-stats"
import SettingsPanel from "./settings-panel"
import PomodoroTimer from "./pomodoro-timer"
import WaterTracker from "./water-tracker"
import WeeklyOverview from "./weekly-overview"
import HabitTracker from "./habit-tracker"
import SignupModal from "./signup-modal"

export default function Dashboard() {
  const [showSettings, setShowSettings] = useState(false)
  const [showTimer, setShowTimer] = useState(false)
  const [showWater, setShowWater] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const { isAuthenticated, isLoading, user } = useAuth()

  // Check if it's the first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited")

    if (!hasVisited && !isAuthenticated && !isLoading) {
      setShowSignupModal(true)
      localStorage.setItem("hasVisited", "true")
    }
  }, [isAuthenticated, isLoading])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
  }

  return (
    <>
      <div className={`container mx-auto p-4 max-w-7xl ${showSignupModal ? "blur-sm" : ""}`}>
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
            {isAuthenticated && (
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log Out</span>
              </Button>
            )}
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
            {isAuthenticated && (
              <div className="rounded-lg border p-4 bg-background">
                <p className="font-medium">Welcome, {user?.name || "User"}!</p>
                <p className="text-sm text-muted-foreground">Your progress is being saved automatically.</p>
              </div>
            )}

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

      {/* Signup Modal */}
      <SignupModal
        open={showSignupModal}
        onOpenChange={(open) => {
          setShowSignupModal(open)
          // Mark as visited even if closed without signing up
          localStorage.setItem("hasVisited", "true")
        }}
      />
    </>
  )
}
