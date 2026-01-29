"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  User as UserIcon, 
  Settings, 
  LogOut,
  Clock,
  HandHeart,
  Coins,
  Building,
  Shield,
  FileText,
  Sparkles
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/listings", label: "My Listings", icon: Package },
  { href: "/dashboard/listings/new", label: "New Listing", icon: PlusCircle },
  { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

const quickActions = [
  {
    href: "/dashboard/listings/new",
    label: "Create Listing",
    icon: PlusCircle,
    color: "bg-blue-600 hover:bg-blue-700",
    primary: true
  },
  {
    href: "/dashboard/time-banking",
    label: "Time Banking",
    icon: Clock,
    color: "bg-green-600 hover:bg-green-700",
    primary: true
  },
  {
    href: "/b2b",
    label: "B2B Market",
    icon: Building,
    color: "bg-blue-600 hover:bg-blue-700",
    primary: true
  },
  {
    href: "/dashboard/time-banking/request",
    label: "Request Help",
    icon: HandHeart,
    color: "border-gray-200 hover:bg-gray-50 text-gray-700",
    outline: true
  },
  {
    href: "/dashboard/gift-cards",
    label: "Get Trade Coin",
    icon: Coins,
    color: "border-gray-200 hover:bg-gray-50 text-gray-700",
    outline: true
  },
  {
    href: "/dashboard/safe-zones",
    label: "Safe Zone",
    icon: Shield,
    color: "border-gray-200 hover:bg-gray-50 text-gray-700",
    badge: "Soon",
    outline: true
  },
]

interface DashboardSidebarProps {
  user: User
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-gray-200 bg-white shadow-xl lg:block">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-blue-500 p-1">
              <Image
                src="/swopify.png"
                alt="Swopify Logo"
                fill
                className="object-contain rounded-md"
              />
            </div>
            <span className="text-lg font-bold text-gray-800">Swopify</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Navigation</h3>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quick Actions</h3>
            </div>
            
            {/* Primary Actions */}
            <div className="space-y-2">
              {quickActions.filter(action => action.primary).map((action) => {
                const Icon = action.icon
                return (
                  <div key={action.href} className="relative">
                    <Button
                      asChild
                      className={`w-full justify-start h-10 text-white shadow-lg ${action.color}`}
                    >
                      <Link href={action.href} className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{action.label}</span>
                        {action.badge && (
                          <span className="ml-auto bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                            {action.badge}
                          </span>
                        )}
                      </Link>
                    </Button>
                  </div>
                )
              })}
            </div>

            {/* Secondary Actions */}
            <div className="space-y-2 pt-2">
              {quickActions.filter(action => action.outline).map((action) => {
                const Icon = action.icon
                return (
                  <div key={action.href} className="relative">
                    <Button
                      asChild
                      variant="outline"
                      className={`w-full justify-start h-9 ${action.color}`}
                    >
                      <Link href={action.href} className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{action.label}</span>
                        {action.badge && (
                          <span className="ml-auto bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                            {action.badge}
                          </span>
                        )}
                      </Link>
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="mb-4 flex items-center gap-3 px-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">
                {user.user_metadata?.display_name || "User"}
              </p>
              <p className="truncate text-xs text-gray-500">
                {user.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
