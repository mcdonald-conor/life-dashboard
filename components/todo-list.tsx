"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash, Plus, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useTasks, Task } from "@/contexts/task-context"

export default function TodoList({ limit, area = "all" }: { limit?: number; area?: string }) {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks()
  const [newTodoText, setNewTodoText] = useState("")
  const [newTodoPriority, setNewTodoPriority] = useState<"low" | "medium" | "high">("medium")
  const [newTodoDueDate, setNewTodoDueDate] = useState<Date | null>(null)
  const [newTodoArea, setNewTodoArea] = useState(area !== "all" ? area : "personal")

  const handleAddTodo = () => {
    if (newTodoText.trim() === "") return

    addTask({
      text: newTodoText,
      completed: false,
      dueDate: newTodoDueDate,
      priority: newTodoPriority,
      area: newTodoArea as "personal" | "university" | "tutoring",
    })

    setNewTodoText("")
    setNewTodoPriority("medium")
    setNewTodoDueDate(null)
  }

  // Filter todos by area if specified
  const filteredTodos = area === "all" ? tasks : tasks.filter((todo) => todo.area === area)

  // Sort todos by priority and completion status
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // Completed items go to the bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  // Limit the number of todos if specified
  const displayedTodos = limit ? sortedTodos.slice(0, limit) : sortedTodos

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add a new task..."
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddTodo()
            }
          }}
          className="flex-1"
        />

        <Select value={newTodoPriority} onValueChange={(value: "low" | "medium" | "high") => setNewTodoPriority(value)}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        {area === "all" && (
          <Select value={newTodoArea} onValueChange={setNewTodoArea}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="university">University</SelectItem>
              <SelectItem value="tutoring">Tutoring</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Calendar className="h-4 w-4" />
              <span className="sr-only">Set due date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"
              selected={newTodoDueDate || undefined}
              onSelect={(date) => setNewTodoDueDate(date || null)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button onClick={handleAddTodo}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {displayedTodos.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No tasks yet. Add one above!</div>
      ) : (
        <ul className="space-y-2">
          {displayedTodos.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                todo.completed ? "bg-muted/50" : ""
              } ${!todo.completed && todo.priority === "high" ? "border-destructive/20" : ""}`}
            >
              <div className="flex items-center gap-3">
                <Checkbox checked={todo.completed} onCheckedChange={() => toggleTask(todo.id)} id={`todo-${todo.id}`} />
                <div>
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}
                  >
                    {todo.text}
                  </label>

                  <div className="flex gap-2 mt-1">
                    {todo.dueDate && (
                      <div className="text-xs text-muted-foreground">Due: {format(todo.dueDate, "MMM d, yyyy")}</div>
                    )}

                    {area === "all" && todo.area && (
                      <div className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {todo.area}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    todo.priority === "high"
                      ? "bg-destructive/10 text-destructive"
                      : todo.priority === "medium"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500"
                        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500"
                  }`}
                >
                  {todo.priority}
                </span>
                <Button variant="ghost" size="icon" onClick={() => deleteTask(todo.id)}>
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {limit && filteredTodos.length > limit && (
        <div className="text-center text-sm text-muted-foreground">
          {filteredTodos.length - limit} more tasks not shown
        </div>
      )}
    </div>
  )
}
