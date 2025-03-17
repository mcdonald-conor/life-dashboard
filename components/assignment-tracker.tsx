"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format, differenceInDays, isBefore, addDays } from "date-fns"
import { Progress } from "@/components/ui/progress"
import { FileText, Clock, Trash, CalendarClock, Plus, CheckCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Assignment {
  id: string
  title: string
  course: string
  dueDate: string // ISO date string
  description: string
  progress: number // 0-100
  status: "not-started" | "in-progress" | "completed"
  importance: "low" | "medium" | "high"
}

export default function AssignmentTracker() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const { toast } = useToast()

  // New assignment form state
  const [newAssignment, setNewAssignment] = useState<Omit<Assignment, "id">>({
    title: "",
    course: "",
    dueDate: addDays(new Date(), 7).toISOString(),
    description: "",
    progress: 0,
    status: "not-started",
    importance: "medium",
  })

  // Load assignments from localStorage
  useEffect(() => {
    const savedAssignments = localStorage.getItem("assignments")
    if (savedAssignments) {
      try {
        setAssignments(JSON.parse(savedAssignments))
      } catch (e) {
        console.error("Failed to parse assignments", e)
      }
    }
  }, [])

  // Save assignments to localStorage
  useEffect(() => {
    localStorage.setItem("assignments", JSON.stringify(assignments))
  }, [assignments])

  const addAssignment = () => {
    if (newAssignment.title.trim() === "" || newAssignment.course.trim() === "") {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const assignment: Assignment = {
      ...newAssignment,
      id: Date.now().toString(),
    }

    setAssignments([...assignments, assignment])
    setDialogOpen(false)

    // Reset form
    setNewAssignment({
      title: "",
      course: "",
      dueDate: addDays(new Date(), 7).toISOString(),
      description: "",
      progress: 0,
      status: "not-started",
      importance: "medium",
    })

    toast({
      title: "Assignment added",
      description: `${assignment.title} due on ${format(new Date(assignment.dueDate), "MMM d, yyyy")}`,
    })
  }

  const updateProgress = (id: string, progress: number) => {
    setAssignments(
      assignments.map((assignment) => {
        if (assignment.id === id) {
          // Automatically update status based on progress
          let status = assignment.status
          if (progress === 0) status = "not-started"
          else if (progress === 100) status = "completed"
          else status = "in-progress"

          return { ...assignment, progress, status }
        }
        return assignment
      }),
    )
  }

  const updateStatus = (id: string, status: "not-started" | "in-progress" | "completed") => {
    setAssignments(
      assignments.map((assignment) => {
        if (assignment.id === id) {
          // Automatically update progress based on status
          let progress = assignment.progress
          if (status === "not-started") progress = 0
          else if (status === "completed") progress = 100

          return { ...assignment, status, progress }
        }
        return assignment
      }),
    )
  }

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter((assignment) => assignment.id !== id))
    toast({
      title: "Assignment deleted",
      description: "Assignment has been removed",
    })
  }

  // Calculate assignment stats
  const totalAssignments = assignments.length
  const completedAssignments = assignments.filter((a) => a.status === "completed").length
  const overdueAssignments = assignments.filter(
    (a) => a.status !== "completed" && isBefore(new Date(a.dueDate), new Date()),
  ).length

  // Sort assignments by due date and status
  const sortedAssignments = [...assignments].sort((a, b) => {
    // Completed assignments go to the end
    if (a.status === "completed" && b.status !== "completed") return 1
    if (a.status !== "completed" && b.status === "completed") return -1

    // Sort by due date (earlier first)
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Assignment Tracker</CardTitle>
          <CardDescription>
            Track your academic assignments and deadlines
            {totalAssignments > 0 && (
              <>
                {" "}
                • {completedAssignments}/{totalAssignments} completed
              </>
            )}
            {overdueAssignments > 0 && (
              <>
                {" "}
                • <span className="text-red-500">{overdueAssignments} overdue</span>
              </>
            )}
          </CardDescription>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Assignment</DialogTitle>
              <DialogDescription>Create a new assignment to track your progress</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Assignment Title*</Label>
                <Input
                  id="title"
                  placeholder="Anatomy Lab Report"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="course">Course*</Label>
                <Input
                  id="course"
                  placeholder="Human Anatomy 101"
                  value={newAssignment.course}
                  onChange={(e) => setNewAssignment({ ...newAssignment, course: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={format(new Date(newAssignment.dueDate), "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) =>
                    setNewAssignment({
                      ...newAssignment,
                      dueDate: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="importance">Importance</Label>
                <Select
                  value={newAssignment.importance}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setNewAssignment({ ...newAssignment, importance: value })
                  }
                >
                  <SelectTrigger id="importance">
                    <SelectValue placeholder="Select importance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Details about the assignment"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addAssignment}>Add Assignment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {sortedAssignments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            You don't have any assignments yet. Click the button above to add one!
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAssignments.map((assignment) => {
              const dueDate = new Date(assignment.dueDate)
              const isOverdue = isBefore(dueDate, new Date()) && assignment.status !== "completed"
              const daysUntilDue = differenceInDays(dueDate, new Date())

              const importanceColors = {
                low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
              }

              const statusIcons = {
                "not-started": <Clock className="h-4 w-4 text-muted-foreground" />,
                "in-progress": <FileText className="h-4 w-4 text-blue-500" />,
                completed: <CheckCheck className="h-4 w-4 text-green-500" />,
              }

              return (
                <Card key={assignment.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{assignment.title}</h3>
                        <div className="text-sm text-muted-foreground">{assignment.course}</div>
                      </div>

                      <div className="flex gap-2">
                        <div className={`text-xs px-2 py-1 rounded-full ${importanceColors[assignment.importance]}`}>
                          {assignment.importance}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deleteAssignment(assignment.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {statusIcons[assignment.status]}
                          <span>
                            {assignment.status === "not-started" && "Not started"}
                            {assignment.status === "in-progress" && "In progress"}
                            {assignment.status === "completed" && "Completed"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4" />
                          <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                            {isOverdue
                              ? `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? "s" : ""} overdue`
                              : assignment.status === "completed"
                                ? "Completed"
                                : daysUntilDue === 0
                                  ? "Due today"
                                  : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Progress value={assignment.progress} className="h-2" />
                        <span className="text-sm font-medium w-12 text-right">{assignment.progress}%</span>
                      </div>
                    </div>

                    {assignment.description && <div className="text-sm mt-2">{assignment.description}</div>}

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Select
                        value={assignment.status}
                        onValueChange={(value: "not-started" | "in-progress" | "completed") =>
                          updateStatus(assignment.id, value)
                        }
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-started">Not started</SelectItem>
                          <SelectItem value="in-progress">In progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={assignment.progress.toString()}
                        onValueChange={(value) => updateProgress(assignment.id, Number.parseInt(value))}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue placeholder="Update progress" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0% Complete</SelectItem>
                          <SelectItem value="25">25% Complete</SelectItem>
                          <SelectItem value="50">50% Complete</SelectItem>
                          <SelectItem value="75">75% Complete</SelectItem>
                          <SelectItem value="100">100% Complete</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

