"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Tag, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllCategories } from "@/lib/blog-storage"
import { formatDate } from "@/lib/utils"
import type { BlogPost, Theme, Category } from "@/lib/types"

interface BlogPreviewProps {
  blogPost: BlogPost
  theme: Theme | null
}

export function BlogPreview({ blogPost, theme }: BlogPreviewProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch categories from local storage
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allCategories = await getAllCategories()
        setCategories(allCategories)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Get category names from IDs
  const getCategoryNames = () => {
    return blogPost.categories.map((categoryId) => {
      const category = categories.find((c) => c.id === categoryId)
      return category ? category.name : "Unknown"
    })
  }

  // Apply theme styles
  const themeStyles = theme
    ? ({
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
        "--primary-color": theme.primaryColor,
        "--secondary-color": theme.secondaryColor,
      } as React.CSSProperties)
    : {}

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button variant="outline" asChild>
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <div className="blog-preview" style={themeStyles}>
          {blogPost.coverImage && (
            <div className="cover-image">
              <img
                src={blogPost.coverImage || "/placeholder.svg"}
                alt={blogPost.title}
                className="w-full h-[300px] object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=300&width=800"
                }}
              />
            </div>
          )}

          <div className="content p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme?.primaryColor }}>
              {blogPost.title}
            </h1>

            <div className="meta flex flex-wrap gap-4 mb-6 text-sm opacity-80">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Published: {formatDate(blogPost.publishedAt || blogPost.createdAt)}</span>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Updated: {formatDate(blogPost.updatedAt)}</span>
              </div>

              {getCategoryNames().length > 0 && (
                <div className="flex items-center gap-1">
                  <Folder className="h-4 w-4" />
                  <span>{getCategoryNames().join(", ")}</span>
                </div>
              )}

              {blogPost.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>{blogPost.tags.join(", ")}</span>
                </div>
              )}
            </div>

            <div
              className="blog-content prose max-w-none"
              style={
                {
                  "--tw-prose-headings": theme?.primaryColor,
                  "--tw-prose-links": theme?.secondaryColor,
                } as React.CSSProperties
              }
              dangerouslySetInnerHTML={{
                __html: blogPost.content
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
        </div>
      </Card>
    </div>
  )
}

