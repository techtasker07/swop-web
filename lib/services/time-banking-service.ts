import { createClient } from '@/lib/supabase/client'

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
  requester?: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  provider?: {
    id: string
    display_name: string
    avatar_url: string | null
  }
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
}

export interface TimeBankingBalance {
  total_balance: number
  earned_hours: number
  spent_hours: number
}

export class TimeBankingService {
  private supabase = createClient()

  /**
   * Get time banking requests with optional filters
   */
  async getRequests(filters?: {
    userId?: string
    isRequester?: boolean
    isProvider?: boolean
    status?: string
  }): Promise<TimeBankingRequest[]> {
    let query = this.supabase
      .from('time_banking_requests')
      .select(`
        *,
        requester:profiles!requester_id(id, display_name, avatar_url),
        provider:profiles!provider_id(id, display_name, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (filters?.userId) {
      if (filters.isRequester) {
        query = query.eq('requester_id', filters.userId)
      } else if (filters.isProvider) {
        query = query.eq('provider_id', filters.userId)
      }
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  /**
   * Get available requests (open status, no provider, not user's own)
   */
  async getAvailableRequests(userId: string): Promise<TimeBankingRequest[]> {
    const { data, error } = await this.supabase
      .from('time_banking_requests')
      .select(`
        *,
        requester:profiles!requester_id(id, display_name, avatar_url)
      `)
      .eq('status', 'open')
      .is('provider_id', null)
      .neq('requester_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get user's time banking balance
   */
  async getUserBalance(userId: string): Promise<TimeBankingBalance> {
    const { data, error} = await this.supabase
      .from('time_banking_transactions')
      .select('transaction_type, hours')
      .eq('user_id', userId)

    if (error) throw error

    const transactions = data || []
    let earned = 0
    let spent = 0

    transactions.forEach((tx: any) => {
      if (tx.transaction_type === 'earned') {
        earned += tx.hours
      } else {
        spent += tx.hours
      }
    })

    return {
      total_balance: earned - spent,
      earned_hours: earned,
      spent_hours: spent,
    }
  }

  /**
   * Create a new time banking request
   */
  async createRequest(request: {
    title: string
    description: string
    category: string
    hours_requested: number
    location: string
    requester_id: string
    requester_name: string
  }): Promise<TimeBankingRequest> {
    const { data, error } = await this.supabase
      .from('time_banking_requests')
      .insert({
        ...request,
        status: 'open',
      })
      .select(`
        *,
        requester:profiles!requester_id(id, display_name, avatar_url)
      `)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Accept a request (offer help)
   */
  async acceptRequest(
    requestId: number,
    providerId: string,
    providerName: string,
    message?: string
  ): Promise<TimeBankingRequest> {
    const { data, error } = await this.supabase
      .from('time_banking_requests')
      .update({
        provider_id: providerId,
        provider_name: providerName,
        provider_message: message,
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .eq('status', 'open')
      .is('provider_id', null)
      .select(`
        *,
        requester:profiles!requester_id(id, display_name, avatar_url),
        provider:profiles!provider_id(id, display_name, avatar_url)
      `)
      .single()

    if (error) throw error
    return data
  }

  /**
   * Generate completion code for a request
   */
  generateCompletionCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * Set completion code (requester initiates completion)
   */
  async setCompletionCode(requestId: number, code: string): Promise<void> {
    const { error } = await this.supabase
      .from('time_banking_requests')
      .update({
        completion_code: code,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .eq('status', 'accepted')

    if (error) throw error
  }

  /**
   * Complete a request with verification code
   */
  async completeRequest(
    requestId: number,
    code: string,
    providerId: string
  ): Promise<TimeBankingRequest> {
    // First, verify the code
    const { data: request, error: fetchError } = await this.supabase
      .from('time_banking_requests')
      .select('*')
      .eq('id', requestId)
      .eq('provider_id', providerId)
      .eq('status', 'accepted')
      .single()

    if (fetchError) throw fetchError
    if (!request) throw new Error('Request not found')
    if (request.completion_code !== code) {
      throw new Error('Invalid completion code')
    }

    // Update request status
    const { data, error } = await this.supabase
      .from('time_banking_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select(`
        *,
        requester:profiles!requester_id(id, display_name, avatar_url),
        provider:profiles!provider_id(id, display_name, avatar_url)
      `)
      .single()

    if (error) throw error

    // Create transactions for both users
    await this.createTransactions(data)

    return data
  }

  /**
   * Create transactions for completed request
   */
  private async createTransactions(request: TimeBankingRequest): Promise<void> {
    const transactions = [
      // Provider earns hours
      {
        user_id: request.provider_id,
        transaction_type: 'earned',
        hours: request.hours_requested,
        description: `Helped with: ${request.title}`,
        related_request_id: request.id,
        related_user_id: request.requester_id,
      },
      // Requester spends hours
      {
        user_id: request.requester_id,
        transaction_type: 'spent',
        hours: request.hours_requested,
        description: `Received help: ${request.title}`,
        related_request_id: request.id,
        related_user_id: request.provider_id,
      },
    ]

    const { error } = await this.supabase
      .from('time_banking_transactions')
      .insert(transactions)

    if (error) throw error
  }

  /**
   * Cancel a request
   */
  async cancelRequest(
    requestId: number,
    userId: string,
    reason?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('time_banking_requests')
      .update({
        status: 'cancelled',
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .or(`requester_id.eq.${userId},provider_id.eq.${userId}`)
      .in('status', ['open', 'accepted'])

    if (error) throw error
  }

  /**
   * Get user's transaction history
   */
  async getTransactions(userId: string): Promise<TimeBankingTransaction[]> {
    const { data, error } = await this.supabase
      .from('time_banking_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get request details
   */
  async getRequestDetails(requestId: number): Promise<TimeBankingRequest> {
    const { data, error } = await this.supabase
      .from('time_banking_requests')
      .select(`
        *,
        requester:profiles!requester_id(id, display_name, avatar_url),
        provider:profiles!provider_id(id, display_name, avatar_url)
      `)
      .eq('id', requestId)
      .single()

    if (error) throw error
    return data
  }
}

export const timeBankingService = new TimeBankingService()
