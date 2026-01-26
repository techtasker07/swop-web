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
import type { Listing, Profile } from "@/lib/types/database"
import { XIcon } from "lucide-react"

interface ProposeTradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetListing: Listing & { seller: Profile }
  user: any
}

interface TradeItem {
  type: 'listing' | 'cash' | 'service'
  listing_id?: number
  listing?: Listing
  cash_amount?: number
  service_description?: string
  service_hours?: number
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

  useEffect(() => {
    if (open && user) {
      fetchUserListings()
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
        })
        .select()
        .single()

      if (tradeError) throw tradeError

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
                            <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                              <ClockIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{item.service_description}</p>
                              <p className="text-xs text-blue-600">{item.service_hours}h service</p>
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