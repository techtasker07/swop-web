# Smart Navigation Guide — Implementation Guide for Codex

## Overview

Implement a context-aware, interest-driven onboarding navigation guide for the Swopify web app. It helps new users discover where to go and what to do next, based on their profile state and current page. The guide surfaces as a subtle, futuristic overlay that does NOT disrupt existing layouts, headers, footers, or visualizations.

---

## Architecture

```
components/
  navigation-guide/
    NavigationGuide.tsx        # Main orchestrator (client component)
    GuideTooltip.tsx           # Floating tooltip per step
    GuideHighlights.tsx        # Spotlight/overlay for target elements
    useNavigationGuide.ts      # Hook: logic, state, step calculation
    guideConfig.ts             # Step definitions, interest mapping
    GuideProgress.tsx          # Minimal progress indicator
    GuideSkeleton.tsx          # Loading state while profile loads
```

---

## Step 1: Define the Guide Configuration

**File:** `components/navigation-guide/guideConfig.ts`

Create a step registry. Each step has:
- `id` — unique string
- `target` — CSS selector or `null` for floating (no DOM anchor)
- `title`, `description` — content
- `pathname` — which page(s) this step appears on (or `*` for all)
- `condition` — user state check (e.g., `isLoggedIn`, `hasListings`, `hasProfile`)
- `interest` — tag matching user interests (e.g., `electronics`, `fashion`, `services`)
- `action` — what happens on "Next": `navigate` (route change) or `continue`
- `priority` — ordering weight

Example step shape:
```ts
{
  id: "browse-listings",
  target: "[data-nav='browse-link']",   // matches header Browse link
  title: "Discover Items",
  description: "Browse thousands of listings in your area — electronics, fashion, services and more.",
  pathname: "/",
  condition: "always",
  action: { type: "navigate", href: "/browse" },
  priority: 1
}
```

Step groups by user journey stage:
1. **First visit (not logged in):** Browse, Categories, How It Works, Get Started / Pricing
2. **Just signed up:** Complete Profile, Post First Listing, Browse
3. **Logged in, no listings:** Create Listing, Browse, Time Banking
4. **Logged in, has listings:** Smart Matches, Trades, Messages

---

## Step 2: The Hook — `useNavigationGuide.ts`

Responsibilities:
- Read current pathname (`usePathname`)
- Read Supabase auth user (`createClient().auth.getUser()`)
- Fetch lightweight profile data (listing count, verification status, interests)
- Compute the current step index from: `condition` match + `pathname` match + `priority`
- Expose: `currentStep`, `totalSteps`, `isVisible`, `dismiss`, `next`, `prev`, `skip`

Persistence: store `guideDismissed` and `guideCompleted` in `localStorage`. If dismissed, don't show again unless user explicitly resets from dashboard settings.

```ts
const { currentStep, isVisible, next, prev, dismiss, skip } = useNavigationGuide()
```

---

## Step 3: The Main Component — `NavigationGuide.tsx`

A client component that:
- Renders only when `isVisible` is true
- Uses `createPortal` (ReactDOM) to render at `document.body` level — avoids z-index conflicts with header/sidebar
- Contains:
  - `GuideHighlights` — a spotlight overlay that dims everything except the target element (if `target` is set)
  - `GuideTooltip` — a floating card positioned near the target (or bottom-center if no target)
  - `GuideProgress` — a thin top bar showing "Step X of Y" with a progress dot indicator
  - Buttons: Previous, Next/Continue, Skip (text link, low emphasis)

Styling requirements:
- Glassmorphism tooltip: `bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl`
- Accent gradient on the "Next" button: `bg-gradient-to-r from-[#073232] to-[#0a4a4a] hover:from-[#0a4a4a] hover:to-[#073232]`
- Entry animation: `animate-in fade-in slide-in-from-bottom-4 duration-500` (Tailwind Animate)
- Arrow pointing from tooltip to target element (CSS pseudo-element)
- Never covers the target element — offset positioning with auto-flip

---

## Step 4: Guide Highlights / Spotlight

**File:** `components/navigation-guide/GuideHighlights.tsx`

- Full-screen fixed overlay with `bg-black/40 backdrop-blur-sm`
- Cutout around the target element using `clip-path` or a secondary transparent overlay
- If no target (floating step), render nothing for the highlight
- Clicking the overlay does NOT advance — only buttons do

---

## Step 5: Integration Points

### 5a. Add `data-nav` attributes to existing elements
In `components/header.tsx`, add `data-nav` attributes to key links so the guide can anchor to them:
- `<Link data-nav="browse-link" href="/browse">` on Browse
- `<Link data-nav="categories-link" href="/categories">` on Categories
- `<Link data-nav="trade-coins-link" href="/trade-coins">` on Trade Coins
- `<Link data-nav="service-coins-link" href="/service-coins">` on Service Coins
- `<Link data-nav="dashboard-link" href="/dashboard">` on Dashboard
- `<Link data-nav="messages-link" href="/messages">` on Messages
- `<Button data-nav="post-listing-btn" onClick={handlePostListing}>` on Post Listing
- `<Link data-nav="pricing-link" href="/pricing">` on Get Started / Pricing

### 5b. Mount the guide
In `app/layout.tsx` (root layout), add inside `<body>`:
```tsx
import { NavigationGuide } from "@/components/navigation-guide/NavigationGuide"
...
<NavigationGuide />
```
Place it BEFORE `<Toaster>` and `<Analytics>` so it renders on top.

### 5c. Dashboard integration
In `app/dashboard/layout.tsx`, the guide should also work inside the dashboard sidebar context. The `target` selectors for dashboard steps should match `.dashboard-sidebar` elements (e.g., `[data-nav='dashboard-listings']`).

---

## Step 6: Interest-Based Routing

If the user's profile has `interests` field (or you infer from browsing behavior), the guide filters steps by interest tag:

- User interested in `electronics` → guide highlights "Browse Electronics" and "Post Electronics Listing"
- User interested in `services` → guide routes to "Service Coins" and "Professional Services"
- No interest set → show generic marketplace tour

Interests are fetched from `profiles.interests` (JSONB array in Supabase). If null, skip interest filtering and show default steps.

---

## Step 7: Non-Disruption Guarantees

1. **Z-index isolation:** Guide uses `z-50` portal. Existing header is `z-50`, sidebar `z-40`. The guide tooltip renders above both via portal + `z-[60]`.
2. **No layout shift:** The guide is absolutely/fixed positioned. No DOM insertion into existing flex/grid containers.
3. **No animation conflicts:** Uses `tw-animate-css` animations already in the project (`animate-in`, `fade-in`, `slide-in-from-bottom-4`).
4. **Respects user choice:** Once dismissed, stored in localStorage. Re-enableable from Dashboard > Settings > "Show navigation guide" toggle.
5. **Does not cover interactive elements:** Tooltip auto-positions away from edges and other UI.

---

## Step 8: Tailwind / Styling Notes

The project uses Tailwind CSS v4 with `@tailwindcss/postcss`. All styling goes in the component via `className` strings — no separate CSS file needed. Existing color tokens: `#073232` (dark teal), `#0a4a4a` (medium teal), `#32cd32` (green accent). Use these for the guide's gradient accents to stay on-brand.

---

## Step 9: File Creation Checklist

Create these files in order:
1. `components/navigation-guide/guideConfig.ts`
2. `components/navigation-guide/useNavigationGuide.ts`
3. `components/navigation-guide/GuideTooltip.tsx`
4. `components/navigation-guide/GuideHighlights.tsx`
5. `components/navigation-guide/GuideProgress.tsx`
6. `components/navigation-guide/GuideSkeleton.tsx`
7. `components/navigation-guide/NavigationGuide.tsx`
8. Update `components/header.tsx` — add `data-nav` attributes
9. Update `app/layout.tsx` — import and mount `<NavigationGuide />`
10. Update `components/dashboard/dashboard-sidebar.tsx` — add `data-nav` attributes

---

## Step 10: Verification

After implementation:
1. Run `pnpm run build` — must compile without TypeScript errors
2. Run `pnpm run lint` — must pass
3. Visit `/` as a new (incognito) user — guide should appear within 1 second
4. Visit `/` as a logged-in user with listings — guide should skip to advanced steps
5. Click "Skip" — guide must not reappear on same browser
6. Resize window — tooltip must reposition, never overflow viewport
7. Navigate between pages — guide should adapt steps to the new route

---

## Deliverable Summary

- 7 new component files in `components/navigation-guide/`
- 2 updated files (`header.tsx`, `layout.tsx`) with data attributes and mount
- 1 updated file (`dashboard-sidebar.tsx`) with data attributes
- No new dependencies — uses only existing: `lucide-react`, Radix UI, Tailwind, Supabase client
- All styling via Tailwind className strings, matching project's dark-teal/green theme