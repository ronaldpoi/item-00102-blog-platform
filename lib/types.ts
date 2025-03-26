// Blog post type definition
export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  coverImage?: string
  categories: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
  publishedAt: string // Added publishedAt field
  published: boolean
}

// Category type definition
export interface Category {
  id: string
  name: string
  description: string
  createdAt: string
}

// Theme type definition
export interface Theme {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  textColor: string
  backgroundColor: string
  fontFamily: string
  createdAt: string
  isActive: boolean
}

// Editor content type
export interface EditorContent {
  title: string
  content: string
  excerpt: string
  coverImage?: string
  categories: string[]
  tags: string[]
  publishedAt: string // Added publishedAt field
}

