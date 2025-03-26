"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileEdit, FolderOpen, Palette, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Navigation items
  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Create Post",
      href: "/create",
      icon: <FileEdit className="h-5 w-5" />,
    },
    {
      title: "Categories",
      href: "/categories",
      icon: <FolderOpen className="h-5 w-5" />,
    },
    {
      title: "Themes",
      href: "/themes",
      icon: <Palette className="h-5 w-5" />,
    },
  ]

  // Handle client-side rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Mobile Navigation */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 max-w-sm p-0">
            <SheetHeader className="p-4 text-left">
              <SheetTitle>Blog Manager</SheetTitle>
              <SheetDescription>Navigate through your blog management options</SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col gap-6 p-4 pt-0">
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {item.icon}
                      {item.title}
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileEdit className="h-6 w-6" />
          <span>Blog Manager</span>
        </Link>
      </header>

      {/* Desktop Navigation */}
      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r bg-background lg:flex">
          <div className="flex h-16 items-center gap-2 border-b px-6 font-semibold">
            <FileEdit className="h-6 w-6" />
            <span>Blog Manager</span>
          </div>
          <nav className="flex flex-col gap-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex flex-1 flex-col p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}

