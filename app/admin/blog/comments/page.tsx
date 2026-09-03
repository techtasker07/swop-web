"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Check, X, Trash2, Search, Filter } from "lucide-react"

interface BlogComment {
  id: string
  post_id: string
  user_id: string
  user_name: string
  content: string
  is_active: boolean
  created_at: string
  post_title?: string
}

export default function CommentModerationPage() {
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "spam">("all")
  const [error, setError] = useState("")
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/blog/comments")
      if (!res.ok) throw new Error("Failed to fetch comments")
      const { data } = await res.json()
      setComments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading comments")
    } finally {
      setLoading(false)
    }
  }

  const filteredComments = comments.filter(comment => {
    const matchesSearch = 
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.post_title?.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterStatus === "pending") return matchesSearch && !comment.is_active
    if (filterStatus === "approved") return matchesSearch && comment.is_active
    
    return matchesSearch
  })

  const handleApprove = async (commentId: string) => {
    try {
      const res = await fetch(`/api/admin/blog/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true })
      })
      if (!res.ok) throw new Error("Failed to approve comment")
      setComments(comments.map(c => c.id === commentId ? { ...c, is_active: true } : c))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error approving comment")
    }
  }

  const handleReject = async (commentId: string) => {
    try {
      const res = await fetch(`/api/admin/blog/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: false })
      })
      if (!res.ok) throw new Error("Failed to reject comment")
      setComments(comments.map(c => c.id === commentId ? { ...c, is_active: false } : c))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error rejecting comment")
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      const res = await fetch(`/api/admin/blog/comments/${commentId}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Failed to delete comment")
      setComments(comments.filter(c => c.id !== commentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting comment")
    }
  }

  const handleBulkApprove = async () => {
    if (selectedComments.size === 0) return

    try {
      for (const commentId of selectedComments) {
        await fetch(`/api/admin/blog/comments/${commentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: true })
        })
      }
      setComments(comments.map(c => selectedComments.has(c.id) ? { ...c, is_active: true } : c))
      setSelectedComments(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error approving comments")
    }
  }

  const handleToggleComment = (commentId: string) => {
    const newSelected = new Set(selectedComments)
    if (newSelected.has(commentId)) {
      newSelected.delete(commentId)
    } else {
      newSelected.add(commentId)
    }
    setSelectedComments(newSelected)
  }

  const pendingCount = comments.filter(c => !c.is_active).length
  const approvedCount = comments.filter(c => c.is_active).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/admin/blog" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">💬 Comment Moderation</h1>
          </div>
          <p className="text-gray-600 text-sm">Review and moderate blog comments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{comments.length}</p>
            <p className="text-sm text-gray-600">Total Comments</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-gray-600">Pending Review</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search comments by author, content, or post..."
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
              <option value="all">All Comments</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
            </select>

            {selectedComments.size > 0 && (
              <button
                onClick={handleBulkApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Approve ({selectedComments.size})
              </button>
            )}
          </div>
        </div>

        {/* Comments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-gray-600 mt-2">Loading comments...</p>
          </div>
        ) : filteredComments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No comments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedComments.has(comment.id)}
                    onChange={() => handleToggleComment(comment.id)}
                    className="w-4 h-4 mt-1"
                  />

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{comment.user_name}</span>
                        {!comment.is_active && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Pending
                          </span>
                        )}
                        {comment.is_active && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Approved
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="mb-3">
                      <Link
                        href={`/blog/${comment.post_title?.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        On: {comment.post_title}
                      </Link>
                    </div>

                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      {comment.content}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!comment.is_active && (
                        <button
                          onClick={() => handleApprove(comment.id)}
                          className="inline-flex items-center gap-1 bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          <Check size={16} />
                          Approve
                        </button>
                      )}

                      {comment.is_active && (
                        <button
                          onClick={() => handleReject(comment.id)}
                          className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          <X size={16} />
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="inline-flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
