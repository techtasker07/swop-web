"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, CalendarDays, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  author_name: string | null
  created_at: string
}

export function BlogHighlights({ posts }: { posts: BlogPost[] }) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  return (
    <>
      <Card className="overflow-hidden border-0 bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 bg-[#32cd32]/10 p-4 sm:px-6 sm:py-4">
          <CardTitle className="flex items-center gap-2 text-base text-gray-800 sm:text-lg">
            <BookOpen className="h-5 w-5 text-[#32cd32]" />
            Latest from Swopify
          </CardTitle>
          <Link href="/blog" className="flex items-center gap-1 text-sm font-semibold text-[#073232] hover:text-[#32cd32]">
            View all posts <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          {posts.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-3xl">
              {posts.map((post) => (
                <article key={post.id} className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm transition hover:border-[#32cd32]/60 hover:shadow-md">
                  {post.cover_image ? (
                    <img src={post.cover_image} alt="" className="h-24 w-full object-cover sm:h-28" />
                  ) : (
                    <div className="flex h-24 items-center justify-center bg-gradient-to-br from-[#073232] to-[#0a4a4a] sm:h-28">
                      <BookOpen className="h-7 w-7 text-[#32cd32]" />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[#073232]">{post.title}</h3>
                    <Button type="button" size="sm" variant="outline" onClick={() => setSelectedPost(post)} className="mt-3 h-8 w-full border-[#073232]/20 text-xs text-[#073232] hover:bg-[#073232] hover:text-white">
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      Flash view
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">No published posts yet.</p>
              <Link href="/blog" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#32cd32]">Visit the blog <ArrowRight className="h-4 w-4" /></Link>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedPost)} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto p-0">
          {selectedPost && (
            <>
              {selectedPost.cover_image ? <img src={selectedPost.cover_image} alt="" className="h-48 w-full object-cover sm:h-56" /> : <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#073232] to-[#0a4a4a]"><BookOpen className="h-10 w-10 text-[#32cd32]" /></div>}
              <div className="p-5 sm:p-6">
                <DialogHeader>
                  <DialogTitle className="pr-8 text-xl leading-7 text-[#073232]">{selectedPost.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(selectedPost.created_at).toLocaleDateString()} {selectedPost.author_name ? `· ${selectedPost.author_name}` : ""}
                  </DialogDescription>
                </DialogHeader>
                {selectedPost.excerpt && <p className="mt-5 text-base font-medium leading-7 text-slate-700">{selectedPost.excerpt}</p>}
                <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">{selectedPost.content || "Read the full post for more from Swopify."}</div>
                <Button asChild className="mt-6 bg-[#073232] text-white hover:bg-[#0a4a4a]">
                  <Link href={`/blog/${selectedPost.slug}`}>Read full post <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
