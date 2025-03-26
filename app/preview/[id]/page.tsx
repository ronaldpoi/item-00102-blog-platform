"use client"

import { useEffect, useState, use } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { BlogPreview } from "@/components/blog-preview"
import { getBlogById, getUserTheme } from "@/lib/blog-storage"
import type { BlogPost, Theme } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function PreviewBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [theme, setTheme] = useState<Theme | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch the blog post and user theme from local storage
    const fetchData = async () => {
      try {
        const [blogPost, userTheme] = await Promise.all([getBlogById(resolvedParams.id), getUserTheme()])
        setBlog(blogPost)
        setTheme(userTheme)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (!blog) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Blog Not Found</h1>
            <p className="text-muted-foreground">The blog post you are looking for does not exist.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Preview Blog Post</h1>
          <p className="text-muted-foreground">See how your blog post will look when published</p>
        </div>
        <BlogPreview blogPost={blog} theme={theme} />
      </div>
    </DashboardLayout>
  )
}

