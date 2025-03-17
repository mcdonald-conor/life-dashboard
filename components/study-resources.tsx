"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Book, LinkIcon, ExternalLink, BookOpen, FileText, Video, FileQuestion, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Resource {
  id: string
  title: string
  type: "textbook" | "article" | "video" | "notes" | "flashcards" | "quiz" | "link" | "other"
  url?: string
  course?: string
  description?: string
  favorite: boolean
  tags?: string[]
}

export default function StudyResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string>("all_courses")
  const { toast } = useToast()

  // New resource form state
  const [newResource, setNewResource] = useState<Omit<Resource, "id">>({
    title: "",
    type: "textbook",
    url: "",
    course: "",
    description: "",
    favorite: false,
    tags: [],
  })

  // Tag input state
  const [tagInput, setTagInput] = useState("")

  // Load resources from localStorage
  useEffect(() => {
    const savedResources = localStorage.getItem("study-resources")
    if (savedResources) {
      try {
        setResources(JSON.parse(savedResources))
      } catch (e) {
        console.error("Failed to parse study resources", e)
      }
    }
  }, [])

  // Save resources to localStorage
  useEffect(() => {
    localStorage.setItem("study-resources", JSON.stringify(resources))
  }, [resources])

  const addResource = () => {
    if (newResource.title.trim() === "") {
      toast({
        title: "Missing title",
        description: "Please enter a title for your resource",
        variant: "destructive",
      })
      return
    }

    // Validate URL for certain types
    if (
      ["textbook", "article", "video", "link"].includes(newResource.type) &&
      (!newResource.url || !newResource.url.trim())
    ) {
      toast({
        title: "Missing URL",
        description: `Please enter a URL for the ${newResource.type}`,
        variant: "destructive",
      })
      return
    }

    const resource: Resource = {
      ...newResource,
      id: Date.now().toString(),
    }

    setResources([...resources, resource])
    setDialogOpen(false)

    // Reset form
    setNewResource({
      title: "",
      type: "textbook",
      url: "",
      course: "",
      description: "",
      favorite: false,
      tags: [],
    })

    toast({
      title: "Resource added",
      description: `${resource.title} has been added to your resources`,
    })
  }

  const deleteResource = (id: string) => {
    setResources(resources.filter((resource) => resource.id !== id))
    toast({
      title: "Resource deleted",
      description: "The resource has been removed",
    })
  }

  const toggleFavorite = (id: string) => {
    setResources(
      resources.map((resource) => {
        if (resource.id === id) {
          return { ...resource, favorite: !resource.favorite }
        }
        return resource
      }),
    )
  }

  const addTag = () => {
    if (!tagInput.trim()) return

    if (!newResource.tags) {
      setNewResource({ ...newResource, tags: [tagInput.trim()] })
    } else if (!newResource.tags.includes(tagInput.trim())) {
      setNewResource({ ...newResource, tags: [...newResource.tags, tagInput.trim()] })
    }

    setTagInput("")
  }

  const removeTag = (tag: string) => {
    if (!newResource.tags) return

    setNewResource({
      ...newResource,
      tags: newResource.tags.filter((t) => t !== tag),
    })
  }

  // Get all unique courses
  const uniqueCourses = Array.from(new Set(resources.map((r) => r.course).filter(Boolean))) as string[]

  // Filter resources based on search and course filter
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      !searchQuery ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCourse = selectedCourse === "all_courses" || resource.course === selectedCourse

    return matchesSearch && matchesCourse
  })

  // Sort resources with favorites at the top
  const sortedResources = [...filteredResources].sort((a, b) => {
    if (a.favorite !== b.favorite) {
      return a.favorite ? -1 : 1
    }
    return 0
  })

  // Resource type icons
  const resourceIcons = {
    textbook: <Book className="h-5 w-5" />,
    article: <FileText className="h-5 w-5" />,
    video: <Video className="h-5 w-5" />,
    notes: <BookOpen className="h-5 w-5" />,
    flashcards: <FileQuestion className="h-5 w-5" />,
    quiz: <FileQuestion className="h-5 w-5" />,
    link: <LinkIcon className="h-5 w-5" />,
    other: <LinkIcon className="h-5 w-5" />,
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Study Resources</CardTitle>
          <CardDescription>
            Organize your study materials and references
            {resources.length > 0 && ` • ${resources.length} resources`}
          </CardDescription>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Study Resource</DialogTitle>
              <DialogDescription>Add a new study resource to your collection</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title*</Label>
                <Input
                  id="title"
                  placeholder="Gray's Anatomy Textbook"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Resource Type</Label>
                <Select
                  value={newResource.type}
                  onValueChange={(value: Resource["type"]) => setNewResource({ ...newResource, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="textbook">Textbook</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="flashcards">Flashcards</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="url">
                  URL {["textbook", "article", "video", "link"].includes(newResource.type) ? "*" : "(Optional)"}
                </Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={newResource.url || ""}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="course">Course (Optional)</Label>
                <Input
                  id="course"
                  placeholder="Human Anatomy 101"
                  value={newResource.course || ""}
                  onChange={(e) => setNewResource({ ...newResource, course: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the resource"
                  value={newResource.description || ""}
                  onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label>Tags (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    Add
                  </Button>
                </div>

                {newResource.tags && newResource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newResource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs flex items-center"
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-primary">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addResource}>Add Resource</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />

          <Select
            value={selectedCourse}
            onValueChange={(value) => setSelectedCourse(value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_courses">All courses</SelectItem>
              {uniqueCourses.map((course) => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {sortedResources.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            {resources.length === 0
              ? "You haven't added any study resources yet. Click the button above to get started!"
              : "No resources match your search. Try adjusting your filters."}
          </div>
        ) : (
          <div className="grid gap-3">
            {sortedResources.map((resource) => (
              <Card key={resource.id} className="p-4">
                <div className="flex justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${resource.favorite ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500" : "bg-primary/10"}`}
                    >
                      {resourceIcons[resource.type]}
                    </div>
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {resource.title}
                        {resource.favorite && <span className="text-amber-500">★</span>}
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        {resource.course && ` • ${resource.course}`}
                      </div>

                      {resource.description && <p className="text-sm mt-1">{resource.description}</p>}

                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resource.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    {resource.url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">Open link</span>
                        </a>
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                          >
                            <path
                              d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                              fill="currentColor"
                              fillRule="evenodd"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleFavorite(resource.id)}>
                          {resource.favorite ? "Remove from favorites" : "Add to favorites"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteResource(resource.id)} className="text-red-600">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
