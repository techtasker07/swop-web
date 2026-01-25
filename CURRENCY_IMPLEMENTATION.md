# Currency Implementation - Nigerian Naira (NGN)

## Overview
The Swopify platform has been configured to use Nigerian Naira (₦) as the primary currency throughout the application.

## Implementation Details

### Currency Utility (`lib/utils/currency.ts`)
- **Primary Function**: `formatNaira(amount)` - Formats numbers as Nigerian Naira
- **Custom Formatting**: `formatNairaCustom(amount, options)` - Advanced formatting with options
- **Compact Format**: `formatNairaCompact(amount)` - For large amounts (K, M, B suffixes)
- **Parser**: `parseNaira(currencyString)` - Converts currency strings back to numbers
- **Validator**: `isValidNairaAmount(value)` - Validates currency input

### Environment Configuration
Both Flutter and Next.js environments have been configured:

**Flutter (.env)**:
```
NEXT_PUBLIC_CURRENCY_CODE=NGN
NEXT_PUBLIC_CURRENCY_SYMBOL=₦
NEXT_PUBLIC_CURRENCY_LOCALE=en-NG
```

**Next.js (.env.local)**:
```
NEXT_PUBLIC_CURRENCY_CODE=NGN
NEXT_PUBLIC_CURRENCY_SYMBOL=₦
NEXT_PUBLIC_CURRENCY_LOCALE=en-NG
```

### Updated Components

#### Web Components (Next.js)
1. **ListingCard** - Now displays prices in Naira format
2. **HeroSection** - Updated statistics to show ₦300M+ value
3. **FeaturedListings** - Placeholder data uses realistic Naira amounts

#### Mobile Components (Flutter)
The Flutter app already had extensive Naira implementation:
- All listing screens show prices in ₦
- Gift card system uses Naira
- Time banking integration with Naira values
- Settings screen shows premium pricing in Naira

### Currency Formatting Examples

```typescript
import { formatNaira, formatNairaCompact, formatNairaCustom } from '@/lib/utils/currency'

// Basic formatting
formatNaira(45000) // "₦45,000.00"
formatNaira(1500) // "₦1,500.00"

// Compact formatting for large amounts
formatNairaCompact(1500000) // "₦1.5M"
formatNairaCompact(2500000000) // "₦2.5B"

// Custom formatting
formatNairaCustom(45000, { showDecimals: false }) // "₦45,000"
formatNairaCustom(45000, { compact: true }) // "₦45K"
```

### Database Considerations
- The database schema already supports NGN currency in business services
- Price fields are stored as DECIMAL(10,2) which supports Naira amounts
- Currency columns default to 'NGN' where applicable

### Localization
- Uses Nigerian English locale (`en-NG`) for proper number formatting
- Follows Nigerian currency conventions
- Supports both compact and full formatting styles

### Migration Notes
- Existing price data remains unchanged (stored as numbers)
- Display formatting automatically converts to Naira
- No database migration required for currency change
- All new entries will use NGN by default

## Usage Guidelines

1. **Always use the currency utilities** for displaying prices
2. **Store prices as numbers** in the database (no currency symbols)
3. **Use compact formatting** for large amounts in statistics
4. **Validate currency inputs** using the provided validator
5. **Maintain consistency** across all components

## Future Enhancements
- Multi-currency support (if needed for international expansion)
- Real-time exchange rate integration
- Currency conversion utilities
- Regional pricing variations