"use client"

import { createPortal } from "react-dom"
import { GuideHighlights } from "./GuideHighlights"
import { GuideSkeleton } from "./GuideSkeleton"
import { GuideTooltip } from "./GuideTooltip"
import { useNavigationGuide } from "./useNavigationGuide"

export function NavigationGuide() {
  const guide = useNavigationGuide()
  if (typeof document === "undefined") return null
  if (guide.isLoading) return createPortal(<GuideSkeleton />, document.body)
  if (!guide.isVisible || !guide.currentStep) return null
  return createPortal(<><GuideHighlights selector={guide.currentStep.target} /><GuideTooltip step={guide.currentStep} current={guide.stepIndex} total={guide.totalSteps} onNext={guide.next} onPrev={guide.prev} onSkip={guide.skip} /></>, document.body)
}
