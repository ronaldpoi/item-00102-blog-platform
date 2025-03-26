import { DashboardLayout } from "@/components/dashboard-layout"
import { BlogList } from "@/components/blog-list"

export default function Home() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Your Posts</h1>
          <p className="text-muted-foreground">Create, manage, and publish your blog posts</p>
        </div>
        <BlogList />
      </div>
    </DashboardLayout>
  )
}

