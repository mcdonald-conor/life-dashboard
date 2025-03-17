"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Plus, Trash, MoreHorizontal } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Add area filtering to HabitTracker
interface Habit {
  id: string
  name: string
  description: string
  frequency: "daily" | "weekly" | "custom" // How often the habit should be done
  customDays?: number[] // 0-6 for Sunday-Saturday, used if frequency is "custom"
  completedDates: string[] // ISO date strings
  createdAt: string // ISO date string
  color: string // CSS color
  goal?: number // For countable habits like "Drink 2L of water"
  unit?: string // e.g., "glasses", "minutes", "pages"
  area?: "personal" | "university" | "tutoring" | string
}

const COLORS = [
  "bg-red-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
]

const HABIT_SUGGESTIONS = [
  {
    name: "Drink Water",
    description: "Stay hydrated throughout the day",
    frequency: "daily",
    goal: 8,
    unit: "glasses",
  },
  {
    name: "Read",
    description: "Expand your knowledge and relax",
    frequency: "daily",
    goal: 30,
    unit: "minutes",
  },
  {
    name: "Exercise",
    description: "Stay active and improve your health",
    frequency: "daily",
    goal: 30,
    unit: "minutes",
  },
  {
    name: "Meditate",
    description: "Practice mindfulness and reduce stress",
    frequency: "daily",
    goal: 10,
    unit: "minutes",
  },
  {
    name: "Write",
    description: "Express your thoughts and ideas",
    frequency: "daily",
    goal: 30,
    unit: "minutes",
  },
]

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function HabitTracker({ limit, area = "all" }: { limit?: number; area?: string }) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabit, setNewHabit] = useState<Omit<Habit, "id" | "completedDates" | "createdAt">>({
    name: "",
    description: "",
    frequency: "daily",
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    area: area !== "all" ? area : "personal",
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [suggestionDialogOpen, setSuggestionDialogOpen] = useState(false)
  const { toast } = useToast()

  // Load habits from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem("habits")
    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits))
      } catch (e) {
        console.error("Failed to parse habits", e)
      }
    }
  }, [])

  // Save habits to localStorage
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits))
  }, [habits])

  const addHabit = () => {
    if (newHabit.name.trim() === "") return

    const habit: Habit = {
      ...newHabit,
      id: Date.now().toString(),
      completedDates: [],
      createdAt: new Date().toISOString(),
    }

    setHabits([...habits, habit])
    setNewHabit({
      name: "",
      description: "",
      frequency: "daily",
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      area: area !== "all" ? area : "personal",
    })
    setDialogOpen(false)

    toast({
      title: "Habit created",
      description: `${habit.name} has been added to your habits.`,
    })
  }

  const addSuggestedHabit = (suggestion: any) => {
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)]

    const habit: Habit = {
      ...suggestion,
      id: Date.now().toString(),
      completedDates: [],
      createdAt: new Date().toISOString(),
      color: randomColor,
      area: area !== "all" ? area : "personal",
    }

    setHabits([...habits, habit])
    setSuggestionDialogOpen(false)

    toast({
      title: "Habit created",
      description: `${habit.name} has been added to your habits.`,
    })
  }

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((habit) => habit.id !== id))

    toast({
      title: "Habit deleted",
      description: "The habit has been removed.",
    })
  }

  const toggleDay = (day: number) => {
    if (!newHabit.customDays) {
      setNewHabit({ ...newHabit, customDays: [day] })
      return
    }

    if (newHabit.customDays.includes(day)) {
      setNewHabit({
        ...newHabit,
        customDays: newHabit.customDays.filter((d) => d !== day),
      })
    } else {
      setNewHabit({
        ...newHabit,
        customDays: [...newHabit.customDays, day].sort(),
      })
    }
  }

  const toggleHabitCompletion = (habit: Habit) => {
    const today = new Date().toISOString().split("T")[0]

    // Check if already completed today
    const completedToday = habit.completedDates.some((date) => date.startsWith(today))

    let updatedCompletedDates = [...habit.completedDates]

    if (completedToday) {
      // Remove today's completion
      updatedCompletedDates = updatedCompletedDates.filter((date) => !date.startsWith(today))

      toast({
        title: "Habit unmarked",
        description: `${habit.name} marked as not completed for today.`,
      })
    } else {
      // Add today's completion
      updatedCompletedDates.push(new Date().toISOString())

      toast({
        title: "Habit completed",
        description: `Great job completing ${habit.name} today!`,
      })
    }

    setHabits(habits.map((h) => (h.id === habit.id ? { ...h, completedDates: updatedCompletedDates } : h)))
  }

  const isHabitDueToday = (habit: Habit) => {
    const today = new Date().getDay()

    if (habit.frequency === "daily") {
      return true
    } else if (habit.frequency === "weekly") {
      // For weekly habits, we'll consider Monday as the default day
      return today === 1
    } else if (habit.frequency === "custom" && habit.customDays) {
      return habit.customDays.includes(today)
    }

    return false
  }

  const isHabitCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().split("T")[0]
    return habit.completedDates.some((date) => date.startsWith(today))
  }

  const calculateStreak = (habit: Habit) => {
    if (habit.completedDates.length === 0) return 0

    // Sort dates in descending order
    const sortedDates = [...habit.completedDates]
      .map((date) => new Date(date))
      .sort((a, b) => b.getTime() - a.getTime())

    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    // If habit is not due today or is completed today, start counting
    if (!isHabitDueToday(habit) || isHabitCompletedToday(habit)) {
      streak = 1

      // Start checking from yesterday
      currentDate.setDate(currentDate.getDate() - 1)

      // Loop through previous days
      while (true) {
        const dateStr = currentDate.toISOString().split("T")[0]

        // Check if habit was due on this day
        const dayOfWeek = currentDate.getDay()
        const wasDue =
          habit.frequency === "daily" ||
          (habit.frequency === "weekly" && dayOfWeek === 1) ||
          (habit.frequency === "custom" && habit.customDays?.includes(dayOfWeek))

        if (wasDue) {
          // Check if habit was completed on this day
          const wasCompleted = sortedDates.some((date) => date.toISOString().split("T")[0] === dateStr)

          if (wasCompleted) {
            streak++
          } else {
            break
          }
        }

        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1)
      }
    }

    return streak
  }

  // Filter habits by area if specified
  const filteredHabits = area === "all" ? habits : habits.filter((habit) => habit.area === area)

  // Filter habits that are due today
  const today = new Date().getDay()
  const todayHabits = filteredHabits.filter((habit) => isHabitDueToday(habit))

  // Sort habits by completion status (incomplete first)
  const sortedHabits = [...todayHabits].sort((a, b) => {
    const aCompleted = isHabitCompletedToday(a)
    const bCompleted = isHabitCompletedToday(b)

    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1
    }

    return a.name.localeCompare(b.name)
  })

  // Limit the number of habits if specified
  const displayedHabits = limit ? sortedHabits.slice(0, limit) : sortedHabits

  // Calculate completion rate for today
  const completionRate =
    todayHabits.length > 0
      ? (todayHabits.filter((habit) => isHabitCompletedToday(habit)).length / todayHabits.length) * 100
      : 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Habits</h3>
          <p className="text-sm text-muted-foreground">
            {todayHabits.filter((habit) => isHabitCompletedToday(habit)).length} of {todayHabits.length} completed today
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={suggestionDialogOpen} onOpenChange={setSuggestionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Suggestions
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Habit Suggestions</DialogTitle>
                <DialogDescription>Choose from common habits to get started quickly</DialogDescription>
              </DialogHeader>

              <div className="grid gap-2 py-4 max-h-[400px] overflow-y-auto">
                {HABIT_SUGGESTIONS.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="p-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => addSuggestedHabit(suggestion)}
                  >
                    <div className="font-medium">{suggestion.name}</div>
                    {suggestion.description && (
                      <div className="text-sm text-muted-foreground">{suggestion.description}</div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {suggestion.frequency === "daily"
                        ? "Every day"
                        : suggestion.frequency === "weekly"
                          ? "Once a week"
                          : "Custom schedule"}
                      {suggestion.goal && ` • ${suggestion.goal} ${suggestion.unit}`}
                    </div>
                  </Card>
                ))}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSuggestionDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
                <DialogDescription>Add a new habit to track regularly</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Habit Name</Label>
                  <Input
                    id="name"
                    value={newHabit.name}
                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                    placeholder="Drink water"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newHabit.description}
                    onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                    placeholder="Drink 8 glasses of water daily"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={newHabit.frequency}
                    onValueChange={(value: "daily" | "weekly" | "custom") =>
                      setNewHabit({ ...newHabit, frequency: value })
                    }
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newHabit.frequency === "custom" && (
                  <div className="grid gap-2">
                    <Label>Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((day, index) => (
                        <Button
                          key={day}
                          type="button"
                          variant={newHabit.customDays?.includes(index) ? "default" : "outline"}
                          className="h-8 px-2"
                          onClick={() => toggleDay(index)}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {area === "all" && (
                  <div className="grid gap-2">
                    <Label htmlFor="area">Life Area</Label>
                    <Select value={newHabit.area} onValueChange={(value) => setNewHabit({ ...newHabit, area: value })}>
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

                <div className="grid gap-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-6 h-6 rounded-full ${color} ${
                          newHabit.color === color ? "ring-2 ring-offset-2 ring-primary" : ""
                        }`}
                        onClick={() => setNewHabit({ ...newHabit, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="goal">Goal (Optional)</Label>
                    <Input
                      id="goal"
                      type="number"
                      min="1"
                      value={newHabit.goal || ""}
                      onChange={(e) =>
                        setNewHabit({
                          ...newHabit,
                          goal: e.target.value ? Number.parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="8"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit (Optional)</Label>
                    <Input
                      id="unit"
                      value={newHabit.unit || ""}
                      onChange={(e) =>
                        setNewHabit({
                          ...newHabit,
                          unit: e.target.value || undefined,
                        })
                      }
                      placeholder="glasses"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addHabit}>Create Habit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {todayHabits.length > 0 && <Progress value={completionRate} className="h-2" />}

      {displayedHabits.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No habits for today. Add one to get started!</div>
      ) : (
        <div className="space-y-2">
          {displayedHabits.map((habit) => (
            <Card key={habit.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleHabitCompletion(habit)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                      isHabitCompletedToday(habit) ? `${habit.color} text-white` : "border-muted-foreground/20"
                    }`}
                  >
                    {isHabitCompletedToday(habit) && <Check className="h-4 w-4" />}
                  </button>

                  <div>
                    <div className="font-medium">{habit.name}</div>
                    {habit.description && <div className="text-sm text-muted-foreground">{habit.description}</div>}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {habit.goal && (
                        <div className="text-xs text-muted-foreground">
                          Goal: {habit.goal} {habit.unit}
                        </div>
                      )}
                      {area === "all" && habit.area && (
                        <div className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                          {habit.area}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">{calculateStreak(habit)} day streak</div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => deleteHabit(habit.id)}>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Habit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {limit && todayHabits.length > limit && (
        <div className="text-center text-sm text-muted-foreground">
          {todayHabits.length - limit} more habits not shown
        </div>
      )}
    </div>
  )
}

