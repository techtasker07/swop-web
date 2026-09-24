# Supabase Edge Functions Deployment Guide

## Overview
The web app has been updated to use Supabase Edge Functions (same as the mobile app) instead of Next.js API routes. This ensures consistency and reliability across all platforms.

## What Changed

### Frontend Service Updates
- **`flutterwave-service.ts`** - Updated to call Edge Functions instead of `/api/flutterwave/*` routes
- **`service-coin-service.ts`** - Updated payout to use Edge Functions

### New Edge Functions Created
Located in `swopify-web/supabase/functions/`:

1. **`flutterwave-create-payment`** - Initialize payment
2. **`flutterwave-verify-payment`** - Verify payment after completion
3. **`flutterwave-service-payout`** - Handle service coin payouts
4. **`flutterwave-webhook`** - Receive Flutterwave webhooks

## Deployment Steps

### Step 1: Install Supabase CLI (If Not Already Done)

```bash
npm install -g supabase
# or
brew install supabase/tap/supabase
```

### Step 2: Authenticate with Supabase

```bash
supabase login
# Follow the prompts to authenticate with your Supabase account
```

### Step 3: Deploy Functions

```bash
# Navigate to project root
cd swopify-web

# Deploy all functions
supabase functions deploy

# Or deploy specific functions
supabase functions deploy flutterwave-create-payment
supabase functions deploy flutterwave-verify-payment
supabase functions deploy flutterwave-service-payout
supabase functions deploy flutterwave-webhook
```

### Step 4: Set Environment Secrets

Functions need access to Flutterwave credentials. Set them in Supabase:

```bash
# Set Flutterwave Secret Key
supabase secrets set FLUTTERWAVE_SECRET_KEY "sk_live_xxxxxxxxxxxx"

# Optional: Set alternative name (some use this)
supabase secrets set FLW_SECRET_KEY "sk_live_xxxxxxxxxxxx"

# Optional: Set webhook secret
supabase secrets set FLUTTERWAVE_WEBHOOK_SECRET_HASH "your_webhook_hash"

# Optional: Set payment redirect URL
supabase secrets set APP_PAYMENT_REDIRECT_URL "https://your-domain.com/payment-callback"

# Optional: Set logo URL
supabase secrets set APP_PAYMENT_LOGO_URL "https://your-domain.com/logo.png"
```

Or set via Supabase Dashboard:
1. Go to Supabase Project Dashboard
2. Project Settings → Edge Functions → Environment Variables
3. Add the secrets above

### Step 5: Verify Deployment

Check that functions are deployed:

```bash
supabase functions list
```

Expected output:
```
flutterwave-create-payment  
flutterwave-verify-payment  
flutterwave-service-payout  
flutterwave-webhook        
```

### Step 6: Test Functions

```bash
# Test create payment
curl -X POST "https://your-project.supabase.co/functions/v1/flutterwave-create-payment" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "user_id": "test-user-id",
    "description": "Test payment"
  }'

# Should return payment_link and reference
```

## Local Development (Optional)

### Run Functions Locally

```bash
# Start local Supabase environment
supabase start

# Functions run automatically on http://localhost:54321/functions/v1/

# Make requests to:
# http://localhost:54321/functions/v1/flutterwave-create-payment
# etc.
```

### Develop & Test Locally

1. Edit functions in `supabase/functions/*/index.ts`
2. Supabase automatically watches for changes
3. Test with curl or your app client

## Function Details

### flutterwave-create-payment
**Request:**
```json
{
  "amount": 5000,
  "currency": "NGN",
  "user_id": "uuid",
  "description": "Buy Trade Coin",
  "metadata": {
    "kind": "trade_coin",
    "coins": 5,
    "order_id": "uuid"
  }
}
```

**Response:**
```json
{
  "reference": "SWOP-1234567890-abc123",
  "payment_link": "https://checkout.flutterwave.com/...",
  "transaction_id": null,
  "checkout_mode": "flutterwave_standard"
}
```

### flutterwave-verify-payment
**Request:**
```json
{
  "reference": "SWOP-1234567890-abc123"
}
```

**Response:**
```json
{
  "status": "successful",
  "amount": 5000,
  "currency": "NGN",
  "transaction_id": "123456789",
  "message": "Payment completed successfully."
}
```

### flutterwave-service-payout
**Request:**
```json
{
  "amount": 4500,
  "account_number": "0123456789",
  "account_name": "John Doe",
  "bank_name": "GT Bank",
  "reference": "swopify-sc-payout-uuid",
  "narration": "Service Coin payout"
}
```

**Response:**
```json
{
  "success": true,
  "status": "success",
  "message": "Transfer queued",
  "reference": "swopify-sc-payout-uuid",
  "bank_code": "058",
  "data": {...}
}
```

### flutterwave-webhook
**Accepts POST or GET:**
- POST: From Flutterwave webhook events
- GET: From payment redirect with `?tx_ref=...&status=...`

Updates `payment_transactions` table with:
- status (successful, failed, pending)
- transaction_id
- verified_at
- metadata

## Database Requirements

Ensure these tables exist in Supabase:

### payment_transactions
```sql
CREATE TABLE payment_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  flutterwave_transaction_id TEXT,
  amount NUMERIC NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, successful, failed
  metadata JSONB,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### user_subscriptions (Optional)
```sql
CREATE TABLE user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  audience VARCHAR(20), -- 'p2p', 'b2b'
  status VARCHAR(20) DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  flutterwave_reference TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, audience)
);
```

## Troubleshooting

### Function Not Deploying
```bash
# Check authentication
supabase projects list

# Check function syntax
supabase functions validate

# View deployment logs
supabase functions logs flutterwave-create-payment
```

### Payment Link Not Working
1. Check `FLUTTERWAVE_SECRET_KEY` is set
2. Verify it's a valid Flutterwave v3 key
3. Check `APP_PAYMENT_REDIRECT_URL` is correct

### Verification Failing
1. Ensure `payment_transactions` table exists
2. Check `FLUTTERWAVE_SECRET_KEY` matches Flutterwave account
3. Verify reference format in request

### Import Errors
Make sure you have:
- Deno 1.40+
- Correct import paths (esm.sh URLs)
- Content-Type headers set

## Production Checklist

- [ ] Deploy all 4 functions to production
- [ ] Set Flutterwave LIVE keys (not test keys) in secrets
- [ ] Verify payment_transactions table exists
- [ ] Test payment flow end-to-end
- [ ] Configure webhook secret if using webhooks
- [ ] Set up error logging/monitoring
- [ ] Set correct redirect URL for production domain
- [ ] Test with real payment (small amount)

## Migration Notes

### Old Next.js API Routes (Deprecated)
The following Next.js routes are now deprecated and can be removed:
- `/app/api/flutterwave/create-payment/route.ts`
- `/app/api/flutterwave/verify-payment/route.ts`
- `/app/api/flutterwave/service-payout/route.ts`

Keep for now but they won't be called. Can delete after verifying Edge Functions work.

### Client-Side Changes
Frontend services automatically use Edge Functions:
- `flutterwave-service.ts` updated ✓
- `service-coin-service.ts` updated ✓

No changes needed in React components.

## Benefits of Edge Functions

✓ **Faster**: Runs closer to database (less latency)
✓ **Simpler**: Single place for all payment logic
✓ **Safer**: Environment variables kept server-side
✓ **Consistent**: Mobile and web use same code
✓ **Scalable**: Auto-scales with Supabase
✓ **Easier Deployment**: No separate backend needed

## Support

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Flutterwave API Docs](https://developer.flutterwave.com/docs)
- Check function logs: `supabase functions logs <function-name>`

---

**Status**: Ready to deploy ✓
**Last Updated**: 2026-09-22
