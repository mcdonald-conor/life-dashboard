"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { format, differenceInMinutes, addDays, subDays } from "date-fns"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Moon, SunMedium, Plus, Clock, Trash } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SleepEntry {
  id: string
  sleepTime: string // ISO date string
  wakeTime: string // ISO date string
  quality: "poor" | "fair" | "good" | "excellent"
  notes?: string
}

export default function SleepTracker() {
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  // New sleep entry form state
  const [newEntry, setNewEntry] = useState<Omit<SleepEntry, "id">>({
    sleepTime: new Date().toISOString(),
    wakeTime: addDays(new Date(), 1).toISOString(),
    quality: "good",
  })

  // Load entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem("sleep-entries")
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries))
      } catch (e) {
        console.error("Failed to parse sleep entries", e)
      }
    }
  }, [])

  // Save entries to localStorage
  useEffect(() => {
    localStorage.setItem("sleep-entries", JSON.stringify(entries))
  }, [entries])

  const addSleepEntry = () => {
    const sleepTime = new Date(newEntry.sleepTime)
    const wakeTime = new Date(newEntry.wakeTime)

    // Validate times
    if (wakeTime <= sleepTime) {
      toast({
        title: "Invalid times",
        description: "Wake time must be after sleep time",
        variant: "destructive",
      })
      return
    }

    const entry: SleepEntry = {
      ...newEntry,
      id: Date.now().toString(),
    }

    setEntries([...entries, entry])
    setDialogOpen(false)

    // Reset form with today's date
    setNewEntry({
      sleepTime: new Date().toISOString(),
      wakeTime: addDays(new Date(), 1).toISOString(),
      quality: "good",
    })

    toast({
      title: "Sleep logged",
      description: `${calculateDuration(entry.sleepTime, entry.wakeTime)} of sleep recorded`,
    })
  }

  const deleteSleepEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id))
    toast({
      title: "Entry deleted",
      description: "Sleep entry has been removed",
    })
  }

  // Calculate sleep duration in hours and minutes
  const calculateDuration = (start: string, end: string) => {
    const minutes = differenceInMinutes(new Date(end), new Date(start))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    return `${hours}h ${remainingMinutes}m`
  }

  // Get average sleep duration for the past week
  const getAverageSleepDuration = () => {
    const weekAgo = subDays(new Date(), 7)

    const recentEntries = entries.filter((entry) => new Date(entry.sleepTime) >= weekAgo)

    if (recentEntries.length === 0) return null

    const totalMinutes = recentEntries.reduce((total, entry) => {
      return total + differenceInMinutes(new Date(entry.wakeTime), new Date(entry.sleepTime))
    }, 0)

    return totalMinutes / recentEntries.length
  }

  const averageMinutes = getAverageSleepDuration()
  const averageHours = averageMinutes ? Math.floor(averageMinutes / 60) : 0
  const averageRemainingMinutes = averageMinutes ? Math.floor(averageMinutes % 60) : 0

  // Sort entries by sleep time (most recent first)
  const sortedEntries = [...entries].sort((a, b) => new Date(b.sleepTime).getTime() - new Date(a.sleepTime).getTime())

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sleep Tracker</CardTitle>
          <CardDescription>
            Track your sleep patterns and quality
            {averageMinutes && (
              <>
                {" "}
                • {averageHours}h {averageRemainingMinutes}m avg
              </>
            )}
          </CardDescription>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Sleep
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Sleep</DialogTitle>
              <DialogDescription>Record when you went to sleep and woke up</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sleepTime">Sleep Time</Label>
                  <Input
                    id="sleepTime"
                    type="datetime-local"
                    value={format(new Date(newEntry.sleepTime), "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        sleepTime: new Date(e.target.value).toISOString(),
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="wakeTime">Wake Time</Label>
                  <Input
                    id="wakeTime"
                    type="datetime-local"
                    value={format(new Date(newEntry.wakeTime), "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) =>
                      setNewEntry({
                        ...newEntry,
                        wakeTime: new Date(e.target.value).toISOString(),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quality">Sleep Quality</Label>
                <Select
                  value={newEntry.quality}
                  onValueChange={(value: "poor" | "fair" | "good" | "excellent") =>
                    setNewEntry({ ...newEntry, quality: value })
                  }
                >
                  <SelectTrigger id="quality">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any factors that affected your sleep?"
                  value={newEntry.notes || ""}
                  onChange={(e) =>
                    setNewEntry({
                      ...newEntry,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addSleepEntry}>Save Entry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            You haven't logged any sleep entries yet. Click the button above to get started!
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {sortedEntries
                  .slice(0, 7)
                  .reverse()
                  .map((entry, index) => {
                    const qualityMap = {
                      poor: 25,
                      fair: 50,
                      good: 75,
                      excellent: 100,
                    }

                    return (
                      <div key={entry.id} className="flex flex-col items-center">
                        <Progress value={qualityMap[entry.quality]} className="h-24 w-3 rotate-180" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(entry.sleepTime), "EEE")}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="space-y-3">
              {sortedEntries.slice(0, 5).map((entry) => {
                const duration = differenceInMinutes(new Date(entry.wakeTime), new Date(entry.sleepTime))
                const durationHours = Math.floor(duration / 60)
                const durationMinutes = duration % 60

                const qualityColors = {
                  poor: "text-red-500",
                  fair: "text-amber-500",
                  good: "text-green-500",
                  excellent: "text-blue-500",
                }

                return (
                  <Card key={entry.id} className="p-4">
                    <div className="flex justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Moon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {format(new Date(entry.sleepTime), "MMM d")} - {format(new Date(entry.wakeTime), "MMM d")}
                          </h4>
                          <div className="flex text-sm text-muted-foreground gap-3 mt-1">
                            <div className="flex items-center">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              {durationHours}h {durationMinutes}m
                            </div>
                            <div className={qualityColors[entry.quality]}>
                              {entry.quality.charAt(0).toUpperCase() + entry.quality.slice(1)}
                            </div>
                          </div>

                          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                            <div>
                              <Moon className="h-3 w-3 inline mr-1" />
                              {format(new Date(entry.sleepTime), "h:mm a")}
                            </div>
                            <div>
                              <SunMedium className="h-3 w-3 inline mr-1" />
                              {format(new Date(entry.wakeTime), "h:mm a")}
                            </div>
                          </div>

                          {entry.notes && <p className="text-sm mt-2">{entry.notes}</p>}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteSleepEntry(entry.id)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </Card>
                )
              })}

              {entries.length > 5 && (
                <div className="text-center text-sm text-muted-foreground">Showing 5 of {entries.length} entries</div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

