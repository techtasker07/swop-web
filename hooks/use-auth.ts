"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { guestStorage } from '@/lib/auth/guest-storage'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isGuest: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isGuest: true
  })

  const supabase = createClient()

  const loadProfile = useCallback(async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return null
      }

      return profile as Profile
    } catch (error) {
      console.error('Error loading profile:', error)
      return null
    }
  }, [supabase])

  const syncGuestData = useCallback(async (userId: string) => {
    try {
      const guestData = guestStorage.getAllData()
      
      // Only sync if there's meaningful guest data
      if (guestData.favorites.length > 0 || guestData.searches.length > 0) {
        console.log('Syncing guest data for user:', userId)
        
        // Sync favorites
        if (guestData.favorites.length > 0) {
          const favoritesToSync = guestData.favorites.map(listingId => ({
            user_id: userId,
            listing_id: listingId
          }))

          await supabase
            .from('favorites')
            .upsert(favoritesToSync, { onConflict: 'user_id,listing_id' })
        }

        // Sync preferences (could be stored in user profile or separate table)
        if (guestData.preferences.location || guestData.preferences.categories.length > 0) {
          await supabase
            .from('profiles')
            .update({
              location: guestData.preferences.location,
              interests: guestData.preferences.categories
            })
            .eq('id', userId)
        }

        // Clear guest data after successful sync
        guestStorage.clearGuestData()
        
        console.log('Guest data synced successfully')
      }
    } catch (error) {
      console.error('Error syncing guest data:', error)
      // Don't throw error - sync failure shouldn't prevent login
    }
  }, [supabase])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        // Sync guest data in background
        syncGuestData(data.user.id)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }, [supabase.auth, syncGuestData])

  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) throw error

      if (data.user) {
        // Sync guest data in background
        syncGuestData(data.user.id)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }, [supabase.auth, syncGuestData])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Reset to guest state
      setAuthState({
        user: null,
        profile: null,
        isLoading: false,
        isGuest: true
      })

      return { error: null }
    } catch (error) {
      return { error }
    }
  }, [supabase.auth])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!authState.user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single()

      if (error) throw error

      setAuthState(prev => ({
        ...prev,
        profile: data as Profile
      }))

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }, [authState.user, supabase])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!mounted) return

        if (user) {
          const profile = await loadProfile(user)
          setAuthState({
            user,
            profile,
            isLoading: false,
            isGuest: false
          })
        } else {
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
            isGuest: true
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
            isGuest: true
          })
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (session?.user) {
          const profile = await loadProfile(session.user)
          setAuthState({
            user: session.user,
            profile,
            isLoading: false,
            isGuest: false
          })

          // Sync guest data on sign in
          if (event === 'SIGNED_IN') {
            syncGuestData(session.user.id)
          }
        } else {
          setAuthState({
            user: null,
            profile: null,
            isLoading: false,
            isGuest: true
          })
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth, loadProfile, syncGuestData])

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    // Guest utilities
    guestAnalytics: guestStorage.getAnalytics(),
    hasGuestData: () => {
      const analytics = guestStorage.getAnalytics()
      return analytics.totalFavorites > 0 || analytics.totalSearches > 0
    }
  }
}