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
  coin_type?: 'STC' | 'DTC' | 'GTC'
  trade_coin_amount?: number
  // Time Banking fields
  time_banking_hours?: number
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
  const [selectedCoinType, setSelectedCoinType] = useState<'STC' | 'DTC' | 'GTC'>('STC')
  const [tradeCoinAmount, setTradeCoinAmount] = useState("")
  // Time Banking state
  const [timeBankingHours, setTimeBankingHours] = useState("")

  const isService = targetListing.type === 'service'

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
      // Validate balance
      const hasBalance = await tradeCoinService.validateBalance(user.id, selectedCoinType, amount)
      if (!hasBalance) {
        toast.error(`Insufficient ${selectedCoinType} balance`)
        return
      }

      setSelectedItems(prev => [...prev, {
        type: 'trade_coin',
        coin_type: selectedCoinType,
        trade_coin_amount: amount
      }])
      setTradeCoinAmount("")
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
        // Estimate Trade Coin value based on type
        const coinValue = item.coin_type === 'STC' ? 14.5 : item.coin_type === 'DTC' ? 34.5 : 54.5
        return total + ((item.trade_coin_amount || 0) * coinValue)
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
      // Check if trade involves Trade Coins
      const hasTradeCoin = selectedItems.some(item => item.type === 'trade_coin')
      let escrowId = null

      // Create trade proposal
      const { data: trade, error: tradeError } = await supabase
        .from("trades")
        .insert({
          proposer_id: user.id,
          receiver_id: targetListing.seller_id,
          target_listing_id: targetListing.id,
          message: message.trim(),
          status: 'pending',
          proposer_items: selectedItems,
          estimated_value: calculateTotalValue(),
          involves_trade_coins: hasTradeCoin,
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

      // Create notification for the seller
      await supabase
        .from("notifications")
        .insert({
          user_id: targetListing.seller_id,
          type: 'trade_proposal',
          title: 'New Trade Proposal',
          message: `${user.user_metadata?.display_name || 'Someone'} wants to trade for your ${targetListing.title}`,
          data: {
            trade_id: trade.id,
            listing_id: targetListing.id,
            proposer_name: user.user_metadata?.display_name || 'Anonymous'
          }
        })

      toast.success("Trade proposal sent successfully!")
      onOpenChange(false)
      router.push("/dashboard/trades")
    } catch (error) {
      console.error("Error creating trade proposal:", error)
      toast.error("Failed to send trade proposal. Please try again.")
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
            <span>Propose Trade</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
              <h3 className="font-medium text-foreground mb-3">You offer:</h3>
              
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
                            <div className={`h-10 w-10 rounded flex items-center justify-center ${
                              item.coin_type === 'STC' ? 'bg-gray-100' :
                              item.coin_type === 'DTC' ? 'bg-[#073232]/10' : 'bg-[#32cd32]/10'
                            }`}>
                              <CurrencyDollarIcon className={`h-5 w-5 ${
                                item.coin_type === 'STC' ? 'text-gray-600' :
                                item.coin_type === 'DTC' ? 'text-[#073232]' : 'text-[#32cd32]'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.coin_type} Trade Coins</p>
                              <p className={`text-xs ${
                                item.coin_type === 'STC' ? 'text-gray-600' :
                                item.coin_type === 'DTC' ? 'text-[#073232]' : 'text-[#32cd32]'
                              }`}>{item.trade_coin_amount} TC</p>
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

              {/* Add Items */}
              <div className="space-y-4">
                {/* Add Your Listings */}
                {userListings.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Add from your listings:</Label>
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

                {/* Add Cash */}
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

                {/* Add Service */}
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

                {/* Add Trade Coins */}
                <div>
                  <Label className="text-sm font-medium">Pay with Trade Coins:</Label>
                  {tradeCoinBalance && (
                    <div className="flex items-center space-x-2 mt-1 mb-2 text-xs text-muted-foreground">
                      <span>Balance:</span>
                      <span className="font-medium">STC: {tradeCoinBalance.stc_balance}</span>
                      <span className="font-medium">DTC: {tradeCoinBalance.dtc_balance}</span>
                      <span className="font-medium">GTC: {tradeCoinBalance.gtc_balance}</span>
                    </div>
                  )}
                  <div className="space-y-2 mt-1">
                    <Select value={selectedCoinType} onValueChange={(value: 'STC' | 'DTC' | 'GTC') => setSelectedCoinType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STC">Silver Trade Coin (STC)</SelectItem>
                        <SelectItem value="DTC">Diamond Trade Coin (DTC)</SelectItem>
                        <SelectItem value="GTC">Gold Trade Coin (GTC)</SelectItem>
                      </SelectContent>
                    </Select>
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