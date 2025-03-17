"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format, addDays, isBefore, isAfter, differenceInDays } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, DollarSign, Users, CalendarClock, Plus, Trash, CheckCircle2, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface TutoringSession {
  id: string
  studentName: string
  subject: string
  date: string // ISO date string
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  durationHours: number
  hourlyRate: number
  isPaid: boolean
  paymentDate?: string // ISO date string
  notes?: string
  location?: string
  isRecurring: boolean
  recurringFrequency?: "weekly" | "biweekly" | "monthly"
}

export default function TutoringTracker() {
  const [sessions, setSessions] = useState<TutoringSession[]>([])
  const [activeTab, setActiveTab] = useState("upcoming")
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  // New session form state
  const [newSession, setNewSession] = useState<Omit<TutoringSession, "id">>({
    studentName: "",
    subject: "",
    date: new Date().toISOString(),
    startTime: "16:00",
    endTime: "17:00",
    durationHours: 1,
    hourlyRate: 30,
    isPaid: false,
    notes: "",
    location: "",
    isRecurring: false,
    recurringFrequency: "weekly",
  })

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("tutoring-sessions")
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions))
      } catch (e) {
        console.error("Failed to parse tutoring sessions", e)
      }
    }
  }, [])

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem("tutoring-sessions", JSON.stringify(sessions))
  }, [sessions])

  const addSession = () => {
    if (newSession.studentName.trim() === "" || newSession.subject.trim() === "") {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Calculate duration in hours
    const startParts = newSession.startTime.split(":")
    const endParts = newSession.endTime.split(":")
    const startMinutes = Number.parseInt(startParts[0]) * 60 + Number.parseInt(startParts[1])
    const endMinutes = Number.parseInt(endParts[0]) * 60 + Number.parseInt(endParts[1])
    const durationHours = (endMinutes - startMinutes) / 60

    const session: TutoringSession = {
      ...newSession,
      id: Date.now().toString(),
      durationHours,
    }

    setSessions([...sessions, session])
    setDialogOpen(false)

    // If recurring, add future sessions
    if (session.isRecurring && session.recurringFrequency) {
      const futureSessions: TutoringSession[] = []
      const baseDate = new Date(session.date)

      // Add 4 future sessions based on frequency
      for (let i = 1; i <= 4; i++) {
        let nextDate: Date

        if (session.recurringFrequency === "weekly") {
          nextDate = addDays(baseDate, 7 * i)
        } else if (session.recurringFrequency === "biweekly") {
          nextDate = addDays(baseDate, 14 * i)
        } else {
          // monthly
          nextDate = new Date(baseDate)
          nextDate.setMonth(nextDate.getMonth() + i)
        }

        futureSessions.push({
          ...session,
          id: Date.now().toString() + i,
          date: nextDate.toISOString(),
        })
      }

      setSessions((prev) => [...prev, ...futureSessions])
    }

    // Reset form
    setNewSession({
      studentName: "",
      subject: "",
      date: new Date().toISOString(),
      startTime: "16:00",
      endTime: "17:00",
      durationHours: 1,
      hourlyRate: 30,
      isPaid: false,
      notes: "",
      location: "",
      isRecurring: false,
      recurringFrequency: "weekly",
    })

    toast({
      title: "Session added",
      description: `Tutoring session with ${session.studentName} has been scheduled`,
    })
  }

  const deleteSession = (id: string) => {
    setSessions(sessions.filter((session) => session.id !== id))
    toast({
      title: "Session deleted",
      description: "The tutoring session has been removed",
    })
  }

  const togglePaidStatus = (id: string) => {
    setSessions(
      sessions.map((session) => {
        if (session.id === id) {
          return {
            ...session,
            isPaid: !session.isPaid,
            paymentDate: !session.isPaid ? new Date().toISOString() : undefined,
          }
        }
        return session
      }),
    )

    const session = sessions.find((s) => s.id === id)
    if (session) {
      toast({
        title: session.isPaid ? "Marked as unpaid" : "Marked as paid",
        description: session.isPaid
          ? `Payment status updated for ${session.studentName}'s session`
          : `Payment recorded for ${session.studentName}'s session`,
      })
    }
  }

  // Filter sessions into upcoming and past
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingSessions = sessions
    .filter(
      (session) =>
        isAfter(new Date(session.date), today) ||
        (format(new Date(session.date), "yyyy-MM-dd") === format(today, "yyyy-MM-dd") &&
          session.startTime > format(new Date(), "HH:mm")),
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const pastSessions = sessions
    .filter(
      (session) =>
        isBefore(new Date(session.date), today) ||
        (format(new Date(session.date), "yyyy-MM-dd") === format(today, "yyyy-MM-dd") &&
          session.startTime <= format(new Date(), "HH:mm")),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Most recent first

  // Calculate financial stats
  const totalEarned = pastSessions
    .filter((session) => session.isPaid)
    .reduce((total, session) => total + session.durationHours * session.hourlyRate, 0)

  const pendingPayments = pastSessions
    .filter((session) => !session.isPaid)
    .reduce((total, session) => total + session.durationHours * session.hourlyRate, 0)

  const totalHours = pastSessions.reduce((total, session) => total + session.durationHours, 0)

  const upcomingHours = upcomingSessions.reduce((total, session) => total + session.durationHours, 0)

  // Group sessions by student for summary
  const studentSummary = pastSessions.reduce(
    (acc, session) => {
      if (!acc[session.studentName]) {
        acc[session.studentName] = {
          hours: 0,
          earnings: 0,
          sessions: 0,
          subjects: new Set(),
        }
      }

      acc[session.studentName].hours += session.durationHours
      acc[session.studentName].earnings += session.isPaid ? session.durationHours * session.hourlyRate : 0
      acc[session.studentName].sessions += 1
      acc[session.studentName].subjects.add(session.subject)

      return acc
    },
    {} as Record<string, { hours: number; earnings: number; sessions: number; subjects: Set<string> }>,
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Hours Worked</CardTitle>
            <CardDescription>Total tutoring hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground ml-2">hours</div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {upcomingHours > 0 && `${upcomingHours.toFixed(1)} hours scheduled`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Earnings</CardTitle>
            <CardDescription>Total tutoring income</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-muted-foreground" />
              <div className="text-2xl font-bold">${totalEarned.toFixed(2)}</div>
            </div>
            {pendingPayments > 0 && (
              <div className="text-sm text-amber-500 mt-1">${pendingPayments.toFixed(2)} pending</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Students</CardTitle>
            <CardDescription>Active tutoring students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-muted-foreground" />
              <div className="text-2xl font-bold">{Object.keys(studentSummary).length}</div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {upcomingSessions.length > 0 && `${upcomingSessions.length} upcoming sessions`}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tutoring Sessions</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Tutoring Session</DialogTitle>
              <DialogDescription>Schedule a new tutoring session</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="studentName">Student Name*</Label>
                  <Input
                    id="studentName"
                    value={newSession.studentName}
                    onChange={(e) => setNewSession({ ...newSession, studentName: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject*</Label>
                  <Input
                    id="subject"
                    value={newSession.subject}
                    onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                    placeholder="Mathematics"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={format(new Date(newSession.date), "yyyy-MM-dd")}
                  onChange={(e) =>
                    setNewSession({
                      ...newSession,
                      date: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newSession.hourlyRate}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        hourlyRate: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    value={newSession.location || ""}
                    onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                    placeholder="Online / Library / etc."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPaid"
                  checked={newSession.isPaid}
                  onCheckedChange={(checked) => setNewSession({ ...newSession, isPaid: checked })}
                />
                <Label htmlFor="isPaid">Already Paid</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isRecurring"
                  checked={newSession.isRecurring}
                  onCheckedChange={(checked) => setNewSession({ ...newSession, isRecurring: checked })}
                />
                <Label htmlFor="isRecurring">Recurring Session</Label>
              </div>

              {newSession.isRecurring && (
                <div className="grid gap-2">
                  <Label htmlFor="recurringFrequency">Frequency</Label>
                  <Select
                    value={newSession.recurringFrequency}
                    onValueChange={(value: "weekly" | "biweekly" | "monthly") =>
                      setNewSession({ ...newSession, recurringFrequency: value })
                    }
                  >
                    <SelectTrigger id="recurringFrequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newSession.notes || ""}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  placeholder="Topics to cover, materials needed, etc."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addSession}>Add Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            <Calendar className="h-4 w-4 mr-2" />
            Upcoming ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            <Clock className="h-4 w-4 mr-2" />
            Past Sessions ({pastSessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No upcoming tutoring sessions. Click the "Add Session" button to schedule one.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => {
                const sessionDate = new Date(session.date)
                const daysUntil = differenceInDays(sessionDate, today)

                return (
                  <Card key={session.id} className="p-4">
                    <div className="flex justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <CalendarClock className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{session.studentName}</h4>
                          <div className="text-sm text-muted-foreground">
                            {session.subject} • {format(sessionDate, "EEEE, MMMM d")} • {session.startTime} -{" "}
                            {session.endTime}
                          </div>

                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              ${session.hourlyRate}/hr
                            </Badge>

                            {session.location && (
                              <Badge variant="outline" className="text-xs">
                                {session.location}
                              </Badge>
                            )}

                            {session.isRecurring && (
                              <Badge variant="outline" className="text-xs">
                                {session.recurringFrequency}
                              </Badge>
                            )}
                          </div>

                          {session.notes && <p className="text-sm mt-2">{session.notes}</p>}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm font-medium">
                          {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteSession(session.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-4">
          {pastSessions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No past tutoring sessions recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {pastSessions.map((session) => (
                <Card key={session.id} className="p-4">
                  <div className="flex justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${session.isPaid ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"}`}
                      >
                        {session.isPaid ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{session.studentName}</h4>
                        <div className="text-sm text-muted-foreground">
                          {session.subject} • {format(new Date(session.date), "MMM d, yyyy")} • {session.startTime} -{" "}
                          {session.endTime}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {session.durationHours} hours
                          </Badge>

                          <Badge variant="outline" className="text-xs">
                            ${(session.durationHours * session.hourlyRate).toFixed(2)}
                          </Badge>

                          <Badge variant={session.isPaid ? "default" : "secondary"} className="text-xs">
                            {session.isPaid ? "Paid" : "Unpaid"}
                          </Badge>
                        </div>

                        {session.notes && <p className="text-sm mt-2">{session.notes}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8" onClick={() => togglePaidStatus(session.id)}>
                        {session.isPaid ? "Mark Unpaid" : "Mark Paid"}
                      </Button>

                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSession(session.id)}>
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Student Summary</CardTitle>
          <CardDescription>Overview of tutoring by student</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(studentSummary).length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No tutoring data available yet.</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(studentSummary).map(([student, data]) => (
                <div key={student} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h3 className="font-medium">{student}</h3>
                    <div className="text-sm text-muted-foreground">{Array.from(data.subjects).join(", ")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{data.hours.toFixed(1)} hours</div>
                    <div className="text-sm text-muted-foreground">
                      ${data.earnings.toFixed(2)} • {data.sessions} sessions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
