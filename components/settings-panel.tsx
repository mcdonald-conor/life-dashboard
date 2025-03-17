"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Settings {
  notificationsEnabled: boolean
  waterReminderInterval: number
  darkMode: boolean
  username: string
  // New settings
  currency: string
  currencySymbol: string
  location: string
  useMetricSystem: boolean
  volumeUnit: "ml" | "fl oz"
  weightUnit: "kg" | "lb"
  temperatureUnit: "celsius" | "fahrenheit"
  timeFormat: "12h" | "24h"
  firstDayOfWeek: "sunday" | "monday"
}

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
]

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<Settings>({
    notificationsEnabled: true,
    waterReminderInterval: 60,
    darkMode: false,
    username: "",
    currency: "USD",
    currencySymbol: "$",
    location: "",
    useMetricSystem: true,
    volumeUnit: "ml",
    weightUnit: "kg",
    temperatureUnit: "celsius",
    timeFormat: "24h",
    firstDayOfWeek: "monday",
  })
  const { toast } = useToast()

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("dashboard-settings")
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...parsedSettings,
        }))
      } catch (e) {
        console.error("Failed to parse settings", e)
      }
    }
  }, [])

  // Apply dark mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [settings.darkMode])

  const saveSettings = () => {
    localStorage.setItem("dashboard-settings", JSON.stringify(settings))
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    })
    onClose()
  }

  const updateCurrency = (currencyCode: string) => {
    const currency = CURRENCIES.find((c) => c.code === currencyCode)
    if (currency) {
      setSettings({
        ...settings,
        currency: currency.code,
        currencySymbol: currency.symbol,
      })
    }
  }

  const toggleMetricSystem = (useMetric: boolean) => {
    setSettings({
      ...settings,
      useMetricSystem: useMetric,
      volumeUnit: useMetric ? "ml" : "fl oz",
      weightUnit: useMetric ? "kg" : "lb",
      temperatureUnit: useMetric ? "celsius" : "fahrenheit",
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your dashboard preferences</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">User Information</h3>

              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={settings.username}
                  onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  placeholder="Enter your location"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Units & Format</h3>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="metricSystem">Metric System</Label>
                  <p className="text-sm text-muted-foreground">Use metric units (kg, ml, °C)</p>
                </div>
                <Switch
                  id="metricSystem"
                  checked={settings.useMetricSystem}
                  onCheckedChange={toggleMetricSystem}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="volumeUnit">Volume Unit</Label>
                <Select
                  value={settings.volumeUnit}
                  onValueChange={(value: "ml" | "fl oz") => setSettings({ ...settings, volumeUnit: value })}
                >
                  <SelectTrigger id="volumeUnit">
                    <SelectValue placeholder="Select volume unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ml">Milliliters (ml)</SelectItem>
                    <SelectItem value="fl oz">Fluid Ounces (fl oz)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="weightUnit">Weight Unit</Label>
                <Select
                  value={settings.weightUnit}
                  onValueChange={(value: "kg" | "lb") => setSettings({ ...settings, weightUnit: value })}
                >
                  <SelectTrigger id="weightUnit">
                    <SelectValue placeholder="Select weight unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lb">Pounds (lb)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select
                  value={settings.timeFormat}
                  onValueChange={(value: "12h" | "24h") => setSettings({ ...settings, timeFormat: value })}
                >
                  <SelectTrigger id="timeFormat">
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="firstDayOfWeek">First Day of Week</Label>
                <Select
                  value={settings.firstDayOfWeek}
                  onValueChange={(value: "sunday" | "monday") => setSettings({ ...settings, firstDayOfWeek: value })}
                >
                  <SelectTrigger id="firstDayOfWeek">
                    <SelectValue placeholder="Select first day of week" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
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
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={saveSettings}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}
