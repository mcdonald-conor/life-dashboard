"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash, Plus, Clock } from "lucide-react"
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

// Add area filtering to WeeklySchedule
interface ScheduleEvent {
  id: string
  title: string
  day: number // 0-6 for Sunday-Saturday
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  category: string
  area?: "personal" | "university" | "tutoring" | string
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const CATEGORIES = ["Work", "Personal", "Health", "Learning", "Other"]

export default function WeeklySchedule({
  todayOnly = false,
  limit,
  area = "all",
}: {
  todayOnly?: boolean
  limit?: number
  area?: string
}) {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [newEvent, setNewEvent] = useState<Omit<ScheduleEvent, "id">>({
    title: "",
    day: new Date().getDay(),
    startTime: "09:00",
    endTime: "10:00",
    category: "Work",
    area: area !== "all" ? area : "personal",
  })
  const [dialogOpen, setDialogOpen] = useState(false)

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem("schedule-events")
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents))
      } catch (e) {
        console.error("Failed to parse events", e)
      }
    }
  }, [])

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem("schedule-events", JSON.stringify(events))
  }, [events])

  const addEvent = () => {
    if (newEvent.title.trim() === "") return

    const event: ScheduleEvent = {
      ...newEvent,
      id: Date.now().toString(),
    }

    setEvents([...events, event])
    setNewEvent({
      title: "",
      day: new Date().getDay(),
      startTime: "09:00",
      endTime: "10:00",
      category: "Work",
      area: area !== "all" ? area : "personal",
    })
    setDialogOpen(false)
  }

  const deleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id))
  }

  // Filter events by area if specified
  const areaFilteredEvents = area === "all" ? events : events.filter((event) => event.area === area)

  // Filter events for today if todayOnly is true
  const today = new Date().getDay()
  const filteredEvents = todayOnly ? areaFilteredEvents.filter((event) => event.day === today) : areaFilteredEvents

  // Sort events by day and start time
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.day !== b.day) {
      return a.day - b.day
    }
    return a.startTime.localeCompare(b.startTime)
  })

  // Limit the number of events if specified
  const displayedEvents = limit ? sortedEvents.slice(0, limit) : sortedEvents

  // Group events by day
  const eventsByDay = DAYS.map((day, index) => {
    return {
      day,
      events: sortedEvents.filter((event) => event.day === index),
    }
  })

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>Create a new timeboxed event for your schedule.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Meeting with team"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="day">Day</Label>
              <Select
                value={newEvent.day.toString()}
                onValueChange={(value) => setNewEvent({ ...newEvent, day: Number.parseInt(value) })}
              >
                <SelectTrigger id="day">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day, index) => (
                    <SelectItem key={day} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newEvent.category}
                onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {area === "all" && (
              <div className="grid gap-2">
                <Label htmlFor="area">Life Area</Label>
                <Select value={newEvent.area} onValueChange={(value) => setNewEvent({ ...newEvent, area: value })}>
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
            <Button onClick={addEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {todayOnly ? (
        // Today's events view
        <div className="space-y-2">
          {displayedEvents.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No events scheduled for today.</div>
          ) : (
            displayedEvents.map((event) => (
              <EventCard key={event.id} event={event} onDelete={deleteEvent} showArea={area === "all"} />
            ))
          )}

          {limit && filteredEvents.length > limit && (
            <div className="text-center text-sm text-muted-foreground">
              {filteredEvents.length - limit} more events not shown
            </div>
          )}
        </div>
      ) : (
        // Weekly schedule view
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {eventsByDay.map(({ day, events }) => (
            <div key={day} className="space-y-2">
              <h3 className="font-medium text-center p-2 bg-muted rounded-md">{day}</h3>

              {events.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">No events</div>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} onDelete={deleteEvent} compact showArea={area === "all"} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EventCard({
  event,
  onDelete,
  compact = false,
  showArea = false,
}: {
  event: ScheduleEvent
  onDelete: (id: string) => void
  compact?: boolean
  showArea?: boolean
}) {
  const categoryColors: Record<string, string> = {
    Work: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Personal: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    Health: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Learning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    Other: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
  }

  return (
    <Card className={`p-3 ${compact ? "text-xs" : ""}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1">
          <div className="font-medium">{event.title}</div>
          <div className="flex items-center text-muted-foreground">
            <Clock className={`${compact ? "h-3 w-3" : "h-4 w-4"} mr-1`} />
            <span>
              {event.startTime} - {event.endTime}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[event.category]}`}>
              {event.category}
            </span>
            {showArea && event.area && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {event.area}
              </span>
            )}
          </div>
        </div>

        {!compact && (
          <Button variant="ghost" size="icon" onClick={() => onDelete(event.id)} className="h-8 w-8">
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </div>
    </Card>
  )
}

