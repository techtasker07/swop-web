"use client"

import { useEffect, useLayoutEffect, useState } from "react"
import { ArrowLeft, ArrowRight, Compass, Sparkles, X } from "lucide-react"
import type { GuideStep } from "./guideConfig"
import { GuideProgress } from "./GuideProgress"

type Position = { top: number; left: number; arrow: "top" | "bottom" | null }
const CARD_WIDTH = 380

export function GuideTooltip({ step, current, total, onNext, onPrev, onSkip }: { step: GuideStep; current: number; total: number; onNext: () => void; onPrev: () => void; onSkip: () => void }) {
  const [position, setPosition] = useState<Position>({ top: 24, left: 24, arrow: null })
  const isLast = current === total - 1

  useLayoutEffect(() => {
    const update = () => {
      const target = step.target ? document.querySelector(step.target) : null
      const width = Math.min(CARD_WIDTH, window.innerWidth - 32)
      if (!target) return setPosition({ top: Math.max(24, window.innerHeight - 360), left: Math.max(16, (window.innerWidth - width) / 2), arrow: null })
      const rect = target.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const showBelow = spaceBelow >= 310 || rect.top < 310
      const top = showBelow ? Math.min(window.innerHeight - 18, rect.bottom + 18) : Math.max(18, rect.top - 18)
      const left = Math.min(Math.max(16, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 16)
      setPosition({ top, left, arrow: showBelow ? "top" : "bottom" })
    }
    const frame = requestAnimationFrame(update)
    window.addEventListener("resize", update)
    window.addEventListener("scroll", update, true)
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true) }
  }, [step])

  return <section aria-live="polite" className="fixed z-[100] w-[calc(100vw-2rem)] max-w-[380px] animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ top: position.top, left: position.left, transform: position.arrow === "bottom" ? "translateY(-100%)" : undefined }}>
    {position.arrow && <span className={`absolute left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-[#073232]/10 bg-white/90 ${position.arrow === "top" ? "-top-2 border-l border-t" : "-bottom-2 border-b border-r"}`} />}
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_rgba(7,50,50,0.28)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#32cd32]/20 blur-3xl" />
      <div className="relative"><GuideProgress current={current} total={total} />
        <button type="button" onClick={onSkip} className="absolute right-0 top-7 rounded-full p-1.5 text-[#073232]/45 transition hover:bg-[#073232]/5 hover:text-[#073232]" aria-label="Skip navigation guide"><X className="h-4 w-4" /></button>
        <div className="mt-5 flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#073232] to-[#0a4a4a] text-[#32cd32] shadow-lg"><Compass className="h-5 w-5" /></div><div className="pr-5"><p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[#159a7b]"><Sparkles className="h-3.5 w-3.5" /> SMART GUIDE</p><h2 className="text-lg font-bold tracking-tight text-[#073232]">{step.title}</h2></div></div>
        <p className="mt-3 text-sm leading-6 text-[#073232]/70">{step.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3"><button type="button" onClick={onSkip} className="text-xs font-semibold text-[#073232]/50 transition hover:text-[#073232]">Skip tour</button><div className="flex items-center gap-2"><button type="button" onClick={onPrev} disabled={current === 0} className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold text-[#073232]/70 transition hover:bg-[#073232]/5 disabled:cursor-not-allowed disabled:opacity-30"><ArrowLeft className="h-3.5 w-3.5" /> Back</button><button type="button" onClick={onNext} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#073232] to-[#0a4a4a] px-4 text-xs font-bold text-white shadow-lg transition hover:from-[#0a4a4a] hover:to-[#073232]"><span>{isLast ? "Finish" : "Continue"}</span><ArrowRight className="h-3.5 w-3.5" /></button></div></div>
      </div>
    </div>
  </section>
}
