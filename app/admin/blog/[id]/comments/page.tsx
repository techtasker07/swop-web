"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, X, Trash2 } from "lucide-react"

interface BlogComment {
  id: string
  post_id: string
  user_id: string
  user_name: string
  content: string
  is_active: boolean
  created_at: string
}

interface BlogPost {
  id: string
  title: string
  slug: string
}

export default function PostCommentsPage() {
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchData()
  }, [postId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch post
      const postRes = await fetch(`/api/admin/blog/${postId}`)
      if (postRes.ok) {
        const { data } = await postRes.json()
        setPost(data)
      }

      // Fetch comments for this post
      const commentsRes = await fetch(`/api/admin/blog/${postId}/comments`)
      if (commentsRes.ok) {
        const { data } = await commentsRes.json()
        setComments(data || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading data")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (commentId: string) => {
    try {
      const res = await fetch(`/api/admin/blog/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true })
      })
      if (!res.ok) throw new Error("Failed to approve")
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
      if (!res.ok) throw new Error("Failed to reject")
      setComments(comments.map(c => c.id === commentId ? { ...c, is_active: false } : c))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error rejecting comment")
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return

    try {
      const res = await fetch(`/api/admin/blog/comments/${commentId}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Failed to delete")
      setComments(comments.filter(c => c.id !== commentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting comment")
    }
  }

  const pendingCount = comments.filter(c => !c.is_active).length
  const approvedCount = comments.filter(c => c.is_active).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link href="/admin/blog/comments" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Comments: {post?.title || "Loading..."}</h1>
              <p className="text-gray-600 text-sm mt-1">Moderate comments for this post</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
        </div>

        {/* Comments */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="text-gray-600 mt-2">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No comments yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${
                  comment.is_active ? "border-l-green-500" : "border-l-yellow-500"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
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

                <p className="text-gray-700 text-sm mb-3 leading-relaxed">{comment.content}</p>

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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
