"use client"

export function GuideProgress({ current, total }: { current: number; total: number }) {
  const progress = total ? ((current + 1) / total) * 100 : 0
  return <div className="space-y-2.5">
    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[#073232]/55">
      <span>Swopify navigator</span><span>{current + 1} / {total}</span>
    </div>
    <div className="h-1 overflow-hidden rounded-full bg-[#073232]/10"><div className="h-full rounded-full bg-gradient-to-r from-[#32cd32] via-[#159a7b] to-[#073232] transition-all duration-500" style={{ width: `${progress}%` }} /></div>
  </div>
}
