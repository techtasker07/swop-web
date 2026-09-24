# Flutterwave Quick Setup (5 Minutes)

## TL;DR
You need to add Flutterwave API keys to `.env.local` so the payment system works.

## Steps

### 1. Get Keys from Flutterwave
- Go to https://dashboard.flutterwave.com
- Login
- Go to Settings → API
- Copy these 3 keys (use **Test** keys for development):
  - Secret Key (starts with `sk_test_`)
  - Client Secret (starts with `cs_test_`)
  - Public Key (starts with `pk_test_`)

### 2. Add to `.env.local`
Open `swopify-web/.env.local` and add:

```env
# Flutterwave Configuration (Payments)
FLUTTERWAVE_SECRET_KEY=sk_test_YOUR_KEY_HERE
FLUTTERWAVE_CLIENT_SECRET=cs_test_YOUR_KEY_HERE
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
```

### 3. Restart Dev Server
```bash
# Stop: Ctrl+C
# Start: npm run dev
```

### 4. Test
- Go to http://localhost:3000/trade-coins
- Click "Buy Trade Coin"
- Use test card: `4242424242424242` with CVV `123`
- You should see coins in your wallet after payment

## Done! ✓

---

## Test Cards for Development

| Card | Number | CVV | Expiry | Result |
|------|--------|-----|--------|--------|
| Visa OK | 4242424242424242 | 123 | 09/32 | ✓ Success |
| Visa FAIL | 4000000000000002 | 123 | 09/32 | ✗ Fails |

## Still Getting Error?

**Q: Still seeing "FLUTTERWAVE_SECRET_KEY is not configured"?**
- A: Restart the dev server (`npm run dev`)
- A: Verify the key is copied exactly (no spaces)
- A: Check file is `.env.local` not `.env`

**Q: Checkout page won't load?**
- A: Check `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` is in `.env.local`

**Q: Payment works but coins don't appear?**
- A: SQL migrations need to be deployed (see COIN_TOP_UP_FIX_DEPLOYMENT.md)

## Production Later
When deploying to production, replace Test keys with Live keys from Flutterwave.
