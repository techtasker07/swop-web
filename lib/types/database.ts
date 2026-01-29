export interface Profile {
  id: string
  email: string
  display_name: string
  username: string | null
  bio: string
  profile_image_url: string | null
  avatar_url: string | null
  phone_number: string | null
  location: {
    city?: string
    state?: string
    country?: string
    lat?: number
    lng?: number
  } | null
  user_type: 'personal' | 'business'
  kyc_verified: boolean
  barter_score: number
  gift_cards: number
  time_credits: number
  is_premium: boolean
  premium_expires_at: string | null
  average_rating: number
  total_ratings: number
  successful_trades: number
  // Business fields
  business_name: string | null
  business_type: string | null
  business_description: string | null
  logo_url: string | null
  banner_url: string | null
  business_website: string | null
  business_phone: string | null
  business_email: string | null
  year_established: number | null
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
  metadata: any | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  description: string | null
  icon_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Listing {
  id: number
  seller_id: string
  title: string
  description: string
  category: string
  subcategory: string | null
  type: 'item' | 'service'
  condition: string | null
  price: number
  location: string
  images: string[]
  tags: string[]
  preferred_items: string[]
  interest: string[]
  preferred_swap_district: string | null
  is_available: boolean
  is_featured: boolean
  view_count: number
  favorite_count: number
  trade_count: number
  coordinates: { lat: number; lng: number } | null
  // Time banking fields for services
  time_period: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'project' | 'custom' | null
  duration_hours: number | null
  availability_schedule: any | null
  metadata: any | null
  created_at: string
  updated_at: string
  // Joined data
  seller?: Profile
  listing_images?: ListingImage[]
  favorites?: Favorite[]
  _count?: {
    favorites: number
    trade_items: number
  }
}

export interface ListingImage {
  id: number
  listing_id: number
  url: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface Trade {
  id: string
  proposer_id: string
  receiver_id: string
  target_listing_id?: number
  message: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'expired'
  proposer_items: any
  receiver_items: any | null
  estimated_value?: number
  agreed_value?: number | null
  meeting_location: string | null
  meeting_time: string | null
  completion_notes?: string | null
  completion_code?: string | null
  rejection_reason?: string | null
  metadata: any | null
  created_at: string
  updated_at: string
  completed_at?: string | null
  // Joined data
  proposer?: Profile
  receiver?: Profile
  target_listing?: Listing
  trade_items?: TradeItem[]
  conversation?: Conversation
}

export interface TradeItem {
  id: number
  trade_id: string
  listing_id: number | null
  owner_id: string
  title: string
  description: string | null
  estimated_value: number | null
  condition: string | null
  images: string[]
  is_proposer_item: boolean
  created_at: string
  // Joined data
  listing?: Listing
  owner?: Profile
}

export interface Conversation {
  id: string
  participants: string[]
  listing_id: number | null
  trade_id: string | null
  last_message_id?: string | null
  last_message_at?: string
  last_message_time?: string | null
  is_active?: boolean
  metadata: any | null
  created_at: string
  updated_at: string
  // Joined data
  listing?: Listing
  trade?: Trade
  messages?: Message[]
  other_participant?: Profile
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'file' | 'trade_offer' | 'system'
  media_url?: string | null
  attachments?: string[]
  is_read: boolean
  is_system_message?: boolean
  reply_to?: string | null
  metadata: any | null
  created_at: string
  updated_at?: string
  // Joined data
  sender?: Profile
}

export interface Rating {
  id: number
  rater_id: string
  rated_user_id: string
  trade_id: string
  score: number
  comment: string | null
  is_anonymous: boolean
  created_at: string
  // Joined data
  rater?: Profile
  trade?: Trade
}

export interface Notification {
  id: number
  user_id: string
  title: string
  message: string
  type: 'trade_request' | 'trade_accepted' | 'trade_completed' | 'new_message' | 'rating_received' | 'system'
  reference_id: string | null
  is_read: boolean
  action_url: string | null
  metadata: any | null
  created_at: string
}

export interface TimeBankingRequest {
  id: number
  requester_id: string
  provider_id: string | null
  title: string
  description: string
  category: string
  hours_requested: number
  status: 'open' | 'accepted' | 'completed' | 'cancelled'
  location: string | null
  meeting_time: string | null
  completion_code: string | null
  rejection_reason: string | null
  requester_name: string | null
  provider_name: string | null
  provider_message: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  // Joined data
  requester?: Profile
  provider?: Profile
}

export interface TimeBankingTransaction {
  id: number
  user_id: string
  transaction_type: 'earned' | 'spent'
  hours: number
  description: string
  related_request_id: number | null
  related_user_id: string | null
  created_at: string
  // Joined data
  user?: Profile
  related_request?: TimeBankingRequest
  related_user?: Profile
}

export interface Favorite {
  id: string
  user_id: string
  listing_id: number
  created_at: string
  // Joined data
  listing?: Listing
}

// Utility types
export type ListingStatus = 'active' | 'inactive' | 'in_trade' | 'completed'
export type UserType = 'personal' | 'business'
export type ListingType = 'item' | 'service'
export type TradeStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' | 'expired'
export type MessageType = 'text' | 'image' | 'file' | 'trade_offer' | 'system'
export type NotificationType = 'trade_request' | 'trade_accepted' | 'trade_completed' | 'new_message' | 'rating_received' | 'system'

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  total_pages: number
}

// Form types
export interface CreateListingData {
  title: string
  description: string
  category: string
  subcategory?: string
  type: ListingType
  condition?: string
  price: number
  location: string
  images: string[]
  tags: string[]
  preferred_items: string[]
  time_period?: string
  duration_hours?: number
  availability_schedule?: any
}

export interface UpdateProfileData {
  display_name?: string
  username?: string
  bio?: string
  profile_image_url?: string
  phone_number?: string
  location?: any
  business_name?: string
  business_type?: string
  business_description?: string
  logo_url?: string
  banner_url?: string
  business_website?: string
  business_phone?: string
  year_established?: number
}

export interface CreateTradeData {
  receiver_id: string
  message?: string
  proposer_items: any
  receiver_items?: any
  meeting_location?: string
  meeting_time?: string
}
