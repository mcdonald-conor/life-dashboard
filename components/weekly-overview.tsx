"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Plus, Trash2 } from "lucide-react"
import { useTasks, Task } from "@/contexts/task-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ScheduleItem {
  id: string
  title: string
  startTime: Date
  endTime: Date
  area: "personal" | "university" | "tutoring"
}

const SECTION_COLORS = {
  personal: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  university: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
  tutoring: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
}

const CALENDAR_HIGHLIGHTS = {
  personal: "bg-blue-50/5 dark:bg-blue-900/5 hover:bg-blue-50/10 dark:hover:bg-blue-900/10",
  university: "bg-green-50/5 dark:bg-green-900/5 hover:bg-green-50/10 dark:hover:bg-green-900/10",
  tutoring: "bg-purple-50/5 dark:bg-purple-900/5 hover:bg-purple-50/10 dark:hover:bg-purple-900/10",
}

const PRIORITY_COLORS = {
  low: "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  high: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400",
}

const AREA_COLORS = {
  personal: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  university: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
  tutoring: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
}

export default function WeeklyOverview() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const { tasks, toggleTask, addTask } = useTasks()
  const [newTask, setNewTask] = useState<{
    text: string
    area: "personal" | "university" | "tutoring"
    priority: "low" | "medium" | "high"
    dueDate: Date | null
  }>({
    text: "",
    area: "personal",
    priority: "medium",
    dueDate: null,
  })
  const [isAddingTask, setIsAddingTask] = useState(false)

  // Load schedule from localStorage
  useEffect(() => {
    const savedSchedule = localStorage.getItem("schedule")
    if (savedSchedule) {
      try {
        const parsedSchedule = JSON.parse(savedSchedule, (key, value) => {
          if (key === "startTime" || key === "endTime") {
            return new Date(value)
          }
          return value
        })
        setSchedule(parsedSchedule)
      } catch (e) {
        console.error("Failed to parse schedule", e)
      }
    }
  }, [])

  // Save schedule to localStorage
  useEffect(() => {
    localStorage.setItem("schedule", JSON.stringify(schedule))
  }, [schedule])

  const getDayItems = (date: Date) => {
    const dayTasks = tasks.filter(task =>
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    )
    const daySchedule = schedule.filter(item =>
      isSameDay(new Date(item.startTime), date)
    )
    return [...dayTasks, ...daySchedule]
  }

  const getDayHighlight = (items: (Task | ScheduleItem)[]) => {
    if (items.length === 0) return ""
    const areas = items.map(item => item.area)
    if (areas.includes("personal")) return CALENDAR_HIGHLIGHTS.personal
    if (areas.includes("university")) return CALENDAR_HIGHLIGHTS.university
    if (areas.includes("tutoring")) return CALENDAR_HIGHLIGHTS.tutoring
    return ""
  }

  const handleAddTask = () => {
    if (!newTask.text.trim()) return

    addTask({
      text: newTask.text,
      area: newTask.area,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      completed: false,
    })

    setNewTask({
      text: "",
      area: "personal",
      priority: "medium",
      dueDate: null,
    })
    setIsAddingTask(false)
  }

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId)
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Tasks Column - now 2 columns wide */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>View and manage all your tasks across sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add Task Form */}
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Add a new task..."
                value={newTask.text}
                onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                className="flex-1 min-w-[200px]"
              />
              <Select
                value={newTask.priority}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, priority: value as "low" | "medium" | "high" })
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newTask.area}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, area: value as "personal" | "university" | "tutoring" })
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                  <SelectItem value="tutoring">Tutoring</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={newTask.dueDate || undefined}
                    onSelect={(date) => setNewTask({ ...newTask, dueDate: date || null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={handleAddTask} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 group"
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div className="flex-1 flex items-center gap-2">
                    <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                      {task.text}
                    </span>
                    {task.dueDate && (
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(task.dueDate), "MMM d")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${AREA_COLORS[task.area]}`}>
                      {task.area}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {!tasks.length && (
              <div className="text-center py-6 text-muted-foreground">
                No tasks yet. Add one to get started!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Column - now 3 columns wide */}
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>
              {format(currentMonth, "MMMM yyyy")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={currentMonth}
            onSelect={(date) => date && setCurrentMonth(date)}
            month={currentMonth}
            showOutsideDays
            fixedWeeks
            components={{
              Day: ({ date, ...props }) => {
                const items = getDayItems(date)
                const highlight = getDayHighlight(items)

                return (
                  <div
                    className={cn(
                      "h-[120px] p-2 relative rounded-lg border transition-colors",
                      !isSameMonth(date, currentMonth) && "bg-muted/50",
                      isToday(date) && "bg-accent ring-2 ring-accent",
                      highlight,
                      "hover:bg-accent/5"
                    )}
                  >
                    <time
                      dateTime={format(date, "yyyy-MM-dd")}
                      className={cn(
                        "absolute top-2 left-2 text-sm",
                        !isSameMonth(date, currentMonth) && "text-muted-foreground"
                      )}
                    >
                      {format(date, "d")}
                    </time>
                    <div className="mt-6 space-y-1">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "text-xs truncate px-1 py-0.5 rounded",
                            AREA_COLORS[item.area]
                          )}
                        >
                          {'text' in item ? item.text : item.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              },
            }}
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4 w-full",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: cn(
                "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
              ),
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "grid grid-cols-7 gap-1",
              head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] h-9 text-center",
              row: "grid grid-cols-7 gap-1 mt-1",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
              day: "h-full w-full p-0 font-normal",
              day_range_end: "day-range-end",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
