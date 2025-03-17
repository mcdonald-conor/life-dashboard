"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Droplets, Plus, Minus, SettingsIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface WaterLog {
  id: string
  amount: number // Always stored in ml internally
  timestamp: string
}

interface WaterSettings {
  dailyGoal: number // Always stored in ml internally
  defaultAmounts: number[] // Always stored in ml internally
}

interface DashboardSettings {
  volumeUnit: "ml" | "fl oz"
  useMetricSystem: boolean
}

// Conversion functions
const mlToOz = (ml: number) => Number((ml / 29.5735).toFixed(1))
const ozToMl = (oz: number) => Math.round(oz * 29.5735)

export default function WaterTracker() {
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [settings, setSettings] = useState<WaterSettings>({
    dailyGoal: 2000, // 2000ml = ~67.6 fl oz
    defaultAmounts: [250, 500, 750], // Common ml amounts
  })
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>({
    volumeUnit: "ml",
    useMetricSystem: true,
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [customAmount, setCustomAmount] = useState(250)
  const { toast } = useToast()

  // Load data from localStorage
  useEffect(() => {
    // Load water logs
    const savedLogs = localStorage.getItem("water-logs")
    if (savedLogs) {
      try {
        setWaterLogs(JSON.parse(savedLogs))
      } catch (e) {
        console.error("Failed to parse water logs", e)
      }
    }

    // Load water settings
    const savedSettings = localStorage.getItem("water-settings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error("Failed to parse water settings", e)
      }
    }

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
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("water-logs", JSON.stringify(waterLogs))

    // Update the water intake in localStorage for the stats component
    const today = new Date().toISOString().split("T")[0]
    const todayIntake = getTodayIntake()
    localStorage.setItem("water-intake", todayIntake.toString())
  }, [waterLogs])

  useEffect(() => {
    localStorage.setItem("water-settings", JSON.stringify(settings))
  }, [settings])

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

  const addWater = (amount: number) => {
    // Convert amount to ml if needed
    const amountInMl = dashboardSettings.volumeUnit === "fl oz" ? ozToMl(amount) : amount

    const newLog: WaterLog = {
      id: Date.now().toString(),
      amount: amountInMl,
      timestamp: new Date().toISOString(),
    }

    setWaterLogs([...waterLogs, newLog])

    const remainingAmount = Math.max(0, settings.dailyGoal - (getTodayIntake() + amountInMl))
    const displayAmount = dashboardSettings.volumeUnit === "fl oz" ? mlToOz(remainingAmount) : remainingAmount

    toast({
      title: `Added ${amount} ${dashboardSettings.volumeUnit}`,
      description: `Keep it up! ${displayAmount} ${dashboardSettings.volumeUnit} to go.`,
    })
  }

  const removeLastEntry = () => {
    if (waterLogs.length === 0) return

    // Filter to today's logs
    const today = new Date().toISOString().split("T")[0]
    const todayLogs = waterLogs.filter((log) => log.timestamp.startsWith(today))

    if (todayLogs.length === 0) return

    // Sort by timestamp (newest first)
    const sortedLogs = [...todayLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Remove the most recent log
    const latestLog = sortedLogs[0]
    setWaterLogs(waterLogs.filter((log) => log.id !== latestLog.id))

    const displayAmount = dashboardSettings.volumeUnit === "fl oz" ? mlToOz(latestLog.amount) : latestLog.amount

    toast({
      title: `Removed ${displayAmount} ${dashboardSettings.volumeUnit}`,
      description: "Last entry has been removed.",
    })
  }

  const saveSettings = () => {
    localStorage.setItem("water-settings", JSON.stringify(settings))
    setSettingsOpen(false)
  }

  const getTodayIntake = () => {
    const today = new Date().toISOString().split("T")[0]
    return waterLogs.filter((log) => log.timestamp.startsWith(today)).reduce((total, log) => total + log.amount, 0)
  }

  const todayIntake = getTodayIntake()
  const progressPercentage = Math.min(100, (todayIntake / settings.dailyGoal) * 100)

  // Convert values for display
  const displayTodayIntake = dashboardSettings.volumeUnit === "fl oz" ? mlToOz(todayIntake) : todayIntake
  const displayDailyGoal = dashboardSettings.volumeUnit === "fl oz" ? mlToOz(settings.dailyGoal) : settings.dailyGoal
  const displayDefaultAmounts = settings.defaultAmounts.map((amount) =>
    dashboardSettings.volumeUnit === "fl oz" ? mlToOz(amount) : amount
  )
  const displayCustomAmount = dashboardSettings.volumeUnit === "fl oz" ? mlToOz(customAmount) : customAmount

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <SettingsIcon className="h-4 w-4" />
              <span className="sr-only">Water Settings</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Water Tracker Settings</DialogTitle>
              <DialogDescription>Customize your daily water goal and quick add amounts</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="dailyGoal">Daily Goal ({dashboardSettings.volumeUnit})</Label>
                <Input
                  id="dailyGoal"
                  type="number"
                  min={dashboardSettings.volumeUnit === "fl oz" ? 8 : 250}
                  max={dashboardSettings.volumeUnit === "fl oz" ? 200 : 6000}
                  value={displayDailyGoal}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value) || (dashboardSettings.volumeUnit === "fl oz" ? 64 : 2000)
                    setSettings({
                      ...settings,
                      dailyGoal: dashboardSettings.volumeUnit === "fl oz" ? ozToMl(value) : value,
                    })
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: {dashboardSettings.volumeUnit === "fl oz" ? "64 fl oz (8 cups)" : "2000 ml (2 liters)"}
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Quick Add Buttons</Label>
                <div className="flex flex-wrap gap-2">
                  {displayDefaultAmounts.map((amount, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={dashboardSettings.volumeUnit === "fl oz" ? 64 : 2000}
                        className="w-20"
                        value={amount}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value) || (dashboardSettings.volumeUnit === "fl oz" ? 8 : 250)
                          const newAmounts = [...settings.defaultAmounts]
                          newAmounts[index] = dashboardSettings.volumeUnit === "fl oz" ? ozToMl(value) : value
                          setSettings({ ...settings, defaultAmounts: newAmounts })
                        }}
                      />
                      <span>{dashboardSettings.volumeUnit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveSettings}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {displayTodayIntake}{" "}
            <span className="text-lg font-normal text-muted-foreground">
              / {displayDailyGoal} {dashboardSettings.volumeUnit}
            </span>
          </div>
          <Droplets className="h-8 w-8 text-blue-500" />
        </div>

        <Progress value={progressPercentage} className="h-2" />

        <div className="flex flex-wrap gap-2">
          {displayDefaultAmounts.map((amount, index) => (
            <Button key={index} variant="outline" onClick={() => addWater(amount)} className="flex-1">
              <Plus className="h-4 w-4 mr-1" /> {amount} {dashboardSettings.volumeUnit}
            </Button>
          ))}

          <Button variant="outline" onClick={removeLastEntry} className="flex-1">
            <Minus className="h-4 w-4 mr-1" /> Undo
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            value={displayCustomAmount}
            onChange={(e) => {
              const value = Number.parseInt(e.target.value) || (dashboardSettings.volumeUnit === "fl oz" ? 8 : 250)
              setCustomAmount(dashboardSettings.volumeUnit === "fl oz" ? ozToMl(value) : value)
            }}
            className="w-20"
          />
          <span className="text-sm">{dashboardSettings.volumeUnit}</span>
          <Button variant="default" onClick={() => addWater(displayCustomAmount)} className="flex-1">
            Add Custom Amount
          </Button>
        </div>
      </div>
    </div>
  )
}
