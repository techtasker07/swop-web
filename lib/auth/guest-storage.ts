/**
 * Guest Storage System
 * Manages guest user data in localStorage and syncs with user account upon login
 */

export interface GuestData {
  favorites: number[]
  searches: string[]
  viewedListings: number[]
  preferences: {
    categories: string[]
    location: string | null
    priceRange: { min: number; max: number } | null
  }
  timestamp: number
}

const GUEST_STORAGE_KEY = 'swopify_guest_data'
const STORAGE_EXPIRY = 30 * 24 * 60 * 60 * 1000 // 30 days

export class GuestStorage {
  private static instance: GuestStorage
  private data: GuestData

  private constructor() {
    this.data = this.loadGuestData()
  }

  static getInstance(): GuestStorage {
    if (!GuestStorage.instance) {
      GuestStorage.instance = new GuestStorage()
    }
    return GuestStorage.instance
  }

  private loadGuestData(): GuestData {
    if (typeof window === 'undefined') {
      return this.getDefaultData()
    }

    try {
      const stored = localStorage.getItem(GUEST_STORAGE_KEY)
      if (!stored) return this.getDefaultData()

      const parsed = JSON.parse(stored) as GuestData
      
      // Check if data is expired
      if (Date.now() - parsed.timestamp > STORAGE_EXPIRY) {
        this.clearGuestData()
        return this.getDefaultData()
      }

      return parsed
    } catch (error) {
      console.error('Error loading guest data:', error)
      return this.getDefaultData()
    }
  }

  private getDefaultData(): GuestData {
    return {
      favorites: [],
      searches: [],
      viewedListings: [],
      preferences: {
        categories: [],
        location: null,
        priceRange: null
      },
      timestamp: Date.now()
    }
  }

  private saveData(): void {
    if (typeof window === 'undefined') return

    try {
      this.data.timestamp = Date.now()
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(this.data))
    } catch (error) {
      console.error('Error saving guest data:', error)
    }
  }

  // Favorites management
  addFavorite(listingId: number): void {
    if (!this.data.favorites.includes(listingId)) {
      this.data.favorites.push(listingId)
      this.saveData()
    }
  }

  removeFavorite(listingId: number): void {
    this.data.favorites = this.data.favorites.filter(id => id !== listingId)
    this.saveData()
  }

  isFavorited(listingId: number): boolean {
    return this.data.favorites.includes(listingId)
  }

  getFavorites(): number[] {
    return [...this.data.favorites]
  }

  // Search history
  addSearch(query: string): void {
    const trimmed = query.trim()
    if (!trimmed) return

    // Remove if already exists and add to front
    this.data.searches = this.data.searches.filter(s => s !== trimmed)
    this.data.searches.unshift(trimmed)
    
    // Keep only last 10 searches
    this.data.searches = this.data.searches.slice(0, 10)
    this.saveData()
  }

  getSearchHistory(): string[] {
    return [...this.data.searches]
  }

  clearSearchHistory(): void {
    this.data.searches = []
    this.saveData()
  }

  // Viewed listings
  addViewedListing(listingId: number): void {
    if (!this.data.viewedListings.includes(listingId)) {
      this.data.viewedListings.unshift(listingId)
      
      // Keep only last 50 viewed listings
      this.data.viewedListings = this.data.viewedListings.slice(0, 50)
      this.saveData()
    }
  }

  getViewedListings(): number[] {
    return [...this.data.viewedListings]
  }

  // Preferences
  updatePreferences(preferences: Partial<GuestData['preferences']>): void {
    this.data.preferences = { ...this.data.preferences, ...preferences }
    this.saveData()
  }

  getPreferences(): GuestData['preferences'] {
    return { ...this.data.preferences }
  }

  // Data management
  getAllData(): GuestData {
    return { ...this.data }
  }

  clearGuestData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_STORAGE_KEY)
    }
    this.data = this.getDefaultData()
  }

  // Sync with user account
  async syncWithUserAccount(userId: string): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      // This would typically make API calls to sync data
      // For now, we'll just clear the guest data after successful sync
      console.log('Syncing guest data with user account:', userId, this.data)
      
      // TODO: Implement actual sync logic with Supabase
      // - Sync favorites to user's favorites table
      // - Save search history to user preferences
      // - Update user preferences
      
      // Clear guest data after successful sync
      this.clearGuestData()
    } catch (error) {
      console.error('Error syncing guest data:', error)
      throw error
    }
  }

  // Analytics helpers
  getAnalytics() {
    return {
      totalFavorites: this.data.favorites.length,
      totalSearches: this.data.searches.length,
      totalViewedListings: this.data.viewedListings.length,
      hasPreferences: Object.values(this.data.preferences).some(v => 
        v !== null && (Array.isArray(v) ? v.length > 0 : true)
      ),
      daysSinceFirstUse: Math.floor((Date.now() - this.data.timestamp) / (24 * 60 * 60 * 1000))
    }
  }
}

// Convenience functions
export const guestStorage = GuestStorage.getInstance()

export const useGuestStorage = () => {
  return {
    addFavorite: (id: number) => guestStorage.addFavorite(id),
    removeFavorite: (id: number) => guestStorage.removeFavorite(id),
    isFavorited: (id: number) => guestStorage.isFavorited(id),
    getFavorites: () => guestStorage.getFavorites(),
    addSearch: (query: string) => guestStorage.addSearch(query),
    getSearchHistory: () => guestStorage.getSearchHistory(),
    addViewedListing: (id: number) => guestStorage.addViewedListing(id),
    getViewedListings: () => guestStorage.getViewedListings(),
    updatePreferences: (prefs: Partial<GuestData['preferences']>) => guestStorage.updatePreferences(prefs),
    getPreferences: () => guestStorage.getPreferences(),
    syncWithUser: (userId: string) => guestStorage.syncWithUserAccount(userId),
    clearData: () => guestStorage.clearGuestData(),
    getAnalytics: () => guestStorage.getAnalytics()
  }
}