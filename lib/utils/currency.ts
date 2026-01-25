/**
 * Currency utilities for Nigerian Naira (NGN)
 */

export const CURRENCY = {
  code: 'NGN',
  symbol: '₦',
  name: 'Nigerian Naira',
  locale: 'en-NG'
} as const

/**
 * Format a number as Nigerian Naira currency
 */
export function formatNaira(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) return '₦0'
  
  // Use Nigerian locale formatting
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numAmount)
}

/**
 * Format a number as Nigerian Naira with custom formatting
 */
export function formatNairaCustom(amount: number | string, options?: {
  showSymbol?: boolean
  showDecimals?: boolean
  compact?: boolean
}): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) return options?.showSymbol !== false ? '₦0' : '0'
  
  const { showSymbol = true, showDecimals = true, compact = false } = options || {}
  
  let formatted: string
  
  if (compact && numAmount >= 1000000) {
    // Format as millions (e.g., ₦2.5M)
    formatted = (numAmount / 1000000).toFixed(1) + 'M'
  } else if (compact && numAmount >= 1000) {
    // Format as thousands (e.g., ₦150K)
    formatted = (numAmount / 1000).toFixed(1) + 'K'
  } else {
    // Regular formatting
    formatted = new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: showDecimals ? 0 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    }).format(numAmount)
  }
  
  return showSymbol ? `₦${formatted}` : formatted
}

/**
 * Parse a currency string to number
 */
export function parseNaira(currencyString: string): number {
  // Remove currency symbol and commas, then parse
  const cleaned = currencyString.replace(/[₦,\s]/g, '')
  return parseFloat(cleaned) || 0
}

/**
 * Format large amounts in a compact way (e.g., ₦300B for billions)
 */
export function formatNairaCompact(amount: number): string {
  if (amount >= 1000000000) {
    return `₦${(amount / 1000000000).toFixed(1)}B`
  }
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(1)}K`
  }
  return formatNaira(amount)
}

/**
 * Validate if a string is a valid currency amount
 */
export function isValidNairaAmount(value: string): boolean {
  const cleaned = value.replace(/[₦,\s]/g, '')
  const num = parseFloat(cleaned)
  return !isNaN(num) && num >= 0
}