import { createClient } from './client'
import type { 
  Profile, 
  Listing, 
  ListingImage,
  Category, 
  Trade, 
  Conversation, 
  Message, 
  TimeBankingRequest,
  CreateListingData,
  UpdateProfileData,
  CreateTradeData
} from '@/lib/types/database'

const supabase = createClient()

// Categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) throw error
  return data as Category[]
}

// Listings
export async function getListings({
  category,
  search,
  sort = 'recent',
  limit = 20,
  offset = 0
}: {
  category?: string
  search?: string
  sort?: string
  limit?: number
  offset?: number
} = {}) {
  let query = supabase
    .from('listings')
    .select(`
      *,
      seller:profiles!seller_id(id, display_name, avatar_url, average_rating, verification_status),
      listing_images(url, is_primary, sort_order),
      _count:favorites(count)
    `)
    .eq('is_available', true)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Apply sorting
  switch (sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'featured':
      query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query.range(offset, offset + limit - 1)

  if (error) throw error
  return data as (Listing & { 
    seller: Profile
    listing_images: { url: string; is_primary: boolean; sort_order: number }[]
    _count: { favorites: number }
  })[]
}

export async function getListing(id: number) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles!seller_id(*),
      listing_images(url, is_primary, sort_order)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Listing & { 
    seller: Profile
    listing_images: { url: string; is_primary: boolean; sort_order: number }[]
  }
}

export async function createListing(data: CreateListingData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      ...data,
      seller_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return listing as Listing
}

export async function updateListing(id: number, data: Partial<CreateListingData>) {
  const { data: listing, error } = await supabase
    .from('listings')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return listing as Listing
}

export async function deleteListing(id: number) {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getUserListings(userId?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  const targetUserId = userId || user?.id
  if (!targetUserId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      listing_images(url, is_primary, sort_order),
      _count:favorites(count)
    `)
    .eq('seller_id', targetUserId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (Listing & { 
    listing_images: { url: string; is_primary: boolean; sort_order: number }[]
    _count: { favorites: number }
  })[]
}

// Profiles
export async function getProfile(userId?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  const targetUserId = userId || user?.id
  if (!targetUserId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUserId)
    .single()

  if (error) throw error
  return data as Profile
}

export async function updateProfile(data: UpdateProfileData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return profile as Profile
}

// Favorites
export async function toggleFavorite(listingId: number) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('listing_id', listingId)
    .single()

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId)

    if (error) throw error
    return false
  } else {
    // Add favorite
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        listing_id: listingId
      })

    if (error) throw error
    return true
  }
}

export async function getUserFavorites() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      listing:listings(
        *,
        seller:profiles!seller_id(id, display_name, avatar_url),
        listing_images(url, is_primary, sort_order)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Trades
export async function createTrade(data: CreateTradeData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: trade, error } = await supabase
    .from('trades')
    .insert({
      ...data,
      proposer_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return trade as Trade
}

export async function getUserTrades() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('trades')
    .select(`
      *,
      proposer:profiles!proposer_id(id, display_name, avatar_url),
      receiver:profiles!receiver_id(id, display_name, avatar_url)
    `)
    .or(`proposer_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (Trade & {
    proposer: Profile
    receiver: Profile
  })[]
}

export async function updateTradeStatus(tradeId: string, status: string) {
  const { data: trade, error } = await supabase
    .from('trades')
    .update({ status })
    .eq('id', tradeId)
    .select()
    .single()

  if (error) throw error
  return trade as Trade
}

// Conversations & Messages
export async function getConversations() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages!inner(
        id,
        content,
        created_at,
        sender_id,
        is_read
      )
    `)
    .contains('participants', [user.id])
    .eq('is_active', true)
    .order('last_message_time', { ascending: false })

  if (error) throw error
  return data as Conversation[]
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!sender_id(id, display_name, avatar_url)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as (Message & { sender: Profile })[]
}

export async function sendMessage(conversationId: string, content: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content
    })
    .select()
    .single()

  if (error) throw error
  return message as Message
}

// Time Banking
export async function getTimeBankingRequests(status?: string) {
  let query = supabase
    .from('time_banking_requests')
    .select(`
      *,
      requester:profiles!requester_id(id, display_name, avatar_url),
      provider:profiles!provider_id(id, display_name, avatar_url)
    `)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return data as (TimeBankingRequest & {
    requester: Profile
    provider: Profile | null
  })[]
}

export async function createTimeBankingRequest(data: {
  title: string
  description: string
  category: string
  hours_requested: number
  location?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: request, error } = await supabase
    .from('time_banking_requests')
    .insert({
      ...data,
      requester_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return request as TimeBankingRequest
}

// File Upload
export async function uploadFile(file: File, bucket: string, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

// B2B Methods - Get current user's own business listings
export async function getB2BListings({
  category,
  search,
  sort = 'recent',
  limit = 20,
  offset = 0
}: {
  category?: string
  search?: string
  sort?: string
  limit?: number
  offset?: number
} = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('No authenticated user for B2B listings')
      return []
    }

    // Define business-specific categories
    const businessCategories = [
      'Professional Services',
      'Technology Services', 
      'Marketing & Advertising',
      'Construction & Trades',
      'Business Equipment',
      'Office Equipment',
      'Logistics & Transportation',
      'Financial Services',
      'Manufacturing & Production',
      'Training & Education',
      'Health & Safety',
      'Consulting',
      'Legal Services',
      'Accounting',
      'IT Services',
      'Business Consulting'
    ]

    let query = supabase
      .from('listings')
      .select(`
        *,
        seller:profiles!seller_id(
          id, 
          display_name, 
          avatar_url, 
          user_type, 
          business_name, 
          business_type, 
          business_description,
          verification_status,
          logo_url,
          banner_url,
          average_rating
        ),
        listing_images(id, listing_id, url, alt_text, is_primary, sort_order, created_at)
      `)
      .eq('is_available', true)
      .eq('seller_id', user.id) // Only get current user's listings

    if (category && category !== 'all') {
      query = query.eq('category', category)
    } else {
      // Filter by business categories if no specific category is selected
      query = query.in('category', businessCategories)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'featured':
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching B2B listings:', error)
      return []
    }
    
    // Ensure the user is a business user (additional safety check)
    const userBusinessListings = (data || []).filter(listing => 
      listing.seller && listing.seller.user_type === 'business'
    )
    
    return userBusinessListings as (Listing & { 
      seller: Profile
      listing_images: ListingImage[]
    })[]
  } catch (error) {
    console.error('Error in getB2BListings:', error)
    return []
  }
}

export async function getBusinessProfile(businessId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', businessId)
    .eq('user_type', 'business')
    .single()

  if (error) throw error
  return data as Profile
}

export async function getBusinessListings(businessId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      listing_images(url, is_primary, sort_order),
      _count:favorites(count)
    `)
    .eq('seller_id', businessId)
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as (Listing & { 
    listing_images: { url: string; is_primary: boolean; sort_order: number }[]
    _count: { favorites: number }
  })[]
}

export async function hasBusinessProfile(userId?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  const targetUserId = userId || user?.id
  if (!targetUserId) return false

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', targetUserId)
      .single()

    if (error) {
      console.error('Error checking business profile:', error)
      return false
    }

    return profile?.user_type === 'business'
  } catch (error) {
    console.error('Error checking business profile:', error)
    return false
  }
}

export async function createBusinessProfile(data: {
  business_name: string
  business_type: string
  business_description: string
  year_established?: number
  business_website?: string
  business_phone?: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile, error } = await supabase
    .from('profiles')
    .update({
      user_type: 'business',
      business_name: data.business_name,
      business_type: data.business_type,
      business_description: data.business_description,
      year_established: data.year_established,
      business_website: data.business_website,
      business_phone: data.business_phone,
      verification_status: 'unverified',
      kyc_verified: true
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return profile as Profile
}

// Search
export async function searchListings(query: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:profiles!seller_id(id, display_name, avatar_url),
      listing_images(url, is_primary, sort_order)
    `)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data as (Listing & { 
    seller: Profile
    listing_images: { url: string; is_primary: boolean; sort_order: number }[]
  })[]
}