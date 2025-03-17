"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash, FileEdit, Save, X, Search, BookOpen } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface StudyTopic {
  id: string
  name: string
  subject: string
  hasNotes: boolean
  hasAnkiCards: boolean
  notes: string
  priority: "low" | "medium" | "high"
}

export default function StudyTopicTracker() {
  const [topics, setTopics] = useState<StudyTopic[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSubject, setFilterSubject] = useState<string | null>(null)
  const [editingTopic, setEditingTopic] = useState<StudyTopic | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  // New topic form state
  const [newTopic, setNewTopic] = useState<Omit<StudyTopic, "id">>({
    name: "",
    subject: "",
    hasNotes: false,
    hasAnkiCards: false,
    notes: "",
    priority: "medium",
  })

  // Load topics from localStorage
  useEffect(() => {
    const savedTopics = localStorage.getItem("study-topics")
    if (savedTopics) {
      try {
        setTopics(JSON.parse(savedTopics))
      } catch (e) {
        console.error("Failed to parse study topics", e)
      }
    }
  }, [])

  // Save topics to localStorage
  useEffect(() => {
    localStorage.setItem("study-topics", JSON.stringify(topics))
  }, [topics])

  const addTopic = () => {
    if (newTopic.name.trim() === "" || newTopic.subject.trim() === "") {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const topic: StudyTopic = {
      ...newTopic,
      id: Date.now().toString(),
    }

    setTopics([...topics, topic])
    setDialogOpen(false)

    // Reset form
    setNewTopic({
      name: "",
      subject: "",
      hasNotes: false,
      hasAnkiCards: false,
      notes: "",
      priority: "medium",
    })

    toast({
      title: "Topic added",
      description: `${topic.name} has been added to your study topics`,
    })
  }

  const deleteTopic = (id: string) => {
    setTopics(topics.filter((topic) => topic.id !== id))
    toast({
      title: "Topic deleted",
      description: "The topic has been removed",
    })
  }

  const updateTopicStatus = (id: string, field: "hasNotes" | "hasAnkiCards", value: boolean) => {
    setTopics(
      topics.map((topic) => {
        if (topic.id === id) {
          return { ...topic, [field]: value }
        }
        return topic
      }),
    )
  }

  const startEditing = (topic: StudyTopic) => {
    setEditingTopic({ ...topic })
    setEditingId(topic.id)
  }

  const saveEditing = () => {
    if (editingTopic && editingId) {
      setTopics(
        topics.map((topic) => {
          if (topic.id === editingId) {
            return editingTopic
          }
          return topic
        }),
      )
      setEditingId(null)
      setEditingTopic(null)

      toast({
        title: "Topic updated",
        description: "Your changes have been saved",
      })
    }
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingTopic(null)
  }

  // Get all unique subjects
  const uniqueSubjects = Array.from(new Set(topics.map((t) => t.subject)))

  // Filter topics based on search and subject filter
  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      !searchQuery ||
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.notes.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSubject = !filterSubject || topic.subject === filterSubject

    return matchesSearch && matchesSubject
  })

  // Sort topics by priority
  const sortedTopics = [...filteredTopics].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  // Calculate progress stats
  const totalTopics = topics.length
  const topicsWithNotes = topics.filter((t) => t.hasNotes).length
  const topicsWithAnki = topics.filter((t) => t.hasAnkiCards).length

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Study Topics Tracker</CardTitle>
            <CardDescription>
              Track your study topics, notes, and Anki cards
              {totalTopics > 0 && (
                <>
                  {" "}
                  • {topicsWithNotes}/{totalTopics} with notes • {topicsWithAnki}/{totalTopics} with Anki cards
                </>
              )}
            </CardDescription>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Study Topic</DialogTitle>
                <DialogDescription>Add a new topic to track for your studies</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Topic Name*</Label>
                  <Input
                    id="name"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                    placeholder="Renal Physiology"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject/Course*</Label>
                  <Input
                    id="subject"
                    value={newTopic.subject}
                    onChange={(e) => setNewTopic({ ...newTopic, subject: e.target.value })}
                    placeholder="Physiology 101"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTopic.priority}
                    onValueChange={(value: "low" | "medium" | "high") => setNewTopic({ ...newTopic, priority: value })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasNotes"
                    checked={newTopic.hasNotes}
                    onCheckedChange={(checked) => setNewTopic({ ...newTopic, hasNotes: checked as boolean })}
                  />
                  <Label htmlFor="hasNotes">I already have notes for this topic</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasAnkiCards"
                    checked={newTopic.hasAnkiCards}
                    onCheckedChange={(checked) => setNewTopic({ ...newTopic, hasAnkiCards: checked as boolean })}
                  />
                  <Label htmlFor="hasAnkiCards">I already have Anki cards for this topic</Label>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={newTopic.notes}
                    onChange={(e) => setNewTopic({ ...newTopic, notes: e.target.value })}
                    placeholder="Any additional notes about this topic"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addTopic}>Add Topic</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select
            value={filterSubject || "all_subjects"}
            onValueChange={(value) => setFilterSubject(value === "all_subjects" ? null : value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_subjects">All subjects</SelectItem>
              {uniqueSubjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {sortedTopics.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {topics.length === 0
              ? "You haven't added any study topics yet. Click the button above to get started!"
              : "No topics match your search. Try adjusting your filters."}
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Topic</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Notes</TableHead>
                  <TableHead className="text-center">Anki Cards</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTopics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            topic.priority === "high"
                              ? "bg-red-500"
                              : topic.priority === "medium"
                                ? "bg-amber-500"
                                : "bg-green-500"
                          }`}
                        />
                        {editingId === topic.id ? (
                          <Input
                            value={editingTopic?.name || ""}
                            onChange={(e) =>
                              setEditingTopic((prev) => (prev ? { ...prev, name: e.target.value } : null))
                            }
                            className="w-full"
                          />
                        ) : (
                          topic.name
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingId === topic.id ? (
                        <Input
                          value={editingTopic?.subject || ""}
                          onChange={(e) =>
                            setEditingTopic((prev) => (prev ? { ...prev, subject: e.target.value } : null))
                          }
                          className="w-full"
                        />
                      ) : (
                        topic.subject
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center">
                        <Checkbox
                          checked={editingId === topic.id ? editingTopic?.hasNotes : topic.hasNotes}
                          onCheckedChange={(checked) => {
                            if (editingId === topic.id && editingTopic) {
                              setEditingTopic({ ...editingTopic, hasNotes: checked as boolean })
                            } else {
                              updateTopicStatus(topic.id, "hasNotes", checked as boolean)
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center">
                        <Checkbox
                          checked={editingId === topic.id ? editingTopic?.hasAnkiCards : topic.hasAnkiCards}
                          onCheckedChange={(checked) => {
                            if (editingId === topic.id && editingTopic) {
                              setEditingTopic({ ...editingTopic, hasAnkiCards: checked as boolean })
                            } else {
                              updateTopicStatus(topic.id, "hasAnkiCards", checked as boolean)
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {editingId === topic.id ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={saveEditing}>
                              <Save className="h-4 w-4" />
                              <span className="sr-only">Save</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={cancelEditing}>
                              <X className="h-4 w-4" />
                              <span className="sr-only">Cancel</span>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => startEditing(topic)}>
                              <FileEdit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteTopic(topic.id)}>
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {sortedTopics.length > 0 && (
          <div className="space-y-4 mt-4">
            <h3 className="text-lg font-medium">Topic Notes</h3>
            {sortedTopics.filter((t) => t.notes).length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No notes added to any topics yet. Click the edit button to add notes.
              </div>
            ) : (
              sortedTopics
                .filter((t) => t.notes)
                .map((topic) => (
                  <div key={`notes-${topic.id}`} className="border rounded-md p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">{topic.name}</h4>
                      <span className="text-sm text-muted-foreground">({topic.subject})</span>
                    </div>
                    {editingId === topic.id ? (
                      <Textarea
                        value={editingTopic?.notes || ""}
                        onChange={(e) => setEditingTopic((prev) => (prev ? { ...prev, notes: e.target.value } : null))}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{topic.notes}</p>
                    )}
                  </div>
                ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

