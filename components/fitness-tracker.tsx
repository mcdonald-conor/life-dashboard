"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format, subDays } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dumbbell, Trash, Scale, Clock, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Workout {
  id: string
  date: string // ISO date string
  type: string
  duration: number // in minutes
  intensity: "low" | "medium" | "high"
  details: string
  caloriesBurned?: number
}

interface WeightEntry {
  id: string
  date: string // ISO date string
  weight: number
  unit: "kg" | "lb"
  notes?: string
}

const WORKOUT_TYPES = [
  "Cardio",
  "Strength Training",
  "Yoga",
  "Swimming",
  "Cycling",
  "Running",
  "Walking",
  "HIIT",
  "Pilates",
  "Other",
]

export default function FitnessTracker() {
  const [activeTab, setActiveTab] = useState("workouts")
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false)
  const [weightDialogOpen, setWeightDialogOpen] = useState(false)
  const { toast } = useToast()

  // New workout form state
  const [newWorkout, setNewWorkout] = useState<Omit<Workout, "id">>({
    date: new Date().toISOString(),
    type: "Cardio",
    duration: 30,
    intensity: "medium",
    details: "",
  })

  // New weight entry form state
  const [newWeightEntry, setNewWeightEntry] = useState<Omit<WeightEntry, "id">>({
    date: new Date().toISOString(),
    weight: 70,
    unit: "kg",
  })

  // Load data from localStorage
  useEffect(() => {
    const savedWorkouts = localStorage.getItem("workouts")
    if (savedWorkouts) {
      try {
        setWorkouts(JSON.parse(savedWorkouts))
      } catch (e) {
        console.error("Failed to parse workouts", e)
      }
    }

    const savedWeightEntries = localStorage.getItem("weight-entries")
    if (savedWeightEntries) {
      try {
        setWeightEntries(JSON.parse(savedWeightEntries))
      } catch (e) {
        console.error("Failed to parse weight entries", e)
      }
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts))
  }, [workouts])

  useEffect(() => {
    localStorage.setItem("weight-entries", JSON.stringify(weightEntries))
  }, [weightEntries])

  const addWorkout = () => {
    // Estimate calories burned based on duration and intensity
    let caloriesBurned = newWorkout.duration * 5 // Base calculation
    if (newWorkout.intensity === "high") caloriesBurned *= 1.5
    if (newWorkout.intensity === "low") caloriesBurned *= 0.7

    const workout: Workout = {
      ...newWorkout,
      id: Date.now().toString(),
      caloriesBurned: Math.round(caloriesBurned),
    }

    setWorkouts([...workouts, workout])
    setWorkoutDialogOpen(false)

    // Reset form
    setNewWorkout({
      date: new Date().toISOString(),
      type: "Cardio",
      duration: 30,
      intensity: "medium",
      details: "",
    })

    toast({
      title: "Workout logged",
      description: `${workout.type} workout for ${workout.duration} minutes`,
    })
  }

  const addWeightEntry = () => {
    const entry: WeightEntry = {
      ...newWeightEntry,
      id: Date.now().toString(),
    }

    setWeightEntries([...weightEntries, entry])
    setWeightDialogOpen(false)

    // Reset form
    setNewWeightEntry({
      date: new Date().toISOString(),
      weight: 70,
      unit: "kg",
    })

    toast({
      title: "Weight logged",
      description: `${entry.weight} ${entry.unit}`,
    })
  }

  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter((workout) => workout.id !== id))
    toast({
      title: "Workout deleted",
      description: "Workout has been removed from your history",
    })
  }

  const deleteWeightEntry = (id: string) => {
    setWeightEntries(weightEntries.filter((entry) => entry.id !== id))
    toast({
      title: "Weight entry deleted",
      description: "Weight entry has been removed from your history",
    })
  }

  // Calculate workout stats
  const totalMinutesThisWeek = workouts
    .filter((w) => new Date(w.date) >= subDays(new Date(), 7))
    .reduce((total, workout) => total + workout.duration, 0)

  const totalWorkoutsThisWeek = workouts.filter((w) => new Date(w.date) >= subDays(new Date(), 7)).length

  // Calculate weight stats
  const sortedWeightEntries = [...weightEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const latestWeight = sortedWeightEntries.length > 0 ? sortedWeightEntries[sortedWeightEntries.length - 1] : null

  const previousWeight = sortedWeightEntries.length > 1 ? sortedWeightEntries[sortedWeightEntries.length - 2] : null

  const weightChange =
    latestWeight && previousWeight && latestWeight.unit === previousWeight.unit
      ? latestWeight.weight - previousWeight.weight
      : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fitness Tracker</CardTitle>
        <CardDescription>Track your workouts and monitor your weight</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workouts">
              <Dumbbell className="h-4 w-4 mr-2" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="weight">
              <Scale className="h-4 w-4 mr-2" />
              Weight
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Your Workouts</h3>
                <p className="text-sm text-muted-foreground">
                  {totalWorkoutsThisWeek} workouts • {totalMinutesThisWeek} minutes this week
                </p>
              </div>

              <Dialog open={workoutDialogOpen} onOpenChange={setWorkoutDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Workout
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log a New Workout</DialogTitle>
                    <DialogDescription>Record your exercise to track your fitness progress</DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="workoutType">Workout Type</Label>
                      <Select
                        value={newWorkout.type}
                        onValueChange={(value) => setNewWorkout({ ...newWorkout, type: value })}
                      >
                        <SelectTrigger id="workoutType">
                          <SelectValue placeholder="Select workout type" />
                        </SelectTrigger>
                        <SelectContent>
                          {WORKOUT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={newWorkout.duration}
                        onChange={(e) =>
                          setNewWorkout({
                            ...newWorkout,
                            duration: Number.parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="intensity">Intensity</Label>
                      <Select
                        value={newWorkout.intensity}
                        onValueChange={(value: "low" | "medium" | "high") =>
                          setNewWorkout({ ...newWorkout, intensity: value })
                        }
                      >
                        <SelectTrigger id="intensity">
                          <SelectValue placeholder="Select intensity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="details">Details (Optional)</Label>
                      <Textarea
                        id="details"
                        placeholder="Exercise details, how you felt, etc."
                        value={newWorkout.details}
                        onChange={(e) => setNewWorkout({ ...newWorkout, details: e.target.value })}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setWorkoutDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addWorkout}>Save Workout</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {workouts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                You haven't logged any workouts yet. Click the button above to get started!
              </div>
            ) : (
              <div className="space-y-3">
                {[...workouts]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((workout) => (
                    <Card key={workout.id} className="p-4">
                      <div className="flex justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Dumbbell className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">{workout.type}</h4>
                            <div className="flex text-sm text-muted-foreground gap-3 mt-1">
                              <div className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {workout.duration} min
                              </div>
                              <div>
                                {workout.intensity.charAt(0).toUpperCase() + workout.intensity.slice(1)} intensity
                              </div>
                              {workout.caloriesBurned && <div>~{workout.caloriesBurned} kcal</div>}
                            </div>
                            {workout.details && <p className="text-sm mt-2">{workout.details}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-xs text-right text-muted-foreground">
                            {format(new Date(workout.date), "MMM d, yyyy")}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteWorkout(workout.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}

                {workouts.length > 5 && (
                  <div className="text-center text-sm text-muted-foreground">
                    Showing 5 of {workouts.length} workouts
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="weight" className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Weight Tracking</h3>
                {latestWeight && (
                  <p className="text-sm text-muted-foreground">
                    Current: {latestWeight.weight} {latestWeight.unit}
                    {weightChange !== 0 && (
                      <span className={weightChange < 0 ? "text-green-500" : weightChange > 0 ? "text-red-500" : ""}>
                        {" "}
                        ({weightChange > 0 ? "+" : ""}
                        {weightChange.toFixed(1)} {latestWeight.unit})
                      </span>
                    )}
                  </p>
                )}
              </div>

              <Dialog open={weightDialogOpen} onOpenChange={setWeightDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Weight
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Your Weight</DialogTitle>
                    <DialogDescription>Keep track of your weight over time</DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          min="1"
                          value={newWeightEntry.weight}
                          onChange={(e) =>
                            setNewWeightEntry({
                              ...newWeightEntry,
                              weight: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Select
                          value={newWeightEntry.unit}
                          onValueChange={(value: "kg" | "lb") => setNewWeightEntry({ ...newWeightEntry, unit: value })}
                        >
                          <SelectTrigger id="unit">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kg">kg</SelectItem>
                            <SelectItem value="lb">lb</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any notes about this weight measurement"
                        value={newWeightEntry.notes || ""}
                        onChange={(e) =>
                          setNewWeightEntry({
                            ...newWeightEntry,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setWeightDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addWeightEntry}>Save Weight</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {weightEntries.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                You haven't logged any weight entries yet. Click the button above to get started!
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-48 bg-muted rounded-md p-4 flex items-end justify-between">
                  {/* Simple graph visualization */}
                  {sortedWeightEntries.slice(-7).map((entry, index) => {
                    const minWeight = Math.min(...sortedWeightEntries.slice(-7).map((e) => e.weight))
                    const maxWeight = Math.max(...sortedWeightEntries.slice(-7).map((e) => e.weight))
                    const range = maxWeight - minWeight || 1
                    const height = ((entry.weight - minWeight) / range) * 70 + 20

                    return (
                      <div key={entry.id} className="flex flex-col items-center">
                        <div className="text-xs text-muted-foreground mb-1">
                          {entry.weight}
                          {entry.unit}
                        </div>
                        <div className="w-8 bg-primary rounded-t-sm" style={{ height: `${height}%` }}></div>
                        <div className="text-xs text-muted-foreground mt-1">{format(new Date(entry.date), "d/M")}</div>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-2">
                  {[...weightEntries]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <div className="font-medium">
                            {entry.weight} {entry.unit}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(entry.date), "MMMM d, yyyy")}
                          </div>
                        </div>

                        {entry.notes && (
                          <div className="text-sm max-w-40 truncate text-muted-foreground">{entry.notes}</div>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteWeightEntry(entry.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

