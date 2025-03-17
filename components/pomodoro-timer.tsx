"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, SettingsIcon } from "lucide-react"
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

type TimerMode = "work" | "break" | "longBreak"

interface PomodoroSettings {
  workDuration: number // in minutes
  breakDuration: number // in minutes
  longBreakDuration: number // in minutes
  longBreakInterval: number // number of work sessions before a long break
  autoStartBreaks: boolean
  autoStartWork: boolean
}

export default function PomodoroTimer() {
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>("work")
  const [timeLeft, setTimeLeft] = useState(25 * 60) // in seconds
  const [completedSessions, setCompletedSessions] = useState(0)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartWork: true,
  })

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("pomodoro-settings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error("Failed to parse pomodoro settings", e)
      }
    }

    // Load completed sessions
    const savedCompletedSessions = localStorage.getItem("completed-pomodoros")
    if (savedCompletedSessions) {
      try {
        setCompletedSessions(JSON.parse(savedCompletedSessions))
      } catch (e) {
        console.error("Failed to parse completed pomodoros", e)
      }
    }
  }, [])

  // Initialize timer based on mode
  useEffect(() => {
    let duration = 0

    switch (mode) {
      case "work":
        duration = settings.workDuration * 60
        break
      case "break":
        duration = settings.breakDuration * 60
        break
      case "longBreak":
        duration = settings.longBreakDuration * 60
        break
    }

    setTimeLeft(duration)
  }, [mode, settings])

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout)
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning])

  const handleTimerComplete = () => {
    // Play sound
    const audio = new Audio("/notification.mp3")
    audio.play().catch((e) => console.error("Failed to play sound", e))

    if (mode === "work") {
      const newCompletedSessions = completedSessions + 1
      setCompletedSessions(newCompletedSessions)

      // Save completed sessions to localStorage
      localStorage.setItem("completed-pomodoros", JSON.stringify(newCompletedSessions))

      // Show notification
      toast({
        title: "Work session completed!",
        description: "Time for a break.",
      })

      // Request browser notification
      if (Notification.permission === "granted") {
        new Notification("Pomodoro Timer", {
          body: "Work session completed! Time for a break.",
          icon: "/favicon.ico",
        })
      }

      // Determine if it's time for a long break
      if (newCompletedSessions % settings.longBreakInterval === 0) {
        setMode("longBreak")
        if (settings.autoStartBreaks) {
          setIsRunning(true)
        } else {
          setIsRunning(false)
        }
      } else {
        setMode("break")
        if (settings.autoStartBreaks) {
          setIsRunning(true)
        } else {
          setIsRunning(false)
        }
      }
    } else {
      // Break is over, back to work
      toast({
        title: "Break completed!",
        description: "Time to get back to work.",
      })

      if (Notification.permission === "granted") {
        new Notification("Pomodoro Timer", {
          body: "Break completed! Time to get back to work.",
          icon: "/favicon.ico",
        })
      }

      setMode("work")
      if (settings.autoStartWork) {
        setIsRunning(true)
      } else {
        setIsRunning(false)
      }
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)

    let duration = 0
    switch (mode) {
      case "work":
        duration = settings.workDuration * 60
        break
      case "break":
        duration = settings.breakDuration * 60
        break
      case "longBreak":
        duration = settings.longBreakDuration * 60
        break
    }

    setTimeLeft(duration)
  }

  const saveSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings)
    localStorage.setItem("pomodoro-settings", JSON.stringify(newSettings))
    setSettingsOpen(false)
    resetTimer()
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const calculateProgress = () => {
    let totalDuration = 0

    switch (mode) {
      case "work":
        totalDuration = settings.workDuration * 60
        break
      case "break":
        totalDuration = settings.breakDuration * 60
        break
      case "longBreak":
        totalDuration = settings.longBreakDuration * 60
        break
    }

    return 100 - (timeLeft / totalDuration) * 100
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {mode === "work" ? "Focus time" : mode === "break" ? "Short break" : "Long break"}
        </div>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <SettingsIcon className="h-4 w-4" />
              <span className="sr-only">Timer Settings</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pomodoro Settings</DialogTitle>
              <DialogDescription>Customize your work and break intervals</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="workDuration">Work Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="workDuration"
                    min={1}
                    max={60}
                    step={1}
                    value={[settings.workDuration]}
                    onValueChange={(value) => setSettings({ ...settings, workDuration: value[0] })}
                  />
                  <span className="w-12 text-center">{settings.workDuration}</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="breakDuration"
                    min={1}
                    max={30}
                    step={1}
                    value={[settings.breakDuration]}
                    onValueChange={(value) => setSettings({ ...settings, breakDuration: value[0] })}
                  />
                  <span className="w-12 text-center">{settings.breakDuration}</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="longBreakDuration">Long Break Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="longBreakDuration"
                    min={5}
                    max={45}
                    step={1}
                    value={[settings.longBreakDuration]}
                    onValueChange={(value) => setSettings({ ...settings, longBreakDuration: value[0] })}
                  />
                  <span className="w-12 text-center">{settings.longBreakDuration}</span>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="longBreakInterval">Sessions before Long Break</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="longBreakInterval"
                    min={1}
                    max={8}
                    step={1}
                    value={[settings.longBreakInterval]}
                    onValueChange={(value) => setSettings({ ...settings, longBreakInterval: value[0] })}
                  />
                  <span className="w-12 text-center">{settings.longBreakInterval}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => saveSettings(settings)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="text-4xl font-bold tabular-nums">{formatTime(timeLeft)}</div>

        <Progress value={calculateProgress()} className="w-full h-2" />

        <div className="flex items-center gap-2">
          <Button
            variant={mode === "work" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode("work")
              resetTimer()
            }}
          >
            Work
          </Button>
          <Button
            variant={mode === "break" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode("break")
              resetTimer()
            }}
          >
            Break
          </Button>
          <Button
            variant={mode === "longBreak" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setMode("longBreak")
              resetTimer()
            }}
          >
            Long Break
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={toggleTimer} size="icon" variant="outline">
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button onClick={resetTimer} size="icon" variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">Sessions completed: {completedSessions}</div>
      </div>
    </div>
  )
}
