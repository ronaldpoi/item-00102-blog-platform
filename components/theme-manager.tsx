"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Save, X, Check, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { getAllThemes, saveTheme, deleteTheme } from "@/lib/blog-storage"
import { generateId } from "@/lib/utils"
import type { Theme } from "@/lib/types"

export function ThemeManager() {
  const router = useRouter()
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null)
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [primaryColor, setPrimaryColor] = useState("#0f766e")
  const [secondaryColor, setSecondaryColor] = useState("#14b8a6")
  const [textColor, setTextColor] = useState("#1e293b")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [fontFamily, setFontFamily] = useState("Inter, sans-serif")
  const { toast } = useToast()

  // Fetch themes from local storage
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const allThemes = await getAllThemes()
        setThemes(allThemes)
      } catch (error) {
        console.error("Failed to fetch themes:", error)
        toast({
          title: "Error",
          description: "Failed to load themes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchThemes()
  }, [toast])

  // Reset form
  const resetForm = () => {
    setName("")
    setPrimaryColor("#0f766e")
    setSecondaryColor("#14b8a6")
    setTextColor("#1e293b")
    setBackgroundColor("#ffffff")
    setFontFamily("Inter, sans-serif")
    setIsEditing(false)
    setEditingTheme(null)
  }

  // Handle edit theme
  const handleEditTheme = (theme: Theme) => {
    setIsEditing(true)
    setEditingTheme(theme)
    setName(theme.name)
    setPrimaryColor(theme.primaryColor)
    setSecondaryColor(theme.secondaryColor)
    setTextColor(theme.textColor)
    setBackgroundColor(theme.backgroundColor)
    setFontFamily(theme.fontFamily)
  }

  // Handle save theme
  const handleSaveTheme = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a theme name",
        variant: "destructive",
      })
      return
    }

    try {
      const now = new Date().toISOString()
      const themeData: Theme = {
        id: editingTheme?.id || generateId("theme-"),
        name: name.trim(),
        primaryColor,
        secondaryColor,
        textColor,
        backgroundColor,
        fontFamily,
        createdAt: editingTheme?.createdAt || now,
        isActive: editingTheme?.isActive || false,
      }

      await saveTheme(themeData)

      // Update local state
      if (isEditing) {
        setThemes(themes.map((theme) => (theme.id === themeData.id ? themeData : theme)))
      } else {
        setThemes([...themes, themeData])
      }

      resetForm()
      toast({
        title: "Success",
        description: isEditing ? "Theme updated successfully" : "Theme created successfully",
      })
    } catch (error) {
      console.error("Failed to save theme:", error)
      toast({
        title: "Error",
        description: "Failed to save theme",
        variant: "destructive",
      })
    }
  }

  // Handle delete theme
  const handleDeleteTheme = async () => {
    if (!themeToDelete) return

    try {
      await deleteTheme(themeToDelete)
      setThemes(themes.filter((theme) => theme.id !== themeToDelete))
      toast({
        title: "Success",
        description: "Theme deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete theme:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete theme",
        variant: "destructive",
      })
    } finally {
      setThemeToDelete(null)
    }
  }

  // Handle activate theme
  const handleActivateTheme = async (theme: Theme) => {
    try {
      const updatedTheme = { ...theme, isActive: true }
      await saveTheme(updatedTheme)

      // Update local state
      setThemes(
        themes.map((t) => ({
          ...t,
          isActive: t.id === theme.id,
        })),
      )

      toast({
        title: "Success",
        description: "Theme activated successfully",
      })

      // Force a refresh to apply the theme changes
      router.refresh()

      // Reload the page after a short delay to ensure theme changes are applied
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("Failed to activate theme:", error)
      toast({
        title: "Error",
        description: "Failed to activate theme",
        variant: "destructive",
      })
    }
  }

  // Preview theme
  const getPreviewStyle = () => {
    return {
      backgroundColor,
      color: textColor,
      fontFamily,
      border: "1px dashed #999",
      borderRadius: "0.5rem",
      padding: "1rem",
      marginTop: "1rem",
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Theme" : "Create Theme"}</CardTitle>
          <CardDescription>
            {isEditing ? "Update an existing theme" : "Create a new theme to customize your blog's appearance"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Theme Name</Label>
              <Input id="name" placeholder="Enter theme name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fontFamily">Font Family</Label>
              <Input
                id="fontFamily"
                placeholder="Enter font family"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Preview</Label>
              <div style={getPreviewStyle()}>
                <h1 style={{ color: primaryColor, marginBottom: "0.5rem" }}>This is a heading</h1>
                <p style={{ marginBottom: "1rem" }}>
                  This is a paragraph of text that shows how your theme will look.{" "}
                  <a href="#" style={{ color: secondaryColor, textDecoration: "underline" }}>
                    This is a link
                  </a>{" "}
                  that uses your secondary color.
                </p>
                <button
                  style={{
                    backgroundColor: primaryColor,
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.25rem",
                    border: "none",
                  }}
                >
                  Sample Button
                </button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex">
          {isEditing ? (
            <Button variant="outline" onClick={resetForm}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          ) : (
            <div></div>
          )}
          <Button onClick={handleSaveTheme}>
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? "Update Theme" : "Create Theme"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Themes</CardTitle>
          <CardDescription>Manage your blog themes</CardDescription>
        </CardHeader>
        <CardContent>
          {themes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="mb-4 text-muted-foreground">No themes found</p>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Create your first theme
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile view - Cards */}
              <div className="grid gap-4 md:hidden">
                {themes.map((theme) => (
                  <Card key={theme.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{theme.name}</h3>
                          {theme.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              <Check className="mr-1 h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>

                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">Colors:</p>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: theme.primaryColor }}
                              title="Primary Color"
                            />
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: theme.secondaryColor }}
                              title="Secondary Color"
                            />
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: theme.backgroundColor }}
                              title="Background Color"
                            />
                            <div
                              className="w-6 h-6 rounded-full border flex items-center justify-center text-xs"
                              style={{ backgroundColor: theme.textColor, color: theme.backgroundColor }}
                              title="Text Color"
                            >
                              T
                            </div>
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">Font:</p>
                          <p className="text-sm truncate">{theme.fontFamily}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 border-t bg-muted/20 p-2">
                        {!theme.isActive && (
                          <Button variant="outline" size="sm" onClick={() => handleActivateTheme(theme)}>
                            Activate
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleEditTheme(theme)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        {!theme.isActive && (
                          <Button variant="outline" size="sm" onClick={() => setThemeToDelete(theme.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop view - Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Colors</TableHead>
                      <TableHead>Font</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {themes.map((theme) => (
                      <TableRow key={theme.id}>
                        <TableCell className="font-medium">{theme.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: theme.primaryColor }}
                              title="Primary Color"
                            />
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: theme.secondaryColor }}
                              title="Secondary Color"
                            />
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: theme.backgroundColor }}
                              title="Background Color"
                            />
                            <div
                              className="w-6 h-6 rounded-full border flex items-center justify-center text-xs"
                              style={{ backgroundColor: theme.textColor, color: theme.backgroundColor }}
                              title="Text Color"
                            >
                              T
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{theme.fontFamily}</TableCell>
                        <TableCell>
                          {theme.isActive ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              <Check className="mr-1 h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                              Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!theme.isActive && (
                              <Button variant="outline" size="sm" onClick={() => handleActivateTheme(theme)}>
                                Activate
                              </Button>
                            )}
                            <Button variant="outline" size="icon" onClick={() => handleEditTheme(theme)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            {!theme.isActive && (
                              <Button variant="outline" size="icon" onClick={() => setThemeToDelete(theme.id)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            )}
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
        <CardFooter className="flex">
          <Info className="mr-2 h-6 w-6" />
          <div className="text-sm text-red-500">
            Themes apply only to blog posts, not the Blog Manager
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={!!themeToDelete} onOpenChange={(open) => !open && setThemeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the theme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTheme}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

