"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  PlusIcon, 
  XMarkIcon,
  ArrowsRightLeftIcon,
  ArchiveBoxIcon,
  ClockIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { formatNaira } from "@/lib/utils/currency"
import Image from "next/image"
import type { Listing, Profile, TradeCoinBalance } from "@/lib/types/database"
import { XIcon } from "lucide-react"
import { tradeCoinService } from "@/lib/services/trade-coin-service"
import { requirePersonalVerification } from "@/lib/utils/verification-guard"
import { swopifyPricingService } from "@/lib/services/swopify-pricing-service"

interface ProposeTradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetListing: Listing & { seller: Profile }
  user: any
}

interface TradeItem {
  type: 'listing' | 'cash' | 'service' | 'trade_coin' | 'time_banking'
  listing_id?: number
  listing?: Listing
  cash_amount?: number
  service_description?: string
  service_hours?: number
  // Trade Coin fields
  coin_type?: string
  trade_coin_amount?: number
  // Time Banking fields
  time_banking_hours?: number
}

/**
 * Store the portable item shape used by the working mobile client. In
 * particular, do not persist the browser-side Listing object inside JSONB.
 */
function serializeProposerItems(items: TradeItem[]) {
  return items.map((item) => {
    if (item.type === "listing" && item.listing) {
      return {
        listing_id: item.listing_id,
        title: item.listing.title,
        description: item.listing.description,
        category: item.listing.category,
        condition: item.listing.condition,
        estimated_value: item.listing.price ?? 0,
        images: item.listing.listing_images?.map((image) => image.url) ?? [],
      }
    }

    if (item.type === "cash") {
      return {
        type: "cash",
        amount: item.cash_amount ?? 0,
        title: `Cash (${formatNaira(item.cash_amount ?? 0)})`,
        description: "Cash payment",
      }
    }

    if (item.type === "service") {
      return {
        type: "service",
        hours: item.service_hours ?? 0,
        title: item.service_description ?? "Service offer",
        description: item.service_description ?? "Service offer",
        estimated_value: (item.service_hours ?? 0) * 2000,
      }
    }

    if (item.type === "trade_coin") {
      return {
        type: "trade_coin",
        coin_type: item.coin_type ?? "STC",
        amount: item.trade_coin_amount ?? 0,
        title: `Trade Coins (${item.trade_coin_amount ?? 0} TC)`,
        description: "Trade Coin payment",
      }
    }

    return {
      type: "time_banking",
      hours: item.time_banking_hours ?? 0,
      title: `Time Banking (${item.time_banking_hours ?? 0} hours)`,
      description: "Time banking credit",
    }
  })
}

export function ProposeTradeDialog({ open, onOpenChange, targetListing, user }: ProposeTradeDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [userListings, setUserListings] = useState<Listing[]>([])
  const [selectedItems, setSelectedItems] = useState<TradeItem[]>([])
  const [message, setMessage] = useState("")
  const [cashAmount, setCashAmount] = useState("")
  const [serviceDescription, setServiceDescription] = useState("")
  const [serviceHours, setServiceHours] = useState("")
  // Trade Coin state
  const [tradeCoinBalance, setTradeCoinBalance] = useState<TradeCoinBalance | null>(null)
  const [tradeCoinAmount, setTradeCoinAmount] = useState("")
  // Time Banking state
  const [timeBankingHours, setTimeBankingHours] = useState("")

  const isService = targetListing.type === 'service'
  const isPhysicalItem = targetListing.type === 'item'

  // For physical items, we only allow listing items and trade coins
  // Cash and service offerings don't apply to physical item trades
  const showPhysicalItemsOnly = isPhysicalItem

  useEffect(() => {
    if (open && user) {
      fetchUserListings()
      fetchTradeCoinBalance()
    }
  }, [open, user])

  const fetchUserListings = async () => {
    try {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          listing_images(url, is_primary, sort_order)
        `)
        .eq("seller_id", user.id)
        .eq("is_available", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setUserListings(data || [])
    } catch (error) {
      console.error("Error fetching user listings:", error)
    }
  }

  const fetchTradeCoinBalance = async () => {
    try {
      const balance = await tradeCoinService.getUserBalance(user.id)
      setTradeCoinBalance(balance)
    } catch (error) {
      console.error("Error fetching Trade Coin balance:", error)
    }
  }

  const addListingItem = (listingId: number) => {
    const listing = userListings.find(l => l.id === listingId)
    if (listing && !selectedItems.find(item => item.listing_id === listingId)) {
      setSelectedItems(prev => [...prev, {
        type: 'listing',
        listing_id: listingId,
        listing
      }])
    }
  }

  const addCashItem = () => {
    const amount = parseFloat(cashAmount)
    if (amount > 0) {
      setSelectedItems(prev => [...prev, {
        type: 'cash',
        cash_amount: amount
      }])
      setCashAmount("")
    }
  }

  const addServiceItem = () => {
    const hours = parseFloat(serviceHours)
    if (serviceDescription.trim() && hours > 0) {
      setSelectedItems(prev => [...prev, {
        type: 'service',
        service_description: serviceDescription.trim(),
        service_hours: hours
      }])
      setServiceDescription("")
      setServiceHours("")
    }
  }

  const addTradeCoinItem = async () => {
    const amount = parseInt(tradeCoinAmount)
    if (amount > 0) {
      // Trade Coins settle against the single TC balance
      // Check against the current balance state we fetched at dialog open
      // Use total_balance for validation (not stc_balance which may not be populated)
      if (!tradeCoinBalance) {
        toast.error("Unable to verify Trade Coin balance. Please refresh and try again.")
        return
      }

      const availableBalance = tradeCoinBalance.total_balance || 0
      if (amount > availableBalance) {
        toast.error(
          `Insufficient Trade Coin balance. You need ${amount} TC but only have ${availableBalance} TC.`
        )
        return
      }

      // Remove any existing trade coin items to avoid duplicates
      setSelectedItems(prev => {
        const withoutTC = prev.filter(item => item.type !== 'trade_coin')
        return [...withoutTC, {
          type: 'trade_coin',
          coin_type: 'STC',
          trade_coin_amount: amount
        }]
      })
      setTradeCoinAmount("")
      toast.success(`Added ${amount} Trade Coins`)
    } else if (amount === 0 && tradeCoinAmount.trim() !== '') {
      toast.error('Please enter a valid amount greater than 0')
    }
  }

  const addTimeBankingItem = () => {
    const hours = parseInt(timeBankingHours)
    if (hours > 0) {
      setSelectedItems(prev => [...prev, {
        type: 'time_banking',
        time_banking_hours: hours
      }])
      setTimeBankingHours("")
    }
  }

  const removeItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index))
  }

  // Calculate value of physical items only (for balancing physical item trades)
  const calculatePhysicalItemsValue = (): number => {
    return selectedItems
      .filter(item => item.type === 'listing')
      .reduce((total, item) => {
        if (item.listing) {
          return total + (item.listing.price || 0)
        }
        return total
      }, 0)
  }

  // Get the Trade Coin balance from selected items
  const getSelectedTradeCoinAmount = (): number => {
    const tradeCoinItem = selectedItems.find(item => item.type === 'trade_coin')
    return tradeCoinItem?.trade_coin_amount || 0
  }

  // Calculate required Trade Coins to balance the trade (for physical items)
  const calculateRequiredTradeCoins = (): number => {
    const targetValue = targetListing.price || 0
    const physicalItemsValue = calculatePhysicalItemsValue()
    const gap = targetValue - physicalItemsValue

    if (gap > 0) {
      // Gap exists, calculate TCs needed (1 TC = ₦1,000)
      return Math.ceil(gap / 1000)
    }

    return 0
  }

  // Check if balancing is needed for physical item trades
  const needsBalancing = (): boolean => {
    if (!showPhysicalItemsOnly) return false
    
    const physicalItemsValue = calculatePhysicalItemsValue()
    const targetValue = targetListing.price || 0
    const gap = Math.abs(targetValue - physicalItemsValue)
    
    // Need balancing if gap is more than ₦500 (0.5 TC)
    return gap > 500
  }

  // Get balancing suggestion
  const getBalancingSuggestion = (): { required: number; current: number; shortage: number } => {
    const requiredTCs = calculateRequiredTradeCoins()
    const currentTCs = getSelectedTradeCoinAmount()
    const shortage = Math.max(0, requiredTCs - currentTCs)

    return { required: requiredTCs, current: currentTCs, shortage }
  }

  // Auto-balance with suggested Trade Coins
  const autoBalanceWithTradeCoins = async () => {
    const suggestedAmount = getBalancingSuggestion().required

    if (suggestedAmount <= 0) {
      toast.error("No balancing needed")
      return
    }

    // Check if user has sufficient TC balance using state balance
    // Use total_balance for validation (not stc_balance which may not be populated)
    if (!tradeCoinBalance) {
      toast.error("Unable to verify Trade Coin balance. Please refresh and try again.")
      return
    }

    const availableBalance = tradeCoinBalance.total_balance || 0
    if (suggestedAmount > availableBalance) {
      toast.error(
        `Insufficient Trade Coin balance. You need ${suggestedAmount} TC but only have ${availableBalance} TC. Top up your Trade Coins to proceed.`
      )
      return
    }

    // Remove any existing trade coin items and add the suggested amount
    setSelectedItems(prev => {
      const withoutTC = prev.filter(item => item.type !== 'trade_coin')
      return [...withoutTC, {
        type: 'trade_coin',
        coin_type: 'STC',
        trade_coin_amount: suggestedAmount
      }]
    })

    toast.success(`Added ${suggestedAmount} Trade Coins to balance your offer`)
  }

  const calculateTotalValue = () => {
    return selectedItems.reduce((total, item) => {
      if (item.type === 'listing' && item.listing) {
        return total + (item.listing.price || 0)
      } else if (item.type === 'cash') {
        return total + (item.cash_amount || 0)
      } else if (item.type === 'service') {
        // Estimate service value at ₦2000 per hour
        return total + ((item.service_hours || 0) * 2000)
      } else if (item.type === 'trade_coin') {
        // Trade Coin value: 1 TC = ₦1,000
        return total + ((item.trade_coin_amount || 0) * 1000)
      } else if (item.type === 'time_banking') {
        // Estimate time banking value at ₦2000 per hour
        return total + ((item.time_banking_hours || 0) * 2000)
      }
      return total
    }, 0)
  }

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please add at least one item to your trade proposal")
      return
    }

    setIsLoading(true)

    try {
      await requirePersonalVerification()
      const allowance = await swopifyPricingService.checkTradeProposalAllowance(user.id)
      if (!allowance.allowed) throw new Error(allowance.message)

      // Check if trade involves Trade Coins
      const hasTradeCoin = selectedItems.some(item => item.type === 'trade_coin')
      let escrowId = null
      const proposerItems = serializeProposerItems(selectedItems)

      // Match the shared contract used by the working mobile app. The
      // previous web-only columns are not part of the base trades table.
      const { data: trade, error: tradeError } = await supabase
        .from("trades")
        .insert({
          proposer_id: user.id,
          receiver_id: targetListing.seller_id,
          message: message.trim() || `Trade proposal for "${targetListing.title}"`,
          meeting_location: "To be agreed",
          status: 'pending',
          proposer_items: proposerItems,
          metadata: {
            target_listing_id: targetListing.id,
            target_listing_title: targetListing.title,
            estimated_value: calculateTotalValue(),
            involves_trade_coins: hasTradeCoin,
          },
        })
        .select()
        .single()

      if (tradeError) throw tradeError

      // If Trade Coins are involved, hold them in escrow
      if (hasTradeCoin) {
        const tradeCoinItem = selectedItems.find(item => item.type === 'trade_coin')
        if (tradeCoinItem && tradeCoinItem.coin_type && tradeCoinItem.trade_coin_amount) {
          escrowId = await tradeCoinService.holdInEscrow(
            trade.id,
            user.id,
            targetListing.seller_id,
            tradeCoinItem.coin_type,
            tradeCoinItem.trade_coin_amount
          )

          // Update trade with escrow ID
          await supabase
            .from("trades")
            .update({ trade_coin_escrow_id: escrowId })
            .eq("id", trade.id)
        }
      }

      // Match the mobile notification contract. The shared schema uses
      // `metadata`, `reference_id`, and `trade_request`.
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: targetListing.seller_id,
          type: 'trade_request',
          title: 'Trade Request Received',
          message: `${user.user_metadata?.display_name || 'Someone'} wants to trade for your ${targetListing.title}`,
          reference_id: trade.id,
          metadata: {
            trade_id: trade.id,
            listing_id: targetListing.id,
            proposer_name: user.user_metadata?.display_name || 'Anonymous'
          }
        })

      // Do not report a successfully saved trade as failed merely because a
      // secondary notification could not be persisted.
      if (notificationError) {
        console.error("Trade proposal notification could not be created:", notificationError)
      }

      toast.success("Trade proposal sent successfully!")
      onOpenChange(false)
      router.push("/dashboard/trades")
    } catch (error) {
      console.error("Error creating trade proposal:", error)
      const messageText = error instanceof Error ? error.message : "Failed to send trade proposal. Please try again."
      toast.error(messageText)
      if (messageText.toLowerCase().includes("verify")) router.push(`/verification?type=personal&redirect=${encodeURIComponent(`/listings/${targetListing.id}`)}`)
      if (messageText.toLowerCase().includes("limit") || messageText.toLowerCase().includes("upgrade")) router.push("/pricing")
    } finally {
      setIsLoading(false)
    }
  }

  const targetValue = targetListing.price || 0
  const proposedValue = calculateTotalValue()
  const valueDifference = proposedValue - targetValue
  const isValueFair = Math.abs(valueDifference) <= targetValue * 0.2 // Within 20%

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ArrowsRightLeftIcon className="h-5 w-5" />
            <span>{showPhysicalItemsOnly ? "Trade Physical Items" : "Propose Trade"}</span>
          </DialogTitle>
          {showPhysicalItemsOnly && (
            <p className="text-sm text-muted-foreground mt-2">
              Select your items to trade. If the total value doesn't match, use Trade Coins to balance the difference.
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Physical Item Trade Info Banner */}
          {showPhysicalItemsOnly && (
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-4">
              <div className="flex space-x-3">
                <div className="flex-shrink-0 pt-0.5">
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-blue-900">Physical Item Exchange</h4>
                  <ul className="mt-2 text-xs text-blue-800 space-y-1">
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">1.</span>
                      <span>Select your physical items from your listings</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">2.</span>
                      <span>The system will show if you need Trade Coins to balance</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">3.</span>
                      <span>Add Trade Coins to complete the fair trade</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Target Item */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-foreground mb-3">You want:</h3>
              <div className="flex items-center space-x-3">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted">
                  {targetListing.images?.[0] ? (
                    <Image
                      src={targetListing.images[0]}
                      alt={targetListing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ArchiveBoxIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{targetListing.title}</h4>
                  <p className="text-sm text-muted-foreground">{targetListing.location}</p>
                  <p className="text-sm font-semibold text-emerald-600">
                    {formatNaira(targetListing.price)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Offer */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-foreground mb-3">
                {showPhysicalItemsOnly ? "Your Items & Trade Coins:" : "You offer:"}
              </h3>
              {/* Selected Items */}
              {selectedItems.length > 0 && (
                <div className="space-y-2 mb-4">
                  {selectedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        {item.type === 'listing' && item.listing && (
                          <>
                            <div className="relative h-10 w-10 rounded overflow-hidden bg-background">
                              {item.listing.images?.[0] ? (
                                <Image
                                  src={item.listing.images[0]}
                                  alt={item.listing.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <ArchiveBoxIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.listing.title}</p>
                              <p className="text-xs text-emerald-600">{formatNaira(item.listing.price)}</p>
                            </div>
                          </>
                        )}
                        {item.type === 'cash' && (
                          <>
                            <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center">
                              <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Cash</p>
                              <p className="text-xs text-emerald-600">{formatNaira(item.cash_amount || 0)}</p>
                            </div>
                          </>
                        )}
                        {item.type === 'service' && (
                          <>
                            <div className="h-10 w-10 rounded bg-[#32cd32]/10 flex items-center justify-center">
                              <ClockIcon className="h-5 w-5 text-[#32cd32]" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.service_description}</p>
                              <p className="text-xs text-[#32cd32]">{item.service_hours}h service</p>
                            </div>
                          </>
                        )}
                        {item.type === 'trade_coin' && (
                          <>
                            <div className="h-10 w-10 rounded bg-[#073232]/10 flex items-center justify-center">
                              <CurrencyDollarIcon className="h-5 w-5 text-[#073232]" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Trade Coins</p>
                              <p className="text-xs text-[#073232]">{item.trade_coin_amount} TC</p>
                            </div>
                          </>
                        )}
                        {item.type === 'time_banking' && (
                          <>
                            <div className="h-10 w-10 rounded bg-[#32cd32]/10 flex items-center justify-center">
                              <ClockIcon className="h-5 w-5 text-[#32cd32]" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">Time Banking</p>
                              <p className="text-xs text-[#32cd32]">{item.time_banking_hours}h credit</p>
                            </div>
                          </>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="h-8 w-8 p-0"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State for Physical Items */}
              {showPhysicalItemsOnly && selectedItems.length === 0 && (
                <div className="text-center py-6 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 mb-4">
                  <ArchiveBoxIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">No items selected yet</p>
                  <p className="text-xs text-slate-500 mt-1">Choose from your listings below to start the trade</p>
                </div>
              )}

              {/* Add Items */}
              <div className="space-y-4">
                {/* Add Your Listings */}
                {userListings.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">
                      {showPhysicalItemsOnly ? "Select items to trade:" : "Add from your listings:"}
                    </Label>
                    <Select onValueChange={(value) => addListingItem(parseInt(value))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a listing" />
                      </SelectTrigger>
                      <SelectContent>
                        {userListings
                          .filter(listing => !selectedItems.find(item => item.listing_id === listing.id))
                          .map((listing) => (
                            <SelectItem key={listing.id} value={listing.id.toString()}>
                              {listing.title} - {formatNaira(listing.price)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Add Cash - Hidden for physical items */}
                {!showPhysicalItemsOnly && (
                  <div>
                    <Label className="text-sm font-medium">Add cash:</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        type="number"
                        placeholder="Amount in ₦"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                        min="0"
                      />
                      <Button onClick={addCashItem} variant="outline" size="sm">
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Add Service - Hidden for physical items */}
                {!showPhysicalItemsOnly && (
                  <div>
                    <Label className="text-sm font-medium">Offer a service:</Label>
                    <div className="space-y-2 mt-1">
                      <Input
                        placeholder="Service description"
                        value={serviceDescription}
                        onChange={(e) => setServiceDescription(e.target.value)}
                      />
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="Hours"
                          value={serviceHours}
                          onChange={(e) => setServiceHours(e.target.value)}
                          min="0"
                          step="0.5"
                        />
                        <Button onClick={addServiceItem} variant="outline" size="sm">
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Trade Coins */}
                <div>
                  <Label className="text-sm font-medium">
                    {showPhysicalItemsOnly ? "Balance with Trade Coins:" : "Pay with Trade Coins:"}
                  </Label>
                  {tradeCoinBalance && (
                    <div className="flex items-center space-x-2 mt-1 mb-2 text-xs text-muted-foreground">
                      <span>Balance:</span>
                      <span className="font-medium">{tradeCoinBalance.total_balance} TC</span>
                    </div>
                  )}
                  {showPhysicalItemsOnly && needsBalancing() && (
                    <div className="flex items-center space-x-2 mt-1 mb-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-xs text-amber-800">
                        Suggested: {getBalancingSuggestion().required} TC to balance
                      </span>
                    </div>
                  )}
                  <div className="space-y-2 mt-1">
                    <div className="flex space-x-2">
                      <Input
                        type="number"
                        placeholder="Amount in TC"
                        value={tradeCoinAmount}
                        onChange={(e) => setTradeCoinAmount(e.target.value)}
                        min="0"
                      />
                      <Button onClick={addTradeCoinItem} variant="outline" size="sm">
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Add Time Banking (only for services) */}
                {isService && (
                  <div>
                    <Label className="text-sm font-medium">Offer Time Banking hours:</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        type="number"
                        placeholder="Hours"
                        value={timeBankingHours}
                        onChange={(e) => setTimeBankingHours(e.target.value)}
                        min="0"
                      />
                      <Button onClick={addTimeBankingItem} variant="outline" size="sm">
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Value Comparison */}
          {selectedItems.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium text-foreground mb-3">Trade Value</h3>
                <div className="space-y-2">
                  {showPhysicalItemsOnly ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Item you want:</span>
                        <span className="font-medium">{formatNaira(targetValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your physical items:</span>
                        <span className="font-medium">{formatNaira(calculatePhysicalItemsValue())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trade Coins offered:</span>
                        <span className="font-medium text-[#073232]">{getSelectedTradeCoinAmount()} TC (₦{formatNaira(getSelectedTradeCoinAmount() * 1000)})</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-muted-foreground">Total offer:</span>
                        <span className="font-medium">{formatNaira(proposedValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Difference:</span>
                        <span className={`font-medium ${
                          valueDifference > 0 ? 'text-green-600' : valueDifference < 0 ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {valueDifference > 0 ? '+' : ''}{formatNaira(Math.abs(valueDifference))}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Their item:</span>
                        <span className="font-medium">{formatNaira(targetValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your offer:</span>
                        <span className="font-medium">{formatNaira(proposedValue)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-muted-foreground">Difference:</span>
                        <span className={`font-medium ${
                          valueDifference > 0 ? 'text-green-600' : valueDifference < 0 ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {valueDifference > 0 ? '+' : ''}{formatNaira(Math.abs(valueDifference))}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <Badge 
                  variant={isValueFair ? "default" : "secondary"} 
                  className="mt-2"
                >
                  {isValueFair ? "Fair Trade" : "Value Difference"}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Trade Coin Balancing Suggestion (Physical Items Only) */}
          {showPhysicalItemsOnly && selectedItems.length > 0 && needsBalancing() && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-100">
                        <span className="text-amber-600 font-bold text-sm">!</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900">Value Gap Detected</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Your items are worth {formatNaira(calculatePhysicalItemsValue())} but the target item is worth {formatNaira(targetValue)}.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Recommended Trade Coins:</span>
                      <span className="font-medium text-[#073232]">{getBalancingSuggestion().required} TC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Currently offering:</span>
                      <span className="font-medium text-[#073232]">{getSelectedTradeCoinAmount()} TC</span>
                    </div>
                    {getBalancingSuggestion().shortage > 0 && (
                      <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-gray-600">Still need:</span>
                        <span className="font-medium text-red-600">{getBalancingSuggestion().shortage} TC</span>
                      </div>
                    )}
                  </div>

                  {getBalancingSuggestion().shortage > 0 && (
                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={autoBalanceWithTradeCoins}
                    >
                      Add {getBalancingSuggestion().shortage} Trade Coins
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message */}
          <div>
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to your trade proposal..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || selectedItems.length === 0}
            >
              {isLoading ? "Sending..." : "Send Proposal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

