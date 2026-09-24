# Flutterwave Payment Gateway Setup Guide

## Overview
The coin top-up feature requires Flutterwave API credentials to process payments. This guide explains how to configure them.

## Problem
When running `npm run dev`, you see:
```
❌ FLUTTERWAVE_SECRET_KEY is not configured.
```

This means the environment variables for Flutterwave are missing from your `.env.local` file.

## Solution

### Step 1: Get Your Flutterwave API Keys

1. Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Log in with your account
3. Navigate to **Settings** → **API** (or look for API Keys section)
4. You'll see two sets of keys:
   - **Test/Sandbox Keys** (for development)
   - **Live Keys** (for production)

For development/local testing, use the **Test Keys**.

### Step 2: Copy the Keys

You'll need three keys:

| Key Name | Where to Find | Environment Variable |
|----------|---------------|----------------------|
| Secret Key | Dashboard → Settings → API → Secret Key (Test) | `FLUTTERWAVE_SECRET_KEY` |
| Client Secret | Dashboard → Settings → API → Client Secret (Test) | `FLUTTERWAVE_CLIENT_SECRET` |
| Public Key | Dashboard → Settings → API → Public Key (Test) | `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` |

### Step 3: Update `.env.local`

Open `swopify-web/.env.local` and update:

```env
# Flutterwave Configuration (Payments)
FLUTTERWAVE_SECRET_KEY=sk_test_abc123xyz789...  # Replace with your test secret key
FLUTTERWAVE_CLIENT_SECRET=cs_test_abc123xyz789... # Replace with your test client secret
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_test_abc123xyz789... # Replace with your test public key
```

**Important**: 
- For **development**: Use Test/Sandbox keys
- For **production**: Use Live keys before deploying

### Step 4: Restart Dev Server

```bash
# Stop the current dev server (Ctrl+C)
# Then restart
npm run dev
```

The error should now be gone!

## Testing Payments

### Using Flutterwave Test Cards

Flutterwave provides test card numbers for development:

| Card Type | Card Number | CVV | Expiry | Result |
|-----------|-------------|-----|--------|--------|
| Visa Success | 4242424242424242 | 123 | 09/32 | ✓ Payment succeeds |
| Visa Fail | 4000000000000002 | 123 | 09/32 | ✗ Payment fails |

### Test Payment Flow

1. Go to `http://localhost:3000/trade-coins`
2. Click "Buy Trade Coin"
3. Enter amount: 1000 (minimum)
4. Click "Pay" button
5. In Flutterwave checkout, use test card details above
6. Complete the payment
7. You should see coins added to your wallet

## Verification

### Check if Configuration is Correct

In your browser console (F12), check for errors:

```
❌ "FLUTTERWAVE_SECRET_KEY is not configured" → Keys not added to .env.local
❌ "Invalid API credentials" → Wrong keys copied
✓ Checkout page loads → Keys are correct
```

### API Logs

Check server logs in your terminal for:

```
POST /api/flutterwave/create-payment 200 OK
```

If you see 401 or 400, the keys are wrong.

## Environment Variables Explained

| Variable | Purpose | Visibility | Example |
|----------|---------|------------|---------|
| `FLUTTERWAVE_SECRET_KEY` | Server-side auth to Flutterwave API | Backend only (private) | `sk_test_...` |
| `FLUTTERWAVE_CLIENT_SECRET` | Alternative server-side auth | Backend only (private) | `cs_test_...` |
| `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | Client-side payment page config | Client & Browser (public) | `pk_test_...` |

**Important**: 
- Never commit `.env.local` to git (it's in `.gitignore`)
- Never share your secret keys
- Use different keys for test/prod

## Production Setup

Before deploying to production:

1. **Switch to Live Keys**
   - Go to Flutterwave Dashboard → Settings → API
   - Copy your Live keys (not Test keys)
   - Update your production environment variables

2. **Update `.env` in Vercel** (if deployed)
   - Go to Vercel → Project → Settings → Environment Variables
   - Add the same three Flutterwave variables with Live keys

3. **Never hardcode keys**
   - Always use environment variables
   - Keep keys in secure configuration management

## Troubleshooting

### Error: "Invalid API credentials"
- **Cause**: Wrong keys copied or mixed test/prod keys
- **Fix**: Re-check keys in Flutterwave dashboard, ensure they're from the correct mode (Test vs Live)

### Error: "Payment verification failed"
- **Cause**: Secret key is incorrect or reference transaction ID is wrong
- **Fix**: Verify the secret key in `.env.local` matches the one in Flutterwave dashboard

### Checkout page won't load
- **Cause**: Public key missing or incorrect
- **Fix**: Check `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` is in `.env.local`

### Payment succeeds but coins not credited
- **Cause**: Database functions not deployed (see main fix documentation)
- **Fix**: Ensure SQL migrations from `COIN_TOP_UP_FIX_DEPLOYMENT.md` are applied

## Flutterwave Documentation

- [API Documentation](https://developer.flutterwave.com/docs)
- [Payment Collection](https://developer.flutterwave.com/docs/payments/collections)
- [Test Cards](https://developer.flutterwave.com/docs/integration-guides/testing)
- [Dashboard](https://dashboard.flutterwave.com)

## Support

If you still have issues:

1. Verify keys are copied correctly (no extra spaces)
2. Ensure `.env.local` file is in the root of `swopify-web/` directory
3. Restart the dev server completely
4. Check browser console (F12) for errors
5. Check terminal logs for API errors

---

**Last Updated**: 2026-09-22
**Status**: Ready for development
