# Environment Setup Reference

## Complete `.env.local` Template for Development

Copy this entire template into `swopify-web/.env.local`:

```env
# ===================================================
# SUPABASE CONFIGURATION
# ===================================================
NEXT_PUBLIC_SUPABASE_URL=https://aaoegnyzfrrvkowynuqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhb2Vnbnl6ZnJydmtvd3ludXFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTY5ODcsImV4cCI6MjA3MTY5Mjk4N30.Hg0BDxJJi-oAjnumgjiJemXPRExasC69VDKfbD1sYTY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhb2Vnbnl6ZnJydmtvd3ludXFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjExNjk4NywiZXhwIjoyMDcxNjkyOTg3fQ.tq7cBKb0mcs9ZJk5dy4Zed-5uPgPoKoSTP2ldl0OojU

# ===================================================
# NEXTAUTH CONFIGURATION (OPTIONAL)
# ===================================================
NEXTAUTH_SECRET=your_nextauth_secret_change_this_in_production
NEXTAUTH_URL=http://localhost:3000

# ===================================================
# APP CONFIGURATION
# ===================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Swopify

# ===================================================
# CURRENCY CONFIGURATION
# ===================================================
NEXT_PUBLIC_CURRENCY_CODE=NGN
NEXT_PUBLIC_CURRENCY_SYMBOL=₦
NEXT_PUBLIC_CURRENCY_LOCALE=en-NG

# ===================================================
# FLUTTERWAVE CONFIGURATION (PAYMENTS)
# Required for: Trade Coin purchases, Service Coin purchases
# Get keys from: https://dashboard.flutterwave.com → Settings → API
# Use TEST keys for development, LIVE keys for production
# ===================================================

# TEST MODE (Development - Use these keys when testing locally)
FLUTTERWAVE_SECRET_KEY=sk_test_YOUR_ACTUAL_TEST_SECRET_KEY_HERE
FLUTTERWAVE_CLIENT_SECRET=cs_test_YOUR_ACTUAL_TEST_CLIENT_SECRET_HERE
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_test_YOUR_ACTUAL_TEST_PUBLIC_KEY_HERE

# For Production, replace above with LIVE keys:
# FLUTTERWAVE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY_HERE
# FLUTTERWAVE_CLIENT_SECRET=cs_live_YOUR_LIVE_CLIENT_SECRET_HERE
# NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY_HERE
```

## How to Fill This Out

### 1. Supabase Configuration (✓ Already Done)
The Supabase credentials are already in `.env.local`. Leave these as-is.

**Purpose**: Connects to the Supabase database where coin data is stored.

### 2. NextAuth Configuration (Optional)
Only needed if you're using NextAuth for authentication. Leave as default for development.

### 3. App Configuration (✓ Already Done)
Keep these for local development:
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `NEXT_PUBLIC_APP_NAME=Swopify`

### 4. Currency Configuration (✓ Already Done)
These define the app's currency as Nigerian Naira (NGN). Leave as-is.

### 5. Flutterwave Configuration (🔴 YOU NEED TO DO THIS)

**Step 1**: Go to https://dashboard.flutterwave.com

**Step 2**: Log in with your account

**Step 3**: Find API Settings
- Look for "Settings" menu
- Click "API"
- You'll see your dashboard with keys

**Step 4**: Copy Test Keys

In the Flutterwave dashboard, you'll see:
```
Test API Keys
├── Secret Key:    sk_test_abc123xyz...
├── Client Secret: cs_test_abc123xyz...
└── Public Key:    pk_test_abc123xyz...
```

**Step 5**: Paste into `.env.local`

Replace these placeholders:
```env
# BEFORE
FLUTTERWAVE_SECRET_KEY=sk_test_YOUR_ACTUAL_TEST_SECRET_KEY_HERE
FLUTTERWAVE_CLIENT_SECRET=cs_test_YOUR_ACTUAL_TEST_CLIENT_SECRET_HERE
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_test_YOUR_ACTUAL_TEST_PUBLIC_KEY_HERE

# AFTER (example with actual keys - don't use these!)
FLUTTERWAVE_SECRET_KEY=sk_test_12345abcde67890fghij
FLUTTERWAVE_CLIENT_SECRET=cs_test_abcde12345fghij67890
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=pk_test_xyz789abcde12345fghij
```

## What Each Variable Does

| Variable | Purpose | Visibility | Required |
|----------|---------|------------|----------|
| `FLUTTERWAVE_SECRET_KEY` | Server authentication to Flutterwave API | Backend only | YES |
| `FLUTTERWAVE_CLIENT_SECRET` | Alternative server authentication | Backend only | YES |
| `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | Client-side configuration | Public (visible in browser) | YES |

## Testing Your Setup

### Test 1: Check Keys Are Loaded
Open `http://localhost:3000/trade-coins` in your browser.

**If you see error**: "FLUTTERWAVE_SECRET_KEY is not configured"
- Keys not in `.env.local` yet
- Restart dev server with `npm run dev`

**If checkout button loads**: ✓ Keys are correct!

### Test 2: Try a Test Payment

1. Go to `http://localhost:3000/trade-coins`
2. Click "Buy Trade Coin"
3. Enter amount: 1000 (minimum)
4. Click "Pay ₦1,031"
5. In Flutterwave checkout, enter test card:
   - Card Number: `4242424242424242`
   - CVV: `123` (any 3 digits)
   - Expiry: `09/32` (any future date)
   - Name: Any name

6. Complete payment
7. You should see success and coins in wallet

**Expected Results**:
- ✓ Checkout page opens
- ✓ Test card accepted
- ✓ Redirects back to site
- ✓ Coins added to wallet
- ✓ Success message shown

## Common Setup Issues & Fixes

### Issue 1: "FLUTTERWAVE_SECRET_KEY is not configured"
```
❌ Problem: Keys not in .env.local
✓ Solution: 
  1. Add keys to .env.local
  2. Restart dev server (npm run dev)
  3. Refresh browser
```

### Issue 2: "Invalid API credentials"
```
❌ Problem: Wrong keys (mixed test/live or typo)
✓ Solution:
  1. Double-check keys in Flutterwave dashboard
  2. Copy fresh from dashboard (avoid typos)
  3. Ensure using TEST keys (start with sk_test_)
  4. Restart dev server
```

### Issue 3: Checkout page blank/won't load
```
❌ Problem: Public key missing or wrong
✓ Solution:
  1. Verify NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY is set
  2. Check it starts with pk_test_
  3. Clear browser cache (Ctrl+Shift+Delete)
  4. Hard refresh (Ctrl+Shift+R)
```

### Issue 4: Payment works but coins don't appear
```
❌ Problem: Database functions not deployed
✓ Solution:
  1. See COIN_TOP_UP_FIX_DEPLOYMENT.md
  2. Deploy SQL migrations to Supabase
  3. Then test payment again
```

## File Locations

- **Web App Env**: `swopify-web/.env.local` ← **Update this file**
- **Example Template**: `swopify-web/.env.example` (reference only)
- **Mobile App Env**: `swop2/.env` (separate file)
- **Server Env**: `swopify-admin/.env` (separate file)

## Security Reminders

✓ **Good Practice**:
- `.env.local` is gitignored (not committed to repo)
- Each developer has their own `.env.local`
- Test keys used for development only
- Live keys used only in production

❌ **Don't Do This**:
- Commit `.env.local` to git
- Share your keys in Slack/email
- Hardcode keys in source code
- Use live keys for development

## When to Update Keys

| Scenario | Action |
|----------|--------|
| Local development | Use TEST keys |
| Staging/demo server | Use TEST keys |
| Production deployment | Use LIVE keys |
| Rotating keys for security | Update all environments |
| Switching accounts | Get new keys from new Flutterwave account |

## Production Deployment

When deploying to production:

### For Vercel (recommended):
1. Go to Vercel Project Settings
2. Go to Environment Variables
3. Add the three Flutterwave variables
4. Replace values with LIVE keys (from Flutterwave)
5. Redeploy

### For other hosting:
Follow your platform's documentation for environment variables, but use LIVE keys.

---

**Last Updated**: 2026-09-22
**Status**: Development Ready ✓
**Next Step**: Add your Flutterwave test keys and restart!
