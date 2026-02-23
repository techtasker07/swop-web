# Trade System Implementation for Web App

## Overview
This document outlines the implementation of the complete trading system in the Swopify web app, matching the mobile app functionality.

## Features to Implement

### 1. Trade Coin System
- **Trade Coin Marketplace** - Buy/sell Trade Coins (STC, DTC, GTC)
- **Trade Coin Wallet** - Display user's Trade Coin balance
- **Trade Coin Integration** - Use Trade Coins in trade proposals

### 2. Trade Proposal Enhancements
- Add Trade Coin as payment option
- Add Time Banking hours option (for services)
- Validate balances before submission
- Escrow system for Trade Coins

### 3. Database Schema Updates
Based on mobile app schema, we need:
- `trade_coin_pricing` table
- `trade_coin_orders` table
- `trade_coin_transactions` table
- `trade_coin_escrow` table
- Profile columns: `trade_coin_balance`, `trade_coin_stc`, `trade_coin_dtc`, `trade_coin_gtc`
- Trades columns: `involves_trade_coins`, `trade_coin_escrow_id`

## Implementation Steps

### Phase 1: Database Schema & Types
1. Update database types to include Trade Coin fields
2. Ensure database migration is applied (already exists in mobile)

### Phase 2: Trade Coin Marketplace
1. Create Trade Coin marketplace page
2. Implement buy/sell functionality
3. Integrate with payment system (Opay)

### Phase 3: Trade Proposal Updates
1. Update propose-trade-dialog to include Trade Coin option
2. Add Trade Coin balance display
3. Add coin type selection (STC/DTC/GTC)
4. Add amount input with validation
5. Update trade creation to handle Trade Coins

### Phase 4: Trade Management
1. Update trade details to show Trade Coin offers
2. Implement escrow release on completion
3. Implement refund on rejection/cancellation

## Trade Options by Listing Type

### For Items (P2P):
- Your listed items
- Trade Coins (STC/DTC/GTC)

### For Services (B2B):
- Your listed services
- Trade Coins (STC/DTC/GTC)
- Time Banking hours

## Trade Coin Pricing
- **Silver Trade Coin (STC)**: ₦1,450 per hour (100 TC)
- **Diamond Trade Coin (DTC)**: ₦3,450 per hour (100 TC)
- **Gold Trade Coin (GTC)**: ₦5,450 per hour (100 TC)
- **Trade Fee**: ₦50 per transaction

## Files to Create/Update

### New Files:
1. `app/trade-coins/page.tsx` - Trade Coin marketplace
2. `components/trade-coins/marketplace.tsx` - Marketplace UI
3. `components/trade-coins/wallet-display.tsx` - Balance display
4. `components/trade-coins/buy-dialog.tsx` - Buy Trade Coins
5. `components/trade-coins/sell-dialog.tsx` - Sell Trade Coins
6. `lib/services/trade-coin-service.ts` - Trade Coin operations

### Updated Files:
1. `lib/types/database.ts` - Add Trade Coin types
2. `components/trades/propose-trade-dialog.tsx` - Add Trade Coin option
3. `components/dashboard/dashboard-stats.tsx` - Show Trade Coin balance
4. `components/header.tsx` - Add Trade Coin link

## Implementation Date
February 10, 2026

## Status
🚧 In Progress
