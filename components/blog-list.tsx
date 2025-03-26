"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, Eye, Trash2, Plus, Search, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { getAllBlogs, deleteBlog, initializeLocalStorage, getAllCategories } from "@/lib/blog-storage"
import { formatDate } from "@/lib/utils"
import type { BlogPost, Category } from "@/lib/types"

export function BlogList() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof BlogPost>("updatedAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch blogs and categories from local storage
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Initialize local storage with sample data if needed
        await initializeLocalStorage()

        // Get all blogs and categories
        const [allBlogs, allCategories] = await Promise.all([getAllBlogs(), getAllCategories()])

        setBlogs(allBlogs)
        setCategories(allCategories)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: "Error",
          description: "Failed to load blog posts",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Get category name from ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : "Unknown"
  }

  // Handle blog deletion
  const handleDeleteBlog = async () => {
    if (!blogToDelete) return

    try {
      await deleteBlog(blogToDelete)
      setBlogs(blogs.filter((blog) => blog.id !== blogToDelete))
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete blog:", error)
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      })
    } finally {
      setBlogToDelete(null)
    }
  }

  // Filter and sort blogs
  const filteredAndSortedBlogs = blogs
    .filter(
      (blog) =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.categories.some((categoryId) => {
          const categoryName = getCategoryName(categoryId)
          return categoryName.toLowerCase().includes(searchTerm.toLowerCase())
        }),
    )
    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
      }

      return 0
    })

  // Toggle sort direction
  const toggleSort = (field: keyof BlogPost) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search posts..."
            className="w-full sm:w-[300px] pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredAndSortedBlogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-muted-foreground">No blog posts found</p>
              <Button asChild>
                <Link href="/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first post
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile view - Cards */}
              <div className="grid gap-4 p-4 md:hidden">
                {filteredAndSortedBlogs.map((blog) => (
                  <Card key={blog.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <h3 className="font-medium">{blog.title}</h3>

                        <div className="mt-2 flex flex-wrap gap-1">
                          {blog.categories.length > 0 ? (
                            blog.categories.map((categoryId, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                              >
                                {getCategoryName(categoryId)}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">No categories</span>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm">
                          <div className="text-muted-foreground">Updated: {formatDate(blog.updatedAt)}</div>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              blog.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {blog.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 border-t bg-muted/20 p-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/preview/${blog.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/edit/${blog.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setBlogToDelete(blog.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop view - Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">
                        <Button variant="ghost" onClick={() => toggleSort("title")} className="flex items-center">
                          Title
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Categories</TableHead>
                      <TableHead>
                        <Button variant="ghost" onClick={() => toggleSort("updatedAt")} className="flex items-center">
                          Last Updated
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedBlogs.map((blog) => (
                      <TableRow key={blog.id}>
                        <TableCell className="font-medium">{blog.title}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {blog.categories.length > 0 ? (
                              blog.categories.map((categoryId, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                                >
                                  {getCategoryName(categoryId)}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs">No categories</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(blog.updatedAt)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              blog.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {blog.published ? "Published" : "Draft"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="icon" asChild>
                              <Link href={`/preview/${blog.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Preview</span>
                              </Link>
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                              <Link href={`/edit/${blog.id}`}>
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => setBlogToDelete(blog.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!blogToDelete} onOpenChange={(open) => !open && setBlogToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBlog}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

