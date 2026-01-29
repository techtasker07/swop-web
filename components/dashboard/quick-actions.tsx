"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  PlusIcon,
  BuildingOfficeIcon,
  ClockIcon,
  HandRaisedIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      icon: PlusIcon,
      label: 'Create Listing',
      href: '/dashboard/listings/new',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: BuildingOfficeIcon,
      label: 'B2B Market',
      href: '/b2b',
      color: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      badge: 'PRO',
    },
    {
      icon: ClockIcon,
      label: 'Time Banking',
      href: '/dashboard/time-banking',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: HandRaisedIcon,
      label: 'Request Help',
      href: '/dashboard/time-banking/request',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: CurrencyDollarIcon,
      label: 'Get Trade Coin',
      href: '/dashboard/gift-cards',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: HandRaisedIcon,
      label: 'Give Help',
      href: '/dashboard/time-banking/offer',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: DocumentTextIcon,
      label: 'My Listings',
      href: '/dashboard/listings',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      icon: ShieldCheckIcon,
      label: 'Safe Zone',
      href: '/dashboard/safe-zones',
      color: 'bg-blue-600 hover:bg-blue-700',
      badge: 'Coming Soon!',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <div key={action.label} className="relative">
                <Button
                  asChild
                  variant="default"
                  className={`w-full h-auto p-4 flex flex-col items-center space-y-2 ${action.color}`}
                >
                  <Link href={action.href}>
                    <Icon className="h-6 w-6 text-white" />
                    <span className="text-xs font-medium text-white text-center leading-tight">
                      {action.label}
                    </span>
                  </Link>
                </Button>
                {action.badge && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 text-xs bg-orange-500 text-white"
                  >
                    {action.badge}
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}