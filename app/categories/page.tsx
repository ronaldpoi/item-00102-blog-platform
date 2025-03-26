import { DashboardLayout } from "@/components/dashboard-layout"
import { CategoryManager } from "@/components/category-manager"

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Organize your blog posts with categories</p>
        </div>
        <CategoryManager />
      </div>
    </DashboardLayout>
  )
}

