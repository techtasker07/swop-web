"use client"

import { useEffect, useState } from "react"

type Rect = { top: number; left: number; width: number; height: number }

export function GuideHighlights({ selector }: { selector: string | null }) {
  const [rect, setRect] = useState<Rect | null>(null)

  useEffect(() => {
    if (!selector) return setRect(null)
    const update = () => {
      const element = document.querySelector(selector)
      if (!element) return setRect(null)
      const bounds = element.getBoundingClientRect()
      const padding = 8
      setRect({ top: Math.max(4, bounds.top - padding), left: Math.max(4, bounds.left - padding), width: bounds.width + padding * 2, height: bounds.height + padding * 2 })
    }
    update()
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      window.removeEventListener("scroll", update, true)
    }
  }, [selector])

  if (!rect) return null
  return <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] bg-black/35 backdrop-blur-[2px]" style={{ clipPath: `polygon(0 0, 0 100%, ${rect.left}px 100%, ${rect.left}px ${rect.top}px, ${rect.left + rect.width}px ${rect.top}px, ${rect.left + rect.width}px ${rect.top + rect.height}px, ${rect.left}px ${rect.top + rect.height}px, ${rect.left}px 100%, 100% 100%, 100% 0)` }}>
    <div className="absolute rounded-xl border border-[#32cd32] shadow-[0_0_0_2px_rgba(50,205,50,0.18),0_0_36px_rgba(50,205,50,0.55)]" style={rect} />
  </div>
}
