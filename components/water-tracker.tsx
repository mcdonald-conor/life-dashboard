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
  amount: number // in oz
  timestamp: string
}

interface WaterSettings {
  dailyGoal: number // in oz
  defaultAmounts: number[] // in oz
}

export default function WaterTracker() {
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [settings, setSettings] = useState<WaterSettings>({
    dailyGoal: 64, // 64 oz = 8 cups = 2L (approximately)
    defaultAmounts: [8, 16, 24],
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [customAmount, setCustomAmount] = useState(8)
  const { toast } = useToast()

  // Load data from localStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem("water-logs")
    if (savedLogs) {
      try {
        setWaterLogs(JSON.parse(savedLogs))
      } catch (e) {
        console.error("Failed to parse water logs", e)
      }
    }

    const savedSettings = localStorage.getItem("water-settings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error("Failed to parse water settings", e)
      }
    }
  }, [])

  // Save data to localStorage
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

  const addWater = (amount: number) => {
    const newLog: WaterLog = {
      id: Date.now().toString(),
      amount,
      timestamp: new Date().toISOString(),
    }

    setWaterLogs([...waterLogs, newLog])

    toast({
      title: `Added ${amount} oz of water`,
      description: `Keep it up! ${Math.max(0, settings.dailyGoal - (getTodayIntake() + amount))} oz to go.`,
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

    toast({
      title: `Removed ${latestLog.amount} oz of water`,
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Water Intake</CardTitle>
            <CardDescription>Track your daily hydration</CardDescription>
          </div>
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
                  <Label htmlFor="dailyGoal">Daily Goal (oz)</Label>
                  <Input
                    id="dailyGoal"
                    type="number"
                    min={8}
                    max={200}
                    value={settings.dailyGoal}
                    onChange={(e) => setSettings({ ...settings, dailyGoal: Number.parseInt(e.target.value) || 64 })}
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 64 oz (8 cups, ~2 liters)</p>
                </div>

                <div className="grid gap-2">
                  <Label>Quick Add Buttons</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.defaultAmounts.map((amount, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={64}
                          className="w-20"
                          value={amount}
                          onChange={(e) => {
                            const newAmounts = [...settings.defaultAmounts]
                            newAmounts[index] = Number.parseInt(e.target.value) || 8
                            setSettings({ ...settings, defaultAmounts: newAmounts })
                          }}
                        />
                        <span>oz</span>
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
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {todayIntake} <span className="text-lg font-normal text-muted-foreground">/ {settings.dailyGoal} oz</span>
            </div>
            <Droplets className="h-8 w-8 text-blue-500" />
          </div>

          <Progress value={progressPercentage} className="h-2" />

          <div className="flex flex-wrap gap-2">
            {settings.defaultAmounts.map((amount, index) => (
              <Button key={index} variant="outline" onClick={() => addWater(amount)} className="flex-1">
                <Plus className="h-4 w-4 mr-1" /> {amount} oz
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
              value={customAmount}
              onChange={(e) => setCustomAmount(Number.parseInt(e.target.value) || 8)}
              className="w-20"
            />
            <span className="text-sm">oz</span>
            <Button variant="default" onClick={() => addWater(customAmount)} className="flex-1">
              Add Custom Amount
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

