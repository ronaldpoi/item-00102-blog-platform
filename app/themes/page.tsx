import { DashboardLayout } from "@/components/dashboard-layout"
import { ThemeManager } from "@/components/theme-manager"

export default function ThemesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Themes</h1>
          <p className="text-muted-foreground">Customize the appearance of your blog</p>
        </div>
        <ThemeManager />
      </div>
    </DashboardLayout>
  )
}

