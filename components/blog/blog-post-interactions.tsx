"use client"

import { FormEvent, useState } from "react"

type Comment = { id: string; user_name: string; content: string; created_at: string }

export function BlogPostInteractions({ slug, initialLikes, initialShares, initialComments }: { slug: string; initialLikes: number; initialShares: number; initialComments: Comment[] }) {
  const [likes, setLikes] = useState(initialLikes)
  const [shares, setShares] = useState(initialShares)
  const [comments, setComments] = useState(initialComments)
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState(false)

  async function interact(type: "like" | "share" | "comment", values: Record<string, string> = {}) {
    setBusy(true); setMessage("")
    try {
      const response = await fetch(`/api/blog/${encodeURIComponent(slug)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, ...values }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Unable to complete that action")
      if (type === "like") setLikes((value) => value + 1)
      if (type === "share") { setShares((value) => value + 1); if (navigator.share) await navigator.share({ title: document.title, url: window.location.href }).catch(() => undefined) }
      if (type === "comment") { setComments((value) => [result.data, ...value]); setName(""); setContent("") }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to complete that action") }
    finally { setBusy(false) }
  }

  function submit(event: FormEvent) { event.preventDefault(); if (!name.trim() || !content.trim()) { setMessage("Enter your name and a comment."); return } void interact("comment", { user_name: name.trim(), content: content.trim() }) }

  return <section className="mt-10 border-t pt-6"><div className="flex gap-3"><button disabled={busy} onClick={() => void interact("like")} className="rounded-md border px-4 py-2 hover:bg-gray-50">Like <span className="font-semibold">{likes}</span></button><button disabled={busy} onClick={() => void interact("share")} className="rounded-md border px-4 py-2 hover:bg-gray-50">Share <span className="font-semibold">{shares}</span></button></div><h2 className="mt-8 text-xl font-semibold">Comments ({comments.length})</h2><div className="mt-4 space-y-3">{comments.map((comment) => <article key={comment.id} className="rounded-lg bg-gray-50 p-4"><div className="flex justify-between gap-3"><strong>{comment.user_name}</strong><time className="text-sm text-gray-500">{new Date(comment.created_at).toLocaleDateString()}</time></div><p className="mt-2 whitespace-pre-wrap text-gray-700">{comment.content}</p></article>)}{comments.length === 0 && <p className="text-gray-500">Be the first to comment.</p>}</div><form onSubmit={submit} className="mt-6 space-y-3"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="w-full rounded-md border px-3 py-2" maxLength={80} /><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a comment" className="w-full rounded-md border px-3 py-2" rows={4} maxLength={2000} /><button disabled={busy} className="rounded-md bg-green-600 px-4 py-2 font-medium text-white disabled:opacity-50">{busy ? "Sending..." : "Post comment"}</button>{message && <p className="text-sm text-red-600">{message}</p>}</form></section>
}
