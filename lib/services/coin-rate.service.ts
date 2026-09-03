/**
 * Coin Rate Service for Next.js/Web App
 * Handles fetching and caching dynamic coin rates from the API
 */

export interface CoinRateSettings {
  tradeCoinNairaRate: number;
  serviceCoinNairaRate: number;
  updatedAt: string;
  source?: string;
}

class CoinRateService {
  private static instance: CoinRateService;
  private cachedRates: CoinRateSettings | null = null;
  private lastFetchTime: Date | null = null;
  private readonly cacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Defaults
  static readonly DEFAULT_TC_RATE = 1000; // 1 TC = 1000 NGN
  static readonly DEFAULT_SC_RATE = 800;  // 1 SC = 800 NGN

  /**
   * Get singleton instance
   */
  static getInstance(): CoinRateService {
    if (!CoinRateService.instance) {
      CoinRateService.instance = new CoinRateService();
    }
    return CoinRateService.instance;
  }

  /**
   * Fetch coin rates from API
   * Uses cache if available and not stale
   */
  async getCoinRates(forceRefresh = false): Promise<CoinRateSettings> {
    try {
      // Check if cache is valid
      if (!forceRefresh && this.cachedRates && this.lastFetchTime) {
        const timeSinceCache = Date.now() - this.lastFetchTime.getTime();
        if (timeSinceCache < this.cacheDuration) {
          console.log(
            `📊 Using cached coin rates (age: ${Math.round(timeSinceCache / 1000)}s)`
          );
          return this.cachedRates;
        }
      }

      console.log('🔄 Fetching fresh coin rates from API...');

      const response = await fetch('/api/coin-rates', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Don't cache at HTTP level
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const rates: CoinRateSettings = await response.json();

      // Cache the rates
      this.cachedRates = rates;
      this.lastFetchTime = new Date();

      console.log('✅ Coin rates fetched:', {
        tradeCoinNairaRate: rates.tradeCoinNairaRate,
        serviceCoinNairaRate: rates.serviceCoinNairaRate,
        source: rates.source,
      });

      return rates;
    } catch (error) {
      console.error('⚠️ Error fetching coin rates:', error);
      console.log(
        `   Using default rates: TC=${CoinRateService.DEFAULT_TC_RATE} NGN, SC=${CoinRateService.DEFAULT_SC_RATE} NGN`
      );

      // Return defaults on error
      const defaultRates: CoinRateSettings = {
        tradeCoinNairaRate: CoinRateService.DEFAULT_TC_RATE,
        serviceCoinNairaRate: CoinRateService.DEFAULT_SC_RATE,
        updatedAt: new Date().toISOString(),
        source: 'default',
      };

      // Cache defaults too
      this.cachedRates = defaultRates;
      this.lastFetchTime = new Date();

      return defaultRates;
    }
  }

  /**
   * Get Trade Coin to Naira rate
   */
  async getTradeCoinRate(): Promise<number> {
    const rates = await this.getCoinRates();
    return rates.tradeCoinNairaRate;
  }

  /**
   * Get Service Coin to Naira rate
   */
  async getServiceCoinRate(): Promise<number> {
    const rates = await this.getCoinRates();
    return rates.serviceCoinNairaRate;
  }

  /**
   * Convert Trade Coins to Naira
   */
  async tradeCoinToNaira(coins: number): Promise<number> {
    const rate = await this.getTradeCoinRate();
    return coins * rate;
  }

  /**
   * Convert Service Coins to Naira
   */
  async serviceCoinToNaira(coins: number): Promise<number> {
    const rate = await this.getServiceCoinRate();
    return coins * rate;
  }

  /**
   * Convert Naira to Trade Coins
   */
  async nairaToTradeCoin(naira: number): Promise<number> {
    const rate = await this.getTradeCoinRate();
    return naira / rate;
  }

  /**
   * Convert Naira to Service Coins
   */
  async nairaToServiceCoin(naira: number): Promise<number> {
    const rate = await this.getServiceCoinRate();
    return naira / rate;
  }

  /**
   * Get cached rates without fetching (returns null if not cached)
   */
  getCachedRates(): CoinRateSettings | null {
    return this.cachedRates;
  }

  /**
   * Clear cache to force refresh on next fetch
   */
  clearCache(): void {
    this.cachedRates = null;
    this.lastFetchTime = null;
    console.log('🗑️ Coin rate cache cleared');
  }

  /**
   * Update coin rates (admin only)
   * Should only be called from admin panel
   */
  async updateCoinRates(
    tradeCoinNairaRate: number,
    serviceCoinNairaRate: number
  ): Promise<CoinRateSettings> {
    try {
      const response = await fetch('/api/coin-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tradeCoinNairaRate,
          serviceCoinNairaRate,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const result = await response.json();

      // Clear cache to force refresh
      this.clearCache();

      console.log('✅ Coin rates updated:', result);

      // Fetch fresh rates
      return this.getCoinRates(true);
    } catch (error) {
      console.error('❌ Error updating coin rates:', error);
      throw error;
    }
  }
}

/**
 * Export singleton instance
 */
export const coinRateService = CoinRateService.getInstance();

/**
 * React Hook for using coin rates in components
 */
export function useCoinRates() {
  const [rates, setRates] = React.useState<CoinRateSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const data = await coinRateService.getCoinRates();
        setRates(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setRates(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  return { rates, loading, error };
}

// Need to import React for the hook
import React from 'react';
