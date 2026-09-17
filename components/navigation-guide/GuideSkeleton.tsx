"use client"

export function GuideSkeleton() {
  return <div className="fixed bottom-6 right-6 z-[100] w-[min(24rem,calc(100vw-2rem))] rounded-[1.5rem] border border-white/50 bg-white/80 p-5 shadow-2xl backdrop-blur-xl">
    <div className="mb-4 h-2 w-28 animate-pulse rounded bg-[#073232]/10" /><div className="mb-3 h-6 w-2/3 animate-pulse rounded bg-[#073232]/10" /><div className="h-10 animate-pulse rounded bg-[#073232]/10" />
  </div>
}
