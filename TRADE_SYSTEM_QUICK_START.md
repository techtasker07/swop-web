# Trade System Quick Start Guide

## For Users

### How to Buy Trade Coins

1. Navigate to **Trade Coins** in the main menu
2. Click the **Buy Trade Coin** tab
3. Choose your coin type:
   - **Silver (STC)**: ₦1,450/hour - Entry level
   - **Diamond (DTC)**: ₦3,450/hour - Premium
   - **Gold (GTC)**: ₦5,450/hour - Elite
4. Click **Buy Now** on your chosen coin
5. Select hours (1-10) using the slider
6. Review the order summary
7. Click **Confirm Purchase**
8. Complete payment
9. Your Trade Coins will be added to your wallet

### How to Sell Trade Coins

1. Navigate to **Trade Coins** in the main menu
2. Click the **Sell Trade Coin** tab
3. Choose the coin type you want to sell
4. Click **Sell Now**
5. Select hours (based on your available balance)
6. Review the payout amount (fee will be deducted)
7. Click **Confirm Sale**
8. Your balance will be deducted
9. Payout will be processed within 24-48 hours

### How to Trade Using Trade Coins

#### For Items:
1. Browse listings and find an item you want
2. Click **Propose Trade**
3. Select **Pay with Trade Coins**
4. View your current balance
5. Choose coin type (STC/DTC/GTC)
6. Enter the amount you want to offer
7. System will validate your balance
8. Add meeting location and notes
9. Click **Send Trade Proposal**
10. Your Trade Coins will be held in escrow
11. Wait for the seller to accept

#### For Services:
Same as items, but you can also offer:
- Time Banking hours
- Your own services

### What Happens After You Propose a Trade?

1. **Trade Coins Held**: Your offered Trade Coins are held in escrow (not deducted yet)
2. **Seller Notified**: The seller receives a notification
3. **Seller Reviews**: Seller can accept, reject, or counter your offer
4. **If Accepted**: 
   - You meet and exchange items/services
   - Trade is marked as completed
   - Trade Coins are released to the seller
5. **If Rejected**:
   - Trade Coins are refunded to you
   - You can propose a different trade

## For Developers

### Database Setup

Ensure these migrations are applied:
```sql
-- From mobile app: trade_coin_marketplace_migration.sql
-- From mobile app: trade_coin_integration_migration.sql
```

### Key Components

```typescript
// Get user's Trade Coin balance
import { tradeCoinService } from "@/lib/services/trade-coin-service"

const balance = await tradeCoinService.getUserBalance(userId)
// Returns: { total_balance, stc_balance, dtc_balance, gtc_balance }

// Validate balance before trade
const hasBalance = await tradeCoinService.validateBalance(userId, 'STC', 100)

// Create buy order
const order = await tradeCoinService.createBuyOrder(userId, 'STC', 2)

// Hold in escrow
const escrowId = await tradeCoinService.holdInEscrow(
  tradeId, fromUserId, toUserId, 'STC', 100
)
```

### Trade Proposal with Trade Coins

```typescript
// In propose-trade-dialog.tsx
const selectedItems = [
  {
    type: 'trade_coin',
    coin_type: 'STC',
    trade_coin_amount: 100
  }
]

// Create trade
const trade = await supabase.from("trades").insert({
  proposer_id: user.id,
  receiver_id: sellerId,
  proposer_items: selectedItems,
  involves_trade_coins: true,
})

// Hold in escrow
const escrowId = await tradeCoinService.holdInEscrow(
  trade.id, user.id, sellerId, 'STC', 100
)
```

### Trade Completion

```typescript
// When trade is completed
if (trade.involves_trade_coins && trade.trade_coin_escrow_id) {
  await tradeCoinService.releaseFromEscrow(trade.trade_coin_escrow_id)
}

// When trade is rejected/cancelled
if (trade.involves_trade_coins && trade.trade_coin_escrow_id) {
  await tradeCoinService.refundFromEscrow(trade.trade_coin_escrow_id)
}
```

## Trade Options Summary

### Items (P2P):
- ✅ Your listed items
- ✅ Cash
- ✅ Trade Coins (STC/DTC/GTC)

### Services (B2B):
- ✅ Your listed services
- ✅ Cash
- ✅ Trade Coins (STC/DTC/GTC)
- ✅ Time Banking hours
- ✅ Service hours

## Pricing Reference

| Coin | Price/Hour | Trade Fee | Total (1hr) | Trade Coins |
|------|------------|-----------|-------------|-------------|
| STC  | ₦1,450     | ₦50       | ₦1,500      | 100 TC      |
| DTC  | ₦3,450     | ₦50       | ₦3,500      | 100 TC      |
| GTC  | ₦5,450     | ₦50       | ₦5,500      | 100 TC      |

## Common Issues

### "Insufficient balance" error
**Solution**: Check your Trade Coin balance. You need enough coins of the selected type.

### Trade Coins not showing in wallet
**Solution**: Refresh the page. If still not showing, check the transaction history.

### Can't propose trade with Trade Coins
**Solution**: 
1. Ensure you have sufficient balance
2. Check that the listing is available
3. Verify you're not trading with yourself

### Escrow not releasing
**Solution**: Trade must be marked as "completed" by both parties for escrow to release.

## API Endpoints

### Get Pricing
```typescript
GET /rest/v1/trade_coin_pricing?is_active=eq.true
```

### Get User Balance
```typescript
GET /rest/v1/profiles?id=eq.{userId}&select=trade_coin_balance,trade_coin_stc,trade_coin_dtc,trade_coin_gtc
```

### Create Buy Order
```typescript
POST /rest/v1/rpc/create_trade_coin_buy_order
{
  "p_user_id": "uuid",
  "p_coin_type": "STC",
  "p_hours": 2,
  "p_payment_method": "opay"
}
```

### Hold in Escrow
```typescript
POST /rest/v1/rpc/hold_trade_coins_in_escrow
{
  "p_trade_id": "uuid",
  "p_from_user_id": "uuid",
  "p_to_user_id": "uuid",
  "p_coin_type": "STC",
  "p_amount": 100
}
```

## Testing Checklist

- [ ] Can view Trade Coin marketplace
- [ ] Can see wallet balance
- [ ] Can buy Trade Coins
- [ ] Can sell Trade Coins
- [ ] Can propose trade with Trade Coins
- [ ] Balance validation works
- [ ] Escrow holds coins on trade creation
- [ ] Escrow releases coins on completion
- [ ] Escrow refunds coins on rejection
- [ ] Time Banking works for services
- [ ] Transaction history displays correctly

## Support

Need help? Check:
1. Browser console for errors
2. Network tab for failed requests
3. Supabase logs for database errors
4. This guide for common issues

---

**Last Updated**: February 10, 2026
**Version**: 1.0.0
