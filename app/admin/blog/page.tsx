"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Edit2, Trash2, Eye, EyeOff, Lock, Unlock, Search } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image?: string
  is_published: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft" | "active" | "inactive">("all")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/blog")
      if (!res.ok) throw new Error("Failed to fetch posts")
      const { data } = await res.json()
      setPosts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading posts")
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.slug.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filterStatus === "published") return matchesSearch && post.is_published
    if (filterStatus === "draft") return matchesSearch && !post.is_published
    if (filterStatus === "active") return matchesSearch && post.is_active
    if (filterStatus === "inactive") return matchesSearch && !post.is_active
    
    return matchesSearch
  })

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return
    
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete post")
      setPosts(posts.filter(p => p.id !== postId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting post")
    }
  }

  const handleTogglePublish = async (postId: string, isPublished: boolean) => {
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !isPublished })
      })
      if (!res.ok) throw new Error("Failed to update post")
      setPosts(posts.map(p => p.id === postId ? { ...p, is_published: !isPublished } : p))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating post")
    }
  }

  const handleToggleActive = async (postId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive })
      })
      if (!res.ok) throw new Error("Failed to update post")
      setPosts(posts.map(p => p.id === postId ? { ...p, is_active: !isActive } : p))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating post")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📝 Blog CMS</h1>
              <p className="text-gray-600 text-sm mt-1">Manage and publish blog posts</p>
            </div>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
            >
              <Plus size={18} />
              New Post
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by title or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-gray-600 mt-2">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 mb-4">No posts found</p>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Plus size={18} />
              Create First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{post.title}</h3>
                      <div className="flex gap-1">
                        {post.is_published && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Published</span>
                        )}
                        {!post.is_published && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Draft</span>
                        )}
                        {post.is_active && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>
                        )}
                        {!post.is_active && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Inactive</span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">/{post.slug}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt || post.content.substring(0, 100)}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Created {new Date(post.created_at).toLocaleDateString()} • 
                      Updated {new Date(post.updated_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      <Edit2 size={16} />
                      Edit
                    </Link>

                    <button
                      onClick={() => handleTogglePublish(post.id, post.is_published)}
                      className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${
                        post.is_published
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {post.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    <button
                      onClick={() => handleToggleActive(post.id, post.is_active)}
                      className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${
                        post.is_active
                          ? "bg-green-50 text-green-600 hover:bg-green-100"
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {post.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>

                    <button
                      onClick={() => handleDelete(post.id)}
                      className="inline-flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
            <p className="text-sm text-gray-600">Total Posts</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{posts.filter(p => p.is_published).length}</p>
            <p className="text-sm text-gray-600">Published</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-gray-600">{posts.filter(p => !p.is_published).length}</p>
            <p className="text-sm text-gray-600">Drafts</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{posts.filter(p => p.is_active).length}</p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
        </div>
      </div>
    </div>
  )
}
