"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Settings {
  notificationsEnabled: boolean
  waterReminderInterval: number
  darkMode: boolean
  username: string
}

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<Settings>({
    notificationsEnabled: true,
    waterReminderInterval: 60,
    darkMode: false,
    username: "",
  })
  const { toast } = useToast()

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("dashboard-settings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error("Failed to parse settings", e)
      }
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("dashboard-settings", JSON.stringify(settings))
  }, [settings])

  // Apply dark mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [settings.darkMode])

  const handleSave = () => {
    localStorage.setItem("dashboard-settings", JSON.stringify(settings))

    // Request notification permission if enabled
    if (settings.notificationsEnabled && Notification.permission !== "granted") {
      Notification.requestPermission()
    }

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    })

    onClose()
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Customize your dashboard experience</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">User Profile</h3>

          <div className="grid gap-2">
            <Label htmlFor="username">Display Name</Label>
            <Input
              id="username"
              value={settings.username}
              onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              placeholder="Your name"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notifications</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive alerts for reminders and tasks</p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="waterInterval">Water Reminder Interval (minutes)</Label>
            <Input
              id="waterInterval"
              type="number"
              min="15"
              max="240"
              value={settings.waterReminderInterval}
              onChange={(e) =>
                setSettings({ ...settings, waterReminderInterval: Number.parseInt(e.target.value) || 60 })
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Appearance</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Use dark theme for the dashboard</p>
            </div>
            <Switch
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Data Management</h3>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                  localStorage.clear()
                  window.location.reload()
                }
              }}
            >
              Clear All Data
            </Button>
            <p className="text-xs text-muted-foreground">
              This will remove all your tasks, events, reminders, and settings.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

