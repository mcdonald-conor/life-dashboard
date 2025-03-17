"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash, Plus, Bell, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Reminder {
  id: string
  title: string
  type: "supplement" | "water" | "medication" | "other"
  time: string // HH:MM format
  days: number[] // 0-6 for Sunday-Saturday
  enabled: boolean
  lastCompleted: string | null // ISO date string
  area?: "personal" | "university" | "tutoring" | string
}

const REMINDER_TYPES = ["supplement", "water", "medication", "other"]
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function RemindersPanel({ limit, area = "all" }: { limit?: number; area?: string }) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [newReminder, setNewReminder] = useState<Omit<Reminder, "id" | "lastCompleted">>({
    title: "",
    type: "supplement",
    time: "09:00",
    days: [1, 2, 3, 4, 5], // Monday to Friday by default
    enabled: true,
    area: area !== "all" ? area : "personal",
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()
  const notificationCheckRef = useRef<NodeJS.Timeout | null>(null)

  // Load reminders from localStorage
  useEffect(() => {
    const savedReminders = localStorage.getItem("reminders")
    if (savedReminders) {
      try {
        setReminders(JSON.parse(savedReminders))
      } catch (e) {
        console.error("Failed to parse reminders", e)
      }
    }
  }, [])

  // Save reminders to localStorage
  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders))
  }, [reminders])

  // Check for due reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      const currentDay = now.getDay()
      const currentTime = format(now, "HH:mm")

      reminders.forEach((reminder) => {
        if (
          reminder.enabled &&
          reminder.days.includes(currentDay) &&
          reminder.time === currentTime &&
          (!reminder.lastCompleted ||
            !format(new Date(reminder.lastCompleted), "yyyy-MM-dd").includes(format(now, "yyyy-MM-dd")))
        ) {
          // Show notification
          toast({
            title: `Reminder: ${reminder.title}`,
            description: `It's time for your ${reminder.type}`,
            duration: 10000,
          })

          // Request browser notification permission if needed
          if (Notification.permission === "granted") {
            new Notification(`Reminder: ${reminder.title}`, {
              body: `It's time for your ${reminder.type}`,
              icon: "/favicon.ico",
            })
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission()
          }
        }
      })
    }

    // Check immediately on load
    checkReminders()

    // Set up interval to check every minute
    notificationCheckRef.current = setInterval(checkReminders, 60000)

    return () => {
      if (notificationCheckRef.current) {
        clearInterval(notificationCheckRef.current)
      }
    }
  }, [reminders, toast])

  const addReminder = () => {
    if (newReminder.title.trim() === "") return

    const reminder: Reminder = {
      ...newReminder,
      id: Date.now().toString(),
      lastCompleted: null,
    }

    setReminders([...reminders, reminder])
    setNewReminder({
      title: "",
      type: "supplement",
      time: "09:00",
      days: [1, 2, 3, 4, 5],
      enabled: true,
      area: area !== "all" ? area : "personal",
    })
    setDialogOpen(false)
  }

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter((reminder) => reminder.id !== id))
  }

  const toggleDay = (day: number) => {
    if (newReminder.days.includes(day)) {
      setNewReminder({
        ...newReminder,
        days: newReminder.days.filter((d) => d !== day),
      })
    } else {
      setNewReminder({
        ...newReminder,
        days: [...newReminder.days, day].sort(),
      })
    }
  }

  const toggleReminderEnabled = (id: string) => {
    setReminders(
      reminders.map((reminder) => (reminder.id === id ? { ...reminder, enabled: !reminder.enabled } : reminder)),
    )
  }

  const markCompleted = (id: string) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === id ? { ...reminder, lastCompleted: new Date().toISOString() } : reminder,
      ),
    )

    toast({
      title: "Reminder completed",
      description: "Great job staying on track!",
    })
  }

  // Filter reminders by area if specified
  const filteredReminders = area === "all" ? reminders : reminders.filter((reminder) => reminder.area === area)

  // Sort reminders by time
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    return a.time.localeCompare(b.time)
  })

  // Filter for today's reminders
  const today = new Date().getDay()
  const todaysReminders = sortedReminders.filter((reminder) => reminder.days.includes(today))

  // Limit the number of reminders if specified
  const displayedReminders = limit ? todaysReminders.slice(0, limit) : todaysReminders

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Reminder
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Reminder</DialogTitle>
            <DialogDescription>
              Create a new reminder for supplements, water, medications, or anything else.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Reminder Title</Label>
              <Input
                id="title"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                placeholder="Take vitamin D"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newReminder.type}
                onValueChange={(value: "supplement" | "water" | "medication" | "other") =>
                  setNewReminder({ ...newReminder, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newReminder.time}
                onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label>Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day, index) => (
                  <Button
                    key={day}
                    type="button"
                    variant={newReminder.days.includes(index) ? "default" : "outline"}
                    className="h-8 px-2"
                    onClick={() => toggleDay(index)}
                  >
                    {day.substring(0, 3)}
                  </Button>
                ))}
              </div>
            </div>

            {area === "all" && (
              <div className="grid gap-2">
                <Label htmlFor="area">Life Area</Label>
                <Select
                  value={newReminder.area}
                  onValueChange={(value) => setNewReminder({ ...newReminder, area: value })}
                >
                  <SelectTrigger id="area">
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="tutoring">Tutoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addReminder}>Add Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {displayedReminders.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No reminders for today. Add one to get started!</div>
      ) : (
        <div className="space-y-2">
          {displayedReminders.map((reminder) => (
            <Card key={reminder.id} className="p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      reminder.type === "supplement"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : reminder.type === "water"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : reminder.type === "medication"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{reminder.title}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">{reminder.time}</div>
                      {area === "all" && reminder.area && (
                        <div className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {reminder.area}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => markCompleted(reminder.id)}
                    disabled={
                      reminder.lastCompleted &&
                      format(new Date(reminder.lastCompleted), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                    }
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Mark as completed</span>
                  </Button>

                  <Switch checked={reminder.enabled} onCheckedChange={() => toggleReminderEnabled(reminder.id)} />

                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteReminder(reminder.id)}>
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {limit && todaysReminders.length > limit && (
        <div className="text-center text-sm text-muted-foreground">
          {todaysReminders.length - limit} more reminders not shown
        </div>
      )}
    </div>
  )
}

