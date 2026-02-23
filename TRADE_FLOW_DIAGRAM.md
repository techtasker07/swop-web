# Trade System Flow Diagrams

## 1. Trade Coin Purchase Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ 1. Navigate to /trade-coins
       ▼
┌─────────────────────────┐
│  Trade Coin Marketplace │
└──────────┬──────────────┘
           │
           │ 2. Select "Buy" tab
           │ 3. Choose coin type (STC/DTC/GTC)
           │ 4. Click "Buy Now"
           ▼
┌─────────────────────────┐
│    Buy Dialog           │
│  - Select hours (1-10)  │
│  - View order summary   │
│  - See total cost       │
└──────────┬──────────────┘
           │
           │ 5. Confirm purchase
           ▼
┌─────────────────────────┐
│  Payment Processing     │
│  (Opay Integration)     │
└──────────┬──────────────┘
           │
           │ 6. Payment successful
           ▼
┌─────────────────────────┐
│  Database Updates       │
│  - Create order record  │
│  - Update user balance  │
│  - Create transaction   │
└──────────┬──────────────┘
           │
           │ 7. Success notification
           ▼
┌─────────────────────────┐
│  Updated Wallet         │
│  Balance displayed      │
└─────────────────────────┘
```

## 2. Trade Proposal with Trade Coins Flow

```
┌─────────────┐
│   User A    │
│ (Proposer)  │
└──────┬──────┘
       │
       │ 1. Browse listings
       │ 2. Find desired item
       ▼
┌─────────────────────────┐
│  Listing Details        │
└──────────┬──────────────┘
           │
           │ 3. Click "Propose Trade"
           ▼
┌─────────────────────────┐
│  Trade Proposal Dialog  │
│  - View balance         │
│  - Select Trade Coins   │
│  - Choose coin type     │
│  - Enter amount         │
└──────────┬──────────────┘
           │
           │ 4. Validate balance
           ▼
┌─────────────────────────┐
│  Balance Validation     │
│  ✓ Sufficient balance   │
└──────────┬──────────────┘
           │
           │ 5. Submit proposal
           ▼
┌─────────────────────────┐
│  Create Trade Record    │
│  - Save trade details   │
│  - Set status: pending  │
└──────────┬──────────────┘
           │
           │ 6. Hold in escrow
           ▼
┌─────────────────────────┐
│  Escrow System          │
│  - Deduct from User A   │
│  - Hold in escrow       │
│  - Create escrow record │
└──────────┬──────────────┘
           │
           │ 7. Notify User B
           ▼
┌─────────────┐
│   User B    │
│ (Receiver)  │
│ Gets        │
│ notification│
└─────────────┘
```

## 3. Trade Completion Flow

```
┌─────────────┐         ┌─────────────┐
│   User A    │         │   User B    │
│ (Proposer)  │         │ (Receiver)  │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │ 1. User B accepts     │
       │◄──────────────────────┤
       │                       │
       │ 2. Meet and exchange  │
       │◄─────────────────────►│
       │                       │
       │ 3. User A sets code   │
       ├──────────────────────►│
       │                       │
       │ 4. User B enters code │
       │◄──────────────────────┤
       │                       │
       ▼                       ▼
┌─────────────────────────────────────┐
│  Verify Completion Code             │
│  ✓ Code matches                     │
└──────────────┬──────────────────────┘
               │
               │ 5. Mark trade completed
               ▼
┌─────────────────────────────────────┐
│  Release from Escrow                │
│  - Get escrow record                │
│  - Deduct from escrow               │
│  - Add to User B balance            │
│  - Update escrow status: released   │
└──────────────┬──────────────────────┘
               │
               │ 6. Create transactions
               ▼
┌─────────────────────────────────────┐
│  Transaction Records                │
│  - User A: "spent" transaction      │
│  - User B: "earned" transaction     │
└──────────────┬──────────────────────┘
               │
               │ 7. Notify both users
               ▼
┌─────────────┐         ┌─────────────┐
│   User A    │         │   User B    │
│ Trade       │         │ Trade       │
│ completed   │         │ completed   │
│ + received  │         │ + received  │
│   item      │         │   coins     │
└─────────────┘         └─────────────┘
```

## 4. Trade Rejection/Cancellation Flow

```
┌─────────────┐
│   User B    │
│ (Receiver)  │
└──────┬──────┘
       │
       │ 1. Reviews trade proposal
       │ 2. Decides to reject
       ▼
┌─────────────────────────┐
│  Reject Trade           │
│  - Update status        │
│  - Set rejection reason │
└──────────┬──────────────┘
           │
           │ 3. Trigger refund
           ▼
┌─────────────────────────┐
│  Refund from Escrow     │
│  - Get escrow record    │
│  - Add back to User A   │
│  - Update escrow status │
└──────────┬──────────────┘
           │
           │ 4. Create transaction
           ▼
┌─────────────────────────┐
│  Transaction Record     │
│  - User A: "refunded"   │
└──────────┬──────────────┘
           │
           │ 5. Notify User A
           ▼
┌─────────────┐
│   User A    │
│ (Proposer)  │
│ Trade       │
│ rejected    │
│ Coins       │
│ refunded    │
└─────────────┘
```

## 5. Trade Coin Sell Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ 1. Navigate to /trade-coins
       ▼
┌─────────────────────────┐
│  Trade Coin Marketplace │
└──────────┬──────────────┘
           │
           │ 2. Select "Sell" tab
           │ 3. Choose coin type
           │ 4. Click "Sell Now"
           ▼
┌─────────────────────────┐
│    Sell Dialog          │
│  - View balance         │
│  - Select hours         │
│  - View payout amount   │
└──────────┬──────────────┘
           │
           │ 5. Validate balance
           ▼
┌─────────────────────────┐
│  Balance Check          │
│  ✓ Sufficient coins     │
└──────────┬──────────────┘
           │
           │ 6. Confirm sale
           ▼
┌─────────────────────────┐
│  Database Updates       │
│  - Create sell order    │
│  - Deduct from balance  │
│  - Create transaction   │
└──────────┬──────────────┘
           │
           │ 7. Schedule payout
           ▼
┌─────────────────────────┐
│  Payout Processing      │
│  (24-48 hours)          │
└──────────┬──────────────┘
           │
           │ 8. Success notification
           ▼
┌─────────────────────────┐
│  Updated Wallet         │
│  Balance reduced        │
│  Payout pending         │
└─────────────────────────┘
```

## 6. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Web Application                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Pages      │  │  Components  │  │   Services   │ │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤ │
│  │ /trade-coins │  │ Marketplace  │  │ TradeCoin    │ │
│  │ /listings/id │  │ WalletDisplay│  │ Service      │ │
│  │ /dashboard   │  │ BuyDialog    │  │              │ │
│  │              │  │ SellDialog   │  │              │ │
│  │              │  │ ProposeDialog│  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Supabase Client
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Supabase Backend                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Database Tables                      │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ • trade_coin_pricing                             │  │
│  │ • trade_coin_orders                              │  │
│  │ • trade_coin_transactions                        │  │
│  │ • trade_coin_escrow                              │  │
│  │ • profiles (with Trade Coin columns)             │  │
│  │ • trades (with Trade Coin columns)               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Database Functions (RPC)                │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ • create_trade_coin_buy_order()                  │  │
│  │ • complete_trade_coin_buy_order()                │  │
│  │ • create_trade_coin_sell_order()                 │  │
│  │ • complete_trade_coin_sell_order()               │  │
│  │ • hold_trade_coins_in_escrow()                   │  │
│  │ • release_trade_coins_from_escrow()              │  │
│  │ • refund_trade_coins_from_escrow()               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Row Level Security                   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ • Users can only view their own orders           │  │
│  │ • Users can only view their own transactions     │  │
│  │ • Users can only view their own escrow records   │  │
│  │ • Pricing is publicly readable                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 7. Data Flow

```
User Action → Component → Service → Supabase → Database Function → Database Table
     ↓           ↓          ↓          ↓              ↓                  ↓
  Click Buy → BuyDialog → TradeCoin → RPC Call → create_buy_order → trade_coin_orders
                                                                    → profiles (balance)
                                                                    → trade_coin_transactions
```

## 8. Trade Options Decision Tree

```
                    ┌─────────────────┐
                    │  Listing Type?  │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
         ┌──────────┐              ┌──────────┐
         │   Item   │              │ Service  │
         └────┬─────┘              └────┬─────┘
              │                         │
              │                         │
    ┌─────────┴─────────┐      ┌────────┴────────────┐
    │                   │      │                     │
    ▼                   ▼      ▼                     ▼
┌────────┐      ┌────────────┐ ┌────────┐    ┌──────────────┐
│ Items  │      │Trade Coins │ │Services│    │ Trade Coins  │
│        │      │ (STC/DTC/  │ │        │    │ (STC/DTC/GTC)│
│        │      │  GTC)      │ │        │    │              │
└────────┘      └────────────┘ └────────┘    └──────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │Time Banking  │
                            │   Hours      │
                            └──────────────┘
```

## 9. Escrow State Machine

```
┌─────────────┐
│   Created   │
│  (pending)  │
└──────┬──────┘
       │
       │ Trade proposed
       ▼
┌─────────────┐
│    Held     │
│  (escrow)   │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
       │ Completed    │ Rejected     │ Cancelled
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Released   │ │  Refunded   │ │  Refunded   │
│ (to seller) │ │(to proposer)│ │(to proposer)│
└─────────────┘ └─────────────┘ └─────────────┘
```

## 10. Balance Update Flow

```
Initial Balance: 500 STC

User proposes trade: 100 STC
├─ Balance: 500 STC (unchanged)
└─ Escrow: 100 STC (held)

Trade accepted
├─ Balance: 500 STC (unchanged)
└─ Escrow: 100 STC (still held)

Trade completed
├─ Balance: 400 STC (deducted)
├─ Escrow: 0 STC (released)
└─ Receiver Balance: +100 STC

OR

Trade rejected
├─ Balance: 500 STC (unchanged)
└─ Escrow: 0 STC (refunded)
```

---

These diagrams illustrate the complete flow of the Trade Coin system in the Swopify web app.
