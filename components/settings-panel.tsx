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
  const [activeTab, setActiveTab] = useState("general")

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("dashboard-settings")
    if (savedSettings) {
      try {
        setSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }))
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
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="localization">Localization</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="localization" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location & Currency</h3>

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={settings.currency} onValueChange={updateCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol}) - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Units</h3>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="metricSystem">Use Metric System</Label>
                  <p className="text-sm text-muted-foreground">Toggle between metric and imperial units</p>
                </div>
                <Switch id="metricSystem" checked={settings.useMetricSystem} onCheckedChange={toggleMetricSystem} />
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
                <Label htmlFor="temperatureUnit">Temperature Unit</Label>
                <Select
                  value={settings.temperatureUnit}
                  onValueChange={(value: "celsius" | "fahrenheit") =>
                    setSettings({ ...settings, temperatureUnit: value })
                  }
                >
                  <SelectTrigger id="temperatureUnit">
                    <SelectValue placeholder="Select temperature unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celsius">Celsius (°C)</SelectItem>
                    <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Date & Time</h3>

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
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
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

          <TabsContent value="data" className="space-y-6">
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

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const data = Object.entries(localStorage).reduce(
                      (acc, [key, value]) => {
                        acc[key] = JSON.parse(value)
                        return acc
                      },
                      {} as Record<string, any>,
                    )

                    const dataStr = JSON.stringify(data, null, 2)
                    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

                    const link = document.createElement("a")
                    link.href = dataUri
                    link.download = `life-dashboard-backup-${new Date().toISOString().split("T")[0]}.json`
                    link.click()
                  }}
                >
                  Export Data
                </Button>
                <p className="text-xs text-muted-foreground">Download a backup of all your dashboard data.</p>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.createElement("input")
                    input.type = "file"
                    input.accept = ".json"
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          try {
                            const data = JSON.parse(e.target?.result as string)
                            Object.entries(data).forEach(([key, value]) => {
                              localStorage.setItem(key, JSON.stringify(value))
                            })
                            toast({
                              title: "Data imported",
                              description: "Your data has been successfully imported.",
                            })
                            setTimeout(() => window.location.reload(), 1500)
                          } catch (error) {
                            toast({
                              title: "Import failed",
                              description: "There was an error importing your data.",
                              variant: "destructive",
                            })
                          }
                        }
                        reader.readAsText(file)
                      }
                    }
                    input.click()
                  }}
                >
                  Import Data
                </Button>
                <p className="text-xs text-muted-foreground">Restore your dashboard from a backup file.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  )
}

