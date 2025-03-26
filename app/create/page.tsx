import { DashboardLayout } from "@/components/dashboard-layout"
import { BlogEditor } from "@/components/blog-editor"

export default function CreateBlogPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
          <p className="text-muted-foreground">Write and publish a new blog post</p>
        </div>
        <BlogEditor />
      </div>
    </DashboardLayout>
  )
}

