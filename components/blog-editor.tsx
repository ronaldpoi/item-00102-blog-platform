"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  ImageIcon,
  LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Save,
  Eye,
  FileCheck,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { getAllCategories, saveBlog } from "@/lib/blog-storage"
import { generateId } from "@/lib/utils"
import type { BlogPost, Category } from "@/lib/types"
import { format } from "date-fns"

interface BlogEditorProps {
  blogPost?: BlogPost
}

export function BlogEditor({ blogPost }: BlogEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState(blogPost?.title || "")
  const [content, setContent] = useState(blogPost?.content || "")
  const [excerpt, setExcerpt] = useState(blogPost?.excerpt || "")
  const [coverImage, setCoverImage] = useState(blogPost?.coverImage || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(blogPost?.categories || [])
  const [tags, setTags] = useState<string[]>(blogPost?.tags || [])
  const [tagInput, setTagInput] = useState("")
  const [publishDate, setPublishDate] = useState<Date>(
    blogPost?.publishedAt ? new Date(blogPost.publishedAt) : new Date(),
  )
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("write")

  // Fetch categories from local storage
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allCategories = await getAllCategories()
        setCategories(allCategories)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        })
      }
    }

    fetchCategories()
  }, [toast])

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
  }

  // Handle text formatting
  const handleFormatText = (format: string) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    let formattedText = ""
    let cursorPosition = 0

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        cursorPosition = 2
        break
      case "italic":
        formattedText = `*${selectedText}*`
        cursorPosition = 1
        break
      case "h1":
        formattedText = `# ${selectedText}`
        cursorPosition = 2
        break
      case "h2":
        formattedText = `## ${selectedText}`
        cursorPosition = 3
        break
      case "h3":
        formattedText = `### ${selectedText}`
        cursorPosition = 4
        break
      case "ul":
        formattedText = `- ${selectedText}`
        cursorPosition = 2
        break
      case "ol":
        formattedText = `1. ${selectedText}`
        cursorPosition = 3
        break
      case "link":
        formattedText = `[${selectedText}](url)`
        cursorPosition = selectedText.length + 3
        break
      case "image":
        formattedText = `![${selectedText}](url)`
        cursorPosition = selectedText.length + 4
        break
      default:
        return
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end)
    setContent(newContent)

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus()
      if (selectedText) {
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
      } else {
        textarea.setSelectionRange(start + cursorPosition, start + cursorPosition)
      }
    }, 0)
  }

  // Handle save blog post
  const handleSaveBlog = async (publish = false) => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your blog post",
        variant: "destructive",
      })
      return
    }

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter content for your blog post",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const now = new Date().toISOString()
      const blogData: BlogPost = {
        id: blogPost?.id || generateId("blog-"),
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.substring(0, 150).trim() + "...",
        coverImage: coverImage.trim(),
        categories: selectedCategories,
        tags,
        createdAt: blogPost?.createdAt || now,
        updatedAt: now,
        publishedAt: publishDate.toISOString(),
        published: publish,
      }

      await saveBlog(blogData)

      toast({
        title: "Success",
        description: publish ? "Blog post published successfully" : "Blog post saved as draft",
      })

      // Redirect to the blog list page
      router.push("/")
    } catch (error) {
      console.error("Failed to save blog:", error)
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle preview
  const handlePreview = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title and content for your blog post",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const now = new Date().toISOString()
      const blogData: BlogPost = {
        id: blogPost?.id || generateId("blog-"),
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.substring(0, 150).trim() + "...",
        coverImage: coverImage.trim(),
        categories: selectedCategories,
        tags,
        createdAt: blogPost?.createdAt || now,
        updatedAt: now,
        publishedAt: publishDate.toISOString(),
        published: false,
      }

      await saveBlog(blogData)

      // Redirect to the preview page
      router.push(`/preview/${blogData.id}`)
    } catch (error) {
      console.error("Failed to save blog for preview:", error)
      toast({
        title: "Error",
        description: "Failed to preview blog post",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Blog Post Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter blog post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="coverImage">Cover Image URL (optional)</Label>
              <Input
                id="coverImage"
                placeholder="Enter image URL"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="publishDate">Publication Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="publishDate" variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(publishDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={publishDate}
                    onSelect={(date) => date && setPublishDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Tags</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
                    {tag}
                    <button
                      type="button"
                      className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="excerpt">Excerpt (optional)</Label>
              <Textarea
                id="excerpt"
                placeholder="Enter a short excerpt for your blog post"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="space-y-4">
                <div className="flex flex-wrap gap-2 border-b pb-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleFormatText("bold")}>
                    <Bold className="h-4 w-4" />
                    <span className="sr-only">Bold</span>
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleFormatText("italic")}>
                    <Italic className="h-4 w-4" />
                    <span className="sr-only">Italic</span>
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleFormatText("h1")}>
                    <Heading1 className="h-4 w-4" />
                    <span className="sr-only">Heading 1</span>
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleFormatText("h2")}>
                    <Heading2 className="h-4 w-4" />
                    <span className="sr-only">Heading 2</span>
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleFormatText("h3")}>
                    <Heading3 className="h-4 w-4" />
                    <span className="sr-only">Heading 3</span>
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleFormatText("ul")}>
                    <List className="h-4 w-4" />
                    <span className="sr-only">Bullet List</span>
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleFormatText("ol")}>
                    <ListOrdered className="h-4 w-4" />
                    <span className="sr-only">Numbered List</span>
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleFormatText("link")}>
                    <LinkIcon className="h-4 w-4" />
                    <span className="sr-only">Link</span>
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleFormatText("image")}>
                    <ImageIcon className="h-4 w-4" />
                    <span className="sr-only">Image</span>
                  </Button>
                </div>
                <Textarea
                  id="content"
                  placeholder="Write your blog post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="font-mono"
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="border rounded-md p-4 min-h-[400px] prose max-w-none">
                  <h1>{title || "Untitled Post"}</h1>
                  {coverImage && (
                    <img
                      src={coverImage || "/placeholder.svg"}
                      alt={title}
                      className="w-full h-auto max-h-[300px] object-cover rounded-md my-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=300&width=800"
                      }}
                    />
                  )}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: content
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\*(.*?)\*/g, "<em>$1</em>")
                        .replace(/# (.*?)(?:\n|$)/g, "<h1>$1</h1>")
                        .replace(/## (.*?)(?:\n|$)/g, "<h2>$1</h2>")
                        .replace(/### (.*?)(?:\n|$)/g, "<h3>$1</h3>")
                        .replace(/- (.*?)(?:\n|$)/g, "<li>$1</li>")
                        .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                        .replace(/!\[(.*?)\]$$(.*?)$$/g, '<img src="$2" alt="$1" class="max-w-full h-auto" />')
                        .replace(/\n/g, "<br />"),
                    }}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/")} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handlePreview} disabled={isSaving}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSaveBlog(false)} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={() => handleSaveBlog(true)} disabled={isSaving}>
              <FileCheck className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

