"use client"

import { FormEvent, useState } from "react"
import { Heart, Share2, MessageCircle, Send } from "lucide-react"

type Comment = { id: string; user_name: string; content: string; created_at: string }

export function EnhancedBlogPostInteractions({
  slug,
  title,
  initialLikes,
  initialShares,
  initialComments,
}: {
  slug: string
  title: string
  initialLikes: number
  initialShares: number
  initialComments: Comment[]
}) {
  const [likes, setLikes] = useState(initialLikes)
  const [shares, setShares] = useState(initialShares)
  const [comments, setComments] = useState(initialComments)
  const [hasLiked, setHasLiked] = useState(false)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  async function interact(type: "like" | "share" | "comment", values: Record<string, string> = {}) {
    setBusy(true)
    setMessage("")
    try {
      const response = await fetch(`/api/blog/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...values }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to complete that action")
      if (type === "like") {
        setLikes((value) => value + 1)
        setHasLiked(true)
      }
      if (type === "share") {
        setShares((value) => value + 1)
        if (navigator.share) {
          await navigator.share({
            title: title,
            url: typeof window !== "undefined" ? window.location.href : "",
          }).catch(() => undefined)
        }
      }
      if (type === "comment") {
        setComments((value) => [result.data, ...value])
        setName("")
        setContent("")
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to complete that action")
    } finally {
      setBusy(false)
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || !content.trim()) {
      setMessage("Enter your name and a comment.")
      return
    }
    void interact("comment", { user_name: name.trim(), content: content.trim() })
  }

  return (
    <section className="space-y-4 py-4 border-t border-gray-200">
      {/* Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <button
          disabled={busy || hasLiked}
          onClick={() => void interact("like")}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs md:text-sm font-medium transition-all duration-300 ${
            hasLiked
              ? "bg-[#32cd32]/20 text-[#32cd32] border border-[#32cd32]/50"
              : "bg-white border border-gray-200 hover:border-[#32cd32]/50 hover:bg-[#32cd32]/5 text-[#073232]"
          }`}
        >
          <Heart className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`} />
          <span>{likes}</span>
        </button>

        <button
          disabled={busy}
          onClick={() => void interact("share")}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs md:text-sm font-medium bg-white border border-gray-200 hover:border-[#32cd32]/50 hover:bg-[#32cd32]/5 transition-all duration-300 text-[#073232]"
        >
          <Share2 className="w-4 h-4" />
          <span>{shares}</span>
        </button>

        <button
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs md:text-sm font-medium bg-white border border-gray-200 hover:border-[#32cd32]/50 hover:bg-[#32cd32]/5 transition-all duration-300 text-[#073232] col-span-2 md:col-span-1"
          onClick={() => document.getElementById("comment-form")?.scrollIntoView({ behavior: "smooth" })}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comments Section */}
      <div className="space-y-3 mt-4">
        <div className="flex items-center gap-1.5">
          <MessageCircle className="w-4 h-4 text-[#32cd32]" />
          <h3 className="text-sm md:text-base font-bold text-[#073232]">Comments</h3>
          <span className="bg-[#32cd32]/10 text-[#073232] px-2 py-0.5 rounded text-xs font-medium border border-[#32cd32]/30">
            {comments.length}
          </span>
        </div>

        {/* Comments List */}
        <div className="space-y-2">
          {comments.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded border border-gray-200">
              <MessageCircle className="w-6 h-6 text-gray-300 mx-auto mb-1.5" />
              <p className="text-xs md:text-sm text-gray-600 font-medium">Be the first to comment.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <article
                key={comment.id}
                className="bg-white border border-gray-200 rounded p-2.5 md:p-3 hover:border-[#32cd32]/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <div>
                    <strong className="text-[#073232] text-xs md:text-sm font-semibold block">{comment.user_name}</strong>
                    <time className="text-xs text-gray-600">
                      {new Date(comment.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </article>
            ))
          )}
        </div>

        {/* Comment Form */}
        <form id="comment-form" onSubmit={submit} className="space-y-2 bg-gray-50 border border-gray-200 rounded p-3 md:p-4 mt-3">
          <h3 className="font-semibold text-[#073232] text-xs md:text-sm flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#32cd32]" />
            Add a Comment
          </h3>

          <div>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="w-full px-2.5 py-1.5 rounded text-xs md:text-sm border border-gray-200 bg-white text-[#073232] placeholder:text-gray-500 focus:outline-none focus:border-[#32cd32] focus:ring-1 focus:ring-[#32cd32]/20 transition-all"
              maxLength={80}
            />
          </div>

          <div>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-2.5 py-1.5 rounded text-xs md:text-sm border border-gray-200 bg-white text-[#073232] placeholder:text-gray-500 focus:outline-none focus:border-[#32cd32] focus:ring-1 focus:ring-[#32cd32]/20 transition-all resize-none"
              rows={3}
              maxLength={2000}
            />
            <p className="text-xs text-gray-600 mt-1">{content.length}/2000</p>
          </div>

          <div className="flex gap-2">
            <button
              disabled={busy}
              type="submit"
              className="flex-1 bg-[#32cd32] hover:bg-[#28a428] text-white font-semibold py-1.5 md:py-2 px-3 rounded text-xs md:text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {busy ? (
                <>
                  <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Post</span>
                </>
              )}
            </button>
          </div>

          {message && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {message}
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
