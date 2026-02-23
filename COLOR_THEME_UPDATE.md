# Color Theme Update - Swopify Web

## Overview
Updated the swopify-web application to match the color theme from the swop2 mobile app.

## Theme Colors
- **Primary (Lime Green)**: `#32cd32`
- **Secondary (Dark Cyan)**: `#073232`
- **Secondary Light**: `#0a4a4a`
- **Primary Hover**: `#28a428`

## Files Updated

### Core Styling
- `app/globals.css` - Updated CSS variables for primary, secondary, accent, and all related color tokens in both light and dark modes

### Components
- `components/header.tsx` - Header gradient, buttons, and mobile menu
- `components/listing-card.tsx` - Condition badges, verification badges, icons
- `components/profile/profile-stats.tsx` - Stat card colors
- `components/messages/conversation-view.tsx` - Verification badge
- `components/messages/new-message-form.tsx` - Verified user text
- `components/listings/listing-details.tsx` - Verification icon
- `components/trades/propose-trade-dialog.tsx` - Service, trade coin, and time banking indicators
- `components/trade-coins/marketplace.tsx` - Info cards, DTC coin styling
- `components/trade-coins/sell-dialog.tsx` - Alert styling
- `components/trade-coins/wallet-display.tsx` - Coin type colors
- `lib/services/trade-coin-service.ts` - DTC coin color functions

### Dashboard Components
- `components/dashboard/dashboard-sidebar.tsx` - Active nav items, quick action badges, user avatar, logo background
- `components/dashboard/dashboard-stats.tsx` - Profile stat colors
- `components/dashboard/quick-actions.tsx` - All action button colors (alternating green/cyan pattern)
- `components/dashboard/recent-trades.tsx` - Trade card hover states, accepted status
- `components/dashboard/smart-matches.tsx` - Card header, hover states

### Pages
- `app/dashboard/page.tsx` - Dashboard header, stat cards, recent listings section, quick start steps
- `app/how-it-works/page.tsx` - Hero section, step colors, benefit icons, safety cards
- `app/b2b/page.tsx` - Loading spinner, icons, badges, header text

### Home Components
- `components/home/hero-section.tsx` - Stat icons, community badges
- `components/home/categories-section.tsx` - Category badges (alternating green/cyan pattern)

## Color Usage Pattern
- **Primary Green (#32cd32)**: Used for primary actions, active states, success indicators, and positive interactions
- **Dark Cyan (#073232)**: Used for secondary actions, headers, and complementary UI elements
- **Alternating Pattern**: Quick actions and categories alternate between green and cyan for visual variety
- **Opacity Variations**: `/10` for light backgrounds, `/30` for borders, `/80` for muted text

## Testing Recommendations
1. Test all interactive elements (buttons, links, hover states)
2. Verify color contrast meets accessibility standards
3. Check both light and dark mode appearances
4. Test on different screen sizes
5. Verify Trade Coin marketplace colors (DTC now uses cyan theme)
6. Check dashboard stat cards and quick actions
7. Verify B2B marketplace styling

## Notes
- All hardcoded blue/purple colors have been replaced
- CSS variables in globals.css provide consistent theming
- Tailwind classes use hex values for precise color matching
- Dark mode colors are slightly brighter for better visibility
