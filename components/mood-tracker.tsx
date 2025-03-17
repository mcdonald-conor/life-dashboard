"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface MoodEntry {
  id: string
  date: string // ISO date string
  mood: string // emoji
  note: string
}

const MOODS = [
  { emoji: "😀", label: "Happy" },
  { emoji: "😊", label: "Content" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😠", label: "Angry" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😴", label: "Tired" },
  { emoji: "🤒", label: "Sick" },
  { emoji: "💪", label: "Energetic" },
  { emoji: "🥳", label: "Excited" },
]

export default function MoodTracker() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [note, setNote] = useState<string>("")
  const { toast } = useToast()

  // Load entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem("mood-entries")
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries))
      } catch (e) {
        console.error("Failed to parse mood entries", e)
      }
    }
  }, [])

  // Save entries to localStorage
  useEffect(() => {
    localStorage.setItem("mood-entries", JSON.stringify(entries))
  }, [entries])

  // Check if there's an entry for the selected date
  const todayStr = format(new Date(), "yyyy-MM-dd")
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
  const existingEntry = entries.find((entry) => entry.date.startsWith(selectedDateStr))

  // Reset form when changing dates
  useEffect(() => {
    if (existingEntry) {
      setSelectedMood(existingEntry.mood)
      setNote(existingEntry.note)
    } else {
      setSelectedMood("")
      setNote("")
    }
  }, [selectedDate, existingEntry])

  const handleSaveMood = () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        description: "Choose an emoji that represents your mood",
      })
      return
    }

    const newEntry: MoodEntry = {
      id: existingEntry?.id || Date.now().toString(),
      date: selectedDate.toISOString(),
      mood: selectedMood,
      note: note,
    }

    const updatedEntries = existingEntry
      ? entries.map((entry) => (entry.id === existingEntry.id ? newEntry : entry))
      : [...entries, newEntry]

    setEntries(updatedEntries)

    toast({
      title: existingEntry ? "Mood updated" : "Mood logged",
      description: `You're feeling ${MOODS.find((m) => m.emoji === selectedMood)?.label.toLowerCase() || selectedMood} on ${format(selectedDate, "MMM d, yyyy")}`,
    })
  }

  // Function to render emoji on calendar
  const renderDay = (day: Date) => {
    const dateStr = format(day, "yyyy-MM-dd")
    const entry = entries.find((entry) => entry.date.startsWith(dateStr))

    return (
      <div className="flex h-9 w-9 items-center justify-center p-0">
        {entry ? (
          <div className="relative flex h-full w-full items-center justify-center">
            <span>{entry.mood}</span>
          </div>
        ) : null}
      </div>
    )
  }

  // Get mood stats for past week
  const pastWeekMoods = () => {
    const today = new Date()
    const lastWeek = new Date()
    lastWeek.setDate(today.getDate() - 6)

    const weekEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= lastWeek && entryDate <= today
    })

    return weekEntries.length
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Tracker</CardTitle>
        <CardDescription>
          Track how you're feeling day to day
          {pastWeekMoods() > 0 && ` • ${pastWeekMoods()} entries in the past week`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div>
            <Label>Today's Mood</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {MOODS.map((mood) => (
                <Button
                  key={mood.emoji}
                  variant={selectedMood === mood.emoji ? "default" : "outline"}
                  size="icon"
                  className="h-12 w-12 text-xl"
                  onClick={() => setSelectedMood(mood.emoji)}
                  title={mood.label}
                >
                  {mood.emoji}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="note">Notes (Optional)</Label>
            <Textarea
              id="note"
              placeholder="How are you feeling today? Any particular reasons?"
              className="mt-2"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button onClick={handleSaveMood} className="w-full" disabled={!selectedMood}>
            {existingEntry ? "Update" : "Save"} Mood for {format(selectedDate, "MMM d, yyyy")}
          </Button>
        </div>

        <div className="flex-1">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="border rounded-md"
            components={{
              Day: (props) => (
                <button
                  onClick={props.onClick}
                  className={cn(
                    "relative h-9 w-9 p-0 text-sm font-normal aria-selected:opacity-100",
                    props.disabled && "text-muted-foreground opacity-50",
                    props.selected && "bg-primary text-primary-foreground",
                    props.today && !props.selected && "border border-primary",
                  )}
                >
                  {renderDay(props.date)}
                  <time
                    dateTime={format(props.date, "yyyy-MM-dd")}
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-[0.65rem]"
                  >
                    {format(props.date, "d")}
                  </time>
                </button>
              ),
            }}
          />

          {existingEntry && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <div className="text-2xl mb-1">{existingEntry.mood}</div>
              <div className="text-sm font-medium">{format(new Date(existingEntry.date), "EEEE, MMMM d, yyyy")}</div>
              {existingEntry.note && <div className="mt-2 text-sm text-muted-foreground">{existingEntry.note}</div>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

