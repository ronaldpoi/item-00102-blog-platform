import type { BlogPost, Category, Theme } from "./types"

// Local storage keys
const BLOGS_STORAGE_KEY = "blog-manager-posts"
const CATEGORIES_STORAGE_KEY = "blog-manager-categories"
const THEMES_STORAGE_KEY = "blog-manager-themes"
const ACTIVE_THEME_KEY = "blog-manager-active-theme"

// Helper function to safely access localStorage (only on client)
const getLocalStorage = () => {
  if (typeof window !== "undefined") {
    return window.localStorage
  }
  return null
}

// Blog post storage functions
export async function getAllBlogs(): Promise<BlogPost[]> {
  const localStorage = getLocalStorage()
  if (!localStorage) return []

  try {
    const blogs = localStorage.getItem(BLOGS_STORAGE_KEY)
    return blogs ? JSON.parse(blogs) : []
  } catch (error) {
    console.error("Error getting blogs from localStorage:", error)
    return []
  }
}

export async function getBlogById(id: string): Promise<BlogPost | null> {
  const blogs = await getAllBlogs()
  return blogs.find((blog) => blog.id === id) || null
}

export async function saveBlog(blog: BlogPost): Promise<void> {
  const localStorage = getLocalStorage()
  if (!localStorage) return

  try {
    const blogs = await getAllBlogs()
    const existingBlogIndex = blogs.findIndex((b) => b.id === blog.id)

    // Ensure publishedAt field exists
    if (!blog.publishedAt) {
      blog.publishedAt = blog.createdAt
    }

    if (existingBlogIndex >= 0) {
      // Update existing blog
      blogs[existingBlogIndex] = blog
    } else {
      // Add new blog
      blogs.push(blog)
    }

    localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(blogs))
  } catch (error) {
    console.error("Error saving blog to localStorage:", error)
    throw new Error("Failed to save blog")
  }
}

export async function deleteBlog(id: string): Promise<void> {
  const localStorage = getLocalStorage()
  if (!localStorage) return

  try {
    const blogs = await getAllBlogs()
    const updatedBlogs = blogs.filter((blog) => blog.id !== id)
    localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(updatedBlogs))
  } catch (error) {
    console.error("Error deleting blog from localStorage:", error)
    throw new Error("Failed to delete blog")
  }
}

// Category storage functions
export async function getAllCategories(): Promise<Category[]> {
  const localStorage = getLocalStorage()
  if (!localStorage) return []

  try {
    const categories = localStorage.getItem(CATEGORIES_STORAGE_KEY)
    return categories ? JSON.parse(categories) : []
  } catch (error) {
    console.error("Error getting categories from localStorage:", error)
    return []
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await getAllCategories()
  return categories.find((category) => category.id === id) || null
}

export async function saveCategory(category: Category): Promise<void> {
  const localStorage = getLocalStorage()
  if (!localStorage) return

  try {
    const categories = await getAllCategories()
    const existingCategoryIndex = categories.findIndex((c) => c.id === category.id)

    if (existingCategoryIndex >= 0) {
      // Update existing category
      categories[existingCategoryIndex] = category
    } else {
      // Add new category
      categories.push(category)
    }

    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories))
  } catch (error) {
    console.error("Error saving category to localStorage:", error)
    throw new Error("Failed to save category")
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const localStorage = getLocalStorage()
  if (!localStorage) return

  try {
    const categories = await getAllCategories()
    const updatedCategories = categories.filter((category) => category.id !== id)
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories))

    // Also update blog posts that use this category
    const blogs = await getAllBlogs()
    const updatedBlogs = blogs.map((blog) => {
      if (blog.categories.includes(id)) {
        return {
          ...blog,
          categories: blog.categories.filter((categoryId) => categoryId !== id),
        }
      }
      return blog
    })

    localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(updatedBlogs))
  } catch (error) {
    console.error("Error deleting category from localStorage:", error)
    throw new Error("Failed to delete category")
  }
}

// Theme storage functions
export async function getAllThemes(): Promise<Theme[]> {
  const localStorage = getLocalStorage()
  if (!localStorage) return []

  try {
    const themes = localStorage.getItem(THEMES_STORAGE_KEY)
    if (!themes) {
      // Initialize with default themes if none exist
      const defaultThemes = getDefaultThemes()
      localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(defaultThemes))
      return defaultThemes
    }
    return JSON.parse(themes)
  } catch (error) {
    console.error("Error getting themes from localStorage:", error)
    return []
  }
}

export async function getThemeById(id: string): Promise<Theme | null> {
  const themes = await getAllThemes()
  return themes.find((theme) => theme.id === id) || null
}

export async function getUserTheme(): Promise<Theme | null> {
  const localStorage = getLocalStorage()
  if (!localStorage) return null

  try {
    // First check if there's an active theme ID stored
    const activeThemeId = localStorage.getItem(ACTIVE_THEME_KEY)
    if (activeThemeId) {
      const theme = await getThemeById(activeThemeId)
      if (theme) return theme
    }

    // If no active theme ID or theme not found, look for active theme in themes list
    const themes = await getAllThemes()
    const activeTheme = themes.find((theme) => theme.isActive)

    // If no active theme found, use the first theme
    return activeTheme || themes[0] || null
  } catch (error) {
    console.error("Error getting user theme:", error)
    return null
  }
}

export async function saveTheme(theme: Theme): Promise<void> {
  const localStorage = getLocalStorage()
  if (!localStorage) return

  try {
    const themes = await getAllThemes()

    // If this theme is being set as active, deactivate all others and store active theme ID
    if (theme.isActive) {
      themes.forEach((t) => {
        if (t.id !== theme.id) {
          t.isActive = false
        }
      })

      // Store active theme ID separately for quicker access
      localStorage.setItem(ACTIVE_THEME_KEY, theme.id)
    }

    const existingThemeIndex = themes.findIndex((t) => t.id === theme.id)

    if (existingThemeIndex >= 0) {
      // Update existing theme
      themes[existingThemeIndex] = theme
    } else {
      // Add new theme
      themes.push(theme)
    }

    localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(themes))
  } catch (error) {
    console.error("Error saving theme to localStorage:", error)
    throw new Error("Failed to save theme")
  }
}

export async function deleteTheme(id: string): Promise<void> {
  const localStorage = getLocalStorage()
  if (!localStorage) return

  try {
    const themes = await getAllThemes()
    const themeToDelete = themes.find((theme) => theme.id === id)

    // Don't allow deleting the active theme
    if (themeToDelete?.isActive) {
      throw new Error("Cannot delete the active theme")
    }

    const updatedThemes = themes.filter((theme) => theme.id !== id)

    // Ensure there's always at least one theme
    if (updatedThemes.length === 0) {
      const defaultThemes = getDefaultThemes()
      localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(defaultThemes))
    } else {
      localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(updatedThemes))
    }

    // If the active theme ID is the one being deleted, remove it
    const activeThemeId = localStorage.getItem(ACTIVE_THEME_KEY)
    if (activeThemeId === id) {
      localStorage.removeItem(ACTIVE_THEME_KEY)
    }
  } catch (error) {
    console.error("Error deleting theme from localStorage:", error)
    throw new Error("Failed to delete theme")
  }
}

// Helper function to generate default themes
function getDefaultThemes(): Theme[] {
  return [
    {
      id: "default-light",
      name: "Default Light",
      primaryColor: "#0f766e", // teal-700
      secondaryColor: "#14b8a6", // teal-500
      textColor: "#1e293b", // slate-800
      backgroundColor: "#ffffff", // white
      fontFamily: "Inter, sans-serif",
      createdAt: new Date().toISOString(),
      isActive: true,
    },
    {
      id: "default-dark",
      name: "Default Dark",
      primaryColor: "#14b8a6", // teal-500
      secondaryColor: "#2dd4bf", // teal-400
      textColor: "#f1f5f9", // slate-100
      backgroundColor: "#1e293b", // slate-800
      fontFamily: "Inter, sans-serif",
      createdAt: new Date().toISOString(),
      isActive: false,
    },
    {
      id: "elegant",
      name: "Elegant",
      primaryColor: "#7c3aed", // violet-600
      secondaryColor: "#a78bfa", // violet-400
      textColor: "#1e293b", // slate-800
      backgroundColor: "#f8fafc", // slate-50
      fontFamily: "Georgia, serif",
      createdAt: new Date().toISOString(),
      isActive: false,
    },
  ]
}

// Initialize local storage with sample data (for development)
export async function initializeLocalStorage(): Promise<void> {
  const localStorage = getLocalStorage()
  if (!localStorage) return

  // Check if data already exists
  const blogs = localStorage.getItem(BLOGS_STORAGE_KEY)
  const categories = localStorage.getItem(CATEGORIES_STORAGE_KEY)
  const themes = localStorage.getItem(THEMES_STORAGE_KEY)

  // Only initialize if data doesn't exist
  if (!blogs) {
    localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify([]))
  }

  if (!categories) {
    const sampleCategories: Category[] = [
      {
        id: "cat-1",
        name: "Technology",
        description: "Posts about technology and software development",
        createdAt: new Date().toISOString(),
      },
      {
        id: "cat-2",
        name: "Lifestyle",
        description: "Posts about lifestyle and personal experiences",
        createdAt: new Date().toISOString(),
      },
      {
        id: "cat-3",
        name: "Travel",
        description: "Posts about travel and adventures",
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(sampleCategories))
  }

  if (!themes) {
    const defaultThemes = getDefaultThemes()
    localStorage.setItem(THEMES_STORAGE_KEY, JSON.stringify(defaultThemes))
    // Also set the active theme ID
    localStorage.setItem(ACTIVE_THEME_KEY, defaultThemes[0].id)
  }
}

