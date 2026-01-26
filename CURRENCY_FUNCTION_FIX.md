# Currency Function Fix

## Issue
The `ProposeTradeDialog` component was using `formatCurrency` function which doesn't exist, causing a runtime error:

```
ReferenceError: formatCurrency is not defined
```

## Root Cause
The component was referencing the wrong function name. The correct function is `formatNaira` from `@/lib/utils/currency`.

## Fix Applied
Updated all instances of `formatCurrency` to `formatNaira` in the `ProposeTradeDialog` component:

### Files Modified
- `swopify-web/components/trades/propose-trade-dialog.tsx`

### Changes Made
1. ✅ Line 224: Target listing price display
2. ✅ Line 258: Listing item price display  
3. ✅ Line 268: Cash amount display
4. ✅ Line 320: Select dropdown listing prices
5. ✅ Line 356: Target value display
6. ✅ Line 360: Proposed value display
7. ✅ Line 365: Value difference display

## Current Status
- ✅ **Error resolved**: No more `formatCurrency` references
- ✅ **TypeScript clean**: No diagnostics errors
- ✅ **Server running**: http://localhost:3002
- ✅ **Ready for testing**: Propose trade dialog should work properly

## Test Instructions
1. Visit a listing details page: http://localhost:3002/listings/17
2. Click "Propose Trade" button
3. The dialog should open without errors
4. All currency values should display properly in Nigerian Naira (₦)

The listing details page and trade proposal functionality should now work correctly!