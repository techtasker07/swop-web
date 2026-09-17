export type GuideCondition = "guest" | "member-onboarding" | "active-seller"

export type GuideStep = {
  id: string
  target: string | null
  title: string
  description: string
  pathname: string | "*"
  condition: GuideCondition
  interest?: "electronics" | "fashion" | "services"
  action: { type: "navigate"; href: string } | { type: "continue" }
  priority: number
}

export const guideSteps: GuideStep[] = [
  { id: "browse-listings", target: "[data-nav='browse-link']", title: "Explore what is nearby", description: "Start with the marketplace. Discover items, services, and possibilities from people in your community.", pathname: "/", condition: "guest", action: { type: "navigate", href: "/browse" }, priority: 1 },
  { id: "explore-categories", target: "[data-nav='categories-link']", title: "Find your lane", description: "Categories make it easy to jump straight to the things that interest you most.", pathname: "/browse", condition: "guest", action: { type: "navigate", href: "/categories" }, priority: 2 },
  { id: "how-it-works", target: null, title: "Trade with confidence", description: "Take a quick look at how Swopify turns what you have into what you need.", pathname: "/categories", condition: "guest", action: { type: "navigate", href: "/how-it-works" }, priority: 3 },
  { id: "get-started", target: "[data-nav='pricing-link']", title: "Ready when you are", description: "Create an account to save favourites, publish listings, and begin swapping.", pathname: "/how-it-works", condition: "guest", action: { type: "navigate", href: "/pricing" }, priority: 4 },

  { id: "member-welcome", target: null, title: "You’re in — let’s make Swopify work for you", description: "This short member guide will help you complete your profile, publish your first listing, and learn where conversations begin.", pathname: "*", condition: "member-onboarding", action: { type: "navigate", href: "/dashboard" }, priority: 1 },
  { id: "complete-profile", target: "[data-nav='dashboard-profile']", title: "Make your profile memorable", description: "Add the essentials so other Swopify members know who they are trading with.", pathname: "/dashboard", condition: "member-onboarding", action: { type: "navigate", href: "/dashboard/profile" }, priority: 2 },
  { id: "create-first-listing", target: "[data-nav='dashboard-new-listing'], [data-nav='post-listing-btn']", title: "Post your first listing", description: "Your next great exchange starts with something you already have. Add a clear photo and a useful description.", pathname: "/dashboard/profile", condition: "member-onboarding", action: { type: "navigate", href: "/dashboard/listings/new" }, priority: 3 },
  { id: "browse-marketplace", target: "[data-nav='browse-link']", title: "Browse with intent", description: "Search the marketplace for an item or service that would make a great swap.", pathname: "/dashboard/listings/new", condition: "member-onboarding", action: { type: "navigate", href: "/browse" }, priority: 4 },
  { id: "start-a-conversation", target: "[data-nav='messages-link']", title: "Keep the conversation moving", description: "When you find a good match, messages are where interest becomes a real exchange.", pathname: "/browse", condition: "member-onboarding", action: { type: "navigate", href: "/messages" }, priority: 5 },

  { id: "smart-matches", target: "[data-nav='dashboard-overview']", title: "Your smart matches", description: "Your dashboard brings together listings and people most likely to lead to a great exchange.", pathname: "*", condition: "active-seller", action: { type: "navigate", href: "/dashboard" }, priority: 1 },
  { id: "manage-listings", target: "[data-nav='dashboard-listings']", title: "Keep your listings sharp", description: "Manage active listings, refresh details, and stay ready when a trade opportunity appears.", pathname: "/dashboard", condition: "active-seller", action: { type: "navigate", href: "/dashboard/listings" }, priority: 2 },
  { id: "messages", target: "[data-nav='messages-link']", title: "Keep the conversation moving", description: "Messages are where good offers become real swaps. Reply quickly to keep your momentum.", pathname: "/dashboard/listings", condition: "active-seller", action: { type: "navigate", href: "/messages" }, priority: 3 },
]
