# Removed: Bulk Download of All Approved Orders

## What was removed

- **`getAllApprovedOrders`** from `src/repositories/OrdersReader.js` — a function that downloaded ALL orders with `status == "approved"` from Firestore with no year filter and no result limit. This was a full-collection scan that could return thousands of documents.
- **`getAllApprovedOrders`** wrapper from `src/controllers/Payment/order.js` — a thin delegation wrapper that called `OrdersReader.getAllApprovedOrders()`.

## Why it was removed

The bulk download of all approved orders was an unbounded query that:
1. Scanned the entire `orders` collection filtered only by `status == "approved"`
2. Returned every matching document with no pagination or limit
3. Could degrade Firestore performance and increase costs as the orders collection grows
4. Was only used as a fallback inside `getApprovedOrdersByYear`, which itself already performs a properly scoped query with year bounds

## Replacement

- **`getApprovedOrdersByYear(year)`** — the existing function in `OrdersReader.js` that queries approved orders scoped to a specific year using `createdAt` range filters. This is the correct replacement for any caller that previously used `getAllApprovedOrders` and then filtered by year client-side.
- **`getApprovedOrdersByYear`** in `order.js` — the controller-level wrapper that delegates to the repository.

## Impact

- Any code that imported `getAllApprovedOrders` from `Payment/order` or `OrdersReader` will get a build error. A search of the codebase confirmed no active consumers remained at the time of removal.
- The `normalizeOrder` helper in `OrdersReader.js` (which replaces the older `normalizeAndFilterApprovedOrders`) is unaffected and remains in use by `getApprovedOrdersByYear`.
- The `cachedApprovedOrdersByYear` cache (per-year TTL) is unaffected and remains in use by `getApprovedOrdersByYear`.