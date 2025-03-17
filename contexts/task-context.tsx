"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface Task {
  id: string
  text: string
  completed: boolean
  dueDate: Date | null
  priority: "low" | "medium" | "high"
  area: "personal" | "university" | "tutoring"
}

interface TaskContextType {
  tasks: Task[]
  addTask: (task: Omit<Task, "id">) => void
  toggleTask: (taskId: string) => void
  deleteTask: (taskId: string) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("todos")
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks, (key, value) => {
          if (key === "dueDate" && value) {
            return new Date(value)
          }
          return value
        })
        setTasks(parsedTasks)
      } catch (e) {
        console.error("Failed to parse tasks", e)
      }
    }
  }, [])

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(tasks))
  }, [tasks])

  const addTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
    }
    setTasks([...tasks, newTask])
  }

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    ))
  }

  return (
    <TaskContext.Provider value={{ tasks, addTask, toggleTask, deleteTask, updateTask }}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}
