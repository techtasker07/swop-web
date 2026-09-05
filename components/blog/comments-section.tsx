"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Copy, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Comment {
  id: string
  user_name: string
  content: string
  created_at: string
}

interface CommentsSectionProps {
  postId: string
  initialComments: Comment[]
  sharePostId: string
  initialShares: number
  isCompact?: boolean
}

export function CommentsSection({ postId, initialComments, sharePostId, initialShares, isCompact = false }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState("")
  const [shares, setShares] = useState(initialShares)
  const [copyFeedback, setCopyFeedback] = useState(false)

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("blog_comments")
        .insert([
          {
            post_id: postId,
            content: newComment,
            user_name: userName || "Anonymous",
            is_active: true,
          },
        ])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setComments([data[0], ...comments].slice(0, 2))
      }
      setNewComment("")
      setUserName("")
    } catch (error) {
      console.error("Error adding comment:", error)
      alert("Failed to post comment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async (platform: string = "copy") => {
    const supabase = createClient()
    try {
      const url = `${window.location.origin}/blog/${sharePostId}`

      if (platform === "copy") {
        await navigator.clipboard.writeText(url)
        setCopyFeedback(true)
        setTimeout(() => setCopyFeedback(false), 2000)
      }

      await supabase.from("blog_shares").insert([{ post_id: sharePostId, platform }])
      setShares(shares + 1)
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  return (
    <div className={isCompact ? "space-y-3" : "mt-12 pt-8 border-t border-slate-200"}>
      {isCompact && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Comments</h3>
          <button
            onClick={() => handleShare("copy")}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {copyFeedback ? (
              <>
                <Check className="w-3 h-3" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      )}

      {!isCompact && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Comments & Discussions</h3>
          <button
            onClick={() => handleShare("copy")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {copyFeedback ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium">Share</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Add Comment Form */}
      <Card className={`border border-slate-200 shadow-sm rounded-lg overflow-hidden mb-4 bg-white ${isCompact ? "border-0 shadow-none" : ""}`}>
        <CardContent className={isCompact ? "p-3 space-y-2" : "p-6 space-y-4"}>
          <form onSubmit={handleAddComment} className="space-y-2">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className={`w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isCompact ? "text-xs" : "text-sm"}`}
            />
            <textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={2000}
              rows={isCompact ? 2 : 3}
              className={`w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${isCompact ? "text-xs" : "text-sm"}`}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{newComment.length} / 2000</span>
              <Button
                type="submit"
                disabled={loading || !newComment.trim()}
                size={isCompact ? "sm" : "default"}
                className={`bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-full disabled:opacity-50 ${isCompact ? "px-3 py-1 text-xs" : "py-2 px-6"}`}
              >
                {loading ? "Posting..." : "Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Display Comments */}
      <div className={isCompact ? "space-y-2" : "space-y-4"}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id} className={`border border-slate-200 shadow-sm rounded-lg bg-white ${isCompact ? "border-0 shadow-none" : ""}`}>
              <CardContent className={isCompact ? "p-2 space-y-1" : "p-5 space-y-2"}>
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className={`font-semibold text-slate-900 ${isCompact ? "text-xs" : "text-sm"}`}>{comment.user_name}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(comment.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <p className={`text-slate-700 leading-relaxed ${isCompact ? "text-xs" : "text-sm"}`}>{comment.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className={`text-center bg-slate-50 rounded-lg border border-slate-200 ${isCompact ? "py-3" : "py-8"}`}>
            <MessageSquare className={`text-slate-400 mx-auto mb-1 ${isCompact ? "w-4 h-4" : "w-8 h-8"}`} />
            <p className={`text-slate-600 ${isCompact ? "text-xs" : "text-sm"}`}>No comments yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  )
}
