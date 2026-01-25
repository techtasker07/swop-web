import { createClient } from './client'
import type { 
  Profile, 
  Listing, 
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