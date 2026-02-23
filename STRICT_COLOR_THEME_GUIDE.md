# Strict Color Theme Guide

## Brand Colors ONLY

The Swopify web app uses ONLY two brand colors:

1. **Primary Green**: `#32cd32` (Lime Green)
2. **Secondary Dark Cyan**: `#073232` (Dark Cyan)

## Color Usage Rules

### Allowed Colors:
- `#32cd32` - Primary green (buttons, highlights, success states)
- `#073232` - Dark cyan (headers, secondary elements)
- `#28a428` - Darker green (hover states for primary)
- `#0a4a4a` - Lighter cyan (gradients with dark cyan)
- White, Black, Gray shades (neutral colors for text, backgrounds, borders)
- Red (ONLY for errors/destructive actions)

### FORBIDDEN Colors:
- ❌ Blue (any shade)
- ❌ Purple (any shade)
- ❌ Amber/Yellow (any shade) - Replace with green
- ❌ Orange (any shade) - Replace with green or cyan
- ❌ Indigo (any shade)
- ❌ Green-500/600 (Tailwind greens) - Use brand green instead

## Replacement Guide

### Replace These Colors:

1. **Amber/Yellow** → Use `#32cd32` (green)
   - `bg-amber-*` → `bg-[#32cd32]/10` or `bg-[#32cd32]`
   - `text-amber-*` → `text-[#32cd32]`
   - `border-amber-*` → `border-[#32cd32]/30`

2. **Orange** → Use `#32cd32` (green) or `#073232` (cyan)
   - `bg-orange-*` → `bg-[#32cd32]/10`
   - `text-orange-*` → `text-[#32cd32]`
   - Pending states: Use cyan instead

3. **Green-500/600** → Use `#32cd32` (brand green)
   - `bg-green-500` → `bg-[#32cd32]`
   - `text-green-600` → `text-[#32cd32]`
   - `bg-green-100` → `bg-[#32cd32]/10`

4. **Yellow (Stars/Ratings)** → Use `#32cd32` (green)
   - `text-yellow-500` → `text-[#32cd32]`
   - `fill-yellow-400` → `fill-[#32cd32]`

## Component-Specific Changes Needed

### Trade Coins
- GTC (Gold Trade Coin): Change from amber to green
- All amber colors → green

### Ratings/Stars
- Star icons: Change from yellow to green
- Rating badges: Change from yellow to green

### Status Indicators
- Pending: Change from orange to cyan
- Success: Use brand green
- Completed: Use brand green

### Achievements/Badges
- Change yellow badges to green

### B2B Indicators
- Keep yellow ONLY for B2B "PRO" badge (exception for branding)

## Files That Need Updates

Based on search results, these files contain non-brand colors:

1. `components/trade-coins/wallet-display.tsx` - Amber colors
2. `components/trade-coins/marketplace.tsx` - Amber for GTC
3. `components/trade-coins/buy-dialog.tsx` - Orange for fees
4. `components/trade-coins/sell-dialog.tsx` - Orange for fees
5. `components/profile/profile-tabs.tsx` - Yellow achievements
6. `components/profile/profile-header.tsx` - Yellow stars
7. `components/profile/profile-stats.tsx` - Yellow ratings
8. `components/listings/listing-details.tsx` - Yellow stars
9. `components/listing-card.tsx` - Yellow stars, green-500
10. `components/trades/propose-trade-dialog.tsx` - Amber, green-600
11. `components/dashboard/recent-trades.tsx` - Orange pending, green-600
12. `components/dashboard/smart-matches.tsx` - Green-600
13. `components/dashboard/quick-actions.tsx` - Orange badge
14. `components/home/hero-section.tsx` - Green-500/600
15. `components/listings/create-listing-form.tsx` - Green-500
16. And more...

## Implementation Priority

1. **High Priority** (User-facing):
   - Listing cards
   - Trade coin components
   - Profile/ratings
   - Dashboard

2. **Medium Priority**:
   - Forms
   - Dialogs
   - Status indicators

3. **Low Priority**:
   - Admin/internal pages
   - Documentation

## Testing Checklist

After updates:
- [ ] All buttons use green or cyan
- [ ] No amber/yellow colors (except B2B badge)
- [ ] No orange colors
- [ ] Stars/ratings are green
- [ ] Trade coins use green/cyan only
- [ ] Status badges use green/cyan/gray/red only
- [ ] Hover states use darker shades of brand colors

## Notes

- Gray shades are acceptable for neutral elements
- Red is acceptable ONLY for errors and destructive actions
- White/Black are acceptable for text and backgrounds
- All other colors should be replaced with brand colors
