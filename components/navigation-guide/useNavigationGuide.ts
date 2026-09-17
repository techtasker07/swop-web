"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { guideSteps, type GuideCondition, type GuideStep } from "./guideConfig"

const GUIDE_KEY_PREFIX = "swopify-navigation-guide"
const RESET_EVENT = "swopify-navigation-guide-reset"

type GuideProfile = { display_name?: string | null; bio?: string | null; metadata?: unknown } | null
type GuideScope = "guest" | "member"

function storageKey(scope: GuideScope, state: "dismissed" | "completed") {
  return `${GUIDE_KEY_PREFIX}-${scope}-${state}`
}

function getInterests(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") return []
  const raw = (metadata as Record<string, unknown>).interests
  return Array.isArray(raw) ? raw.filter((value): value is string => typeof value === "string").map((value) => value.toLowerCase()) : []
}

function matchingSteps(condition: GuideCondition, interests: string[]) {
  return guideSteps
    .filter((step) => step.condition === condition)
    .filter((step) => !step.interest || interests.length === 0 || interests.includes(step.interest))
    .sort((a, b) => a.priority - b.priority)
}

export function useNavigationGuide() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isDismissed, setIsDismissed] = useState(true)
  const [steps, setSteps] = useState<GuideStep[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [scope, setScope] = useState<GuideScope>("guest")

  const loadGuide = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const nextScope: GuideScope = user ? "member" : "guest"
    setScope(nextScope)
    const dismissed = window.localStorage.getItem(storageKey(nextScope, "dismissed")) === "true" || window.localStorage.getItem(storageKey(nextScope, "completed")) === "true"
    setIsDismissed(dismissed)

    let profile: GuideProfile = null
    let listingCount = 0
    if (user) {
      const [profileResult, listingsResult] = await Promise.all([
        supabase.from("profiles").select("display_name, bio, metadata").eq("id", user.id).maybeSingle(),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("seller_id", user.id),
      ])
      profile = profileResult.data
      listingCount = listingsResult.count ?? 0
    }

    const condition: GuideCondition = !user ? "guest" : listingCount > 0 ? "active-seller" : "member-onboarding"
    setSteps(matchingSteps(condition, getInterests(profile?.metadata)))
    setStepIndex(0)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void loadGuide()
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => void loadGuide())
    const reset = () => {
      for (const guideScope of ["guest", "member"] as const) {
        window.localStorage.removeItem(storageKey(guideScope, "dismissed"))
        window.localStorage.removeItem(storageKey(guideScope, "completed"))
      }
      void loadGuide()
    }
    window.addEventListener(RESET_EVENT, reset)
    return () => { subscription.unsubscribe(); window.removeEventListener(RESET_EVENT, reset) }
  }, [loadGuide])

  const currentStep = steps[stepIndex]
  const isVisible = !isLoading && !isDismissed && Boolean(currentStep)

  const dismiss = useCallback((completed = false) => {
    window.localStorage.setItem(storageKey(scope, completed ? "completed" : "dismissed"), "true")
    setIsDismissed(true)
  }, [scope])

  const next = useCallback(() => {
    if (!currentStep) return
    if (stepIndex >= steps.length - 1) {
      dismiss(true)
      return
    }
    setStepIndex((index) => index + 1)
    if (currentStep.action.type === "navigate" && currentStep.action.href !== pathname) router.push(currentStep.action.href)
  }, [currentStep, dismiss, pathname, router, stepIndex, steps.length])

  const prev = useCallback(() => setStepIndex((index) => Math.max(0, index - 1)), [])

  return useMemo(() => ({ currentStep, totalSteps: steps.length, stepIndex, isVisible, isLoading, next, prev, dismiss, skip: () => dismiss(false) }), [currentStep, dismiss, isLoading, isVisible, next, prev, stepIndex, steps.length])
}

export const navigationGuideResetEvent = RESET_EVENT
