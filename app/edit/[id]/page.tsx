"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { BlogEditor } from "@/components/blog-editor"
import { getBlogById } from "@/lib/blog-storage"
import type { BlogPost } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditBlogPage({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch the blog post from local storage
    const fetchBlog = async () => {
      try {
        const blogPost = await getBlogById(params.id)
        setBlog(blogPost)
      } catch (error) {
        console.error("Failed to fetch blog post:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [params.id])

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
          <p className="text-muted-foreground">Make changes to your blog post</p>
        </div>
        <BlogEditor blogPost={blog} />
      </div>
    </DashboardLayout>
  )
}

