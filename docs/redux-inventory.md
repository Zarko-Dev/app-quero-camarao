# Redux Inventory — Slice-by-Slice Analysis

Generated: 2026-09-02
Project: app-quero-camarao

---

## Store Overview

- **Store setup**: `src/store/index.js` uses `@reduxjs/toolkit`'s `configureStore` but with a plain `redux` `combineReducers` root reducer (`src/store/reducers.js`).
- **Total slices**: 8
- **Components using `useSelector`/`useDispatch`**: 23 files
- **RTK Query in use**: None
- **Immer**: Not enabled (immutableCheck disabled in store config)

---

## Slice Inventory Table

| Slice (key in rootReducer) | File | State Shape | Tipo de Estado | Caches Manuais | Estado Duplicado | Recomendação |
|---|---|---|---|---|---|---|
| `login` | `src/pages/Login/reducer.js` | `{ isAuthenticated: bool, refresh: bool }` | client-state | None | None | **Manter Redux** — auth session is global; needed across pages |
| `publication` | `src/pages/Publication/reducer.js` | `{ dataPayment: object }` | form-state | None | None | **Manter Redux** — form data shared across publication flow steps |
| `shrimpCardShared` | `src/components/ShrimpCardShared/reducer.js` | `{ dataShrimp: { location, ponds, shrimps[] } }` | client-state | None | None | **Manter Redux** — shared across ShrimpCard components; avoids prop drilling |
| `payment` | `src/pages/Payment/reducer.js` | `{ dataOrder: object \| undefined }` | ephemeral | None | None | **Migrar para estado local** — single order data only used within Payment page; could be `useState` or `useReducer` |
| `invitation` | `src/pages/ValidateInvitation/reducer.js` | `{ invitationCode: string \| undefined }` | form-state | None | None | **Manter Redux** — form state shared across validation flow |
| `paymentWallet` | `src/pages/Payment/components/ResumeCrad/reducer.js` | `{ dataWallet: undefined, isLoadingWallet: bool }` | client-state | None | None | **Manter Redux** — wallet data used across ResumeCrad and parent Payment page |
| `configSystem` | `src/components/AlertNewVersion/reducer.js` | `{ configData: { androidUrl, iosUrl, forceUpdate, versionNumber, minimumVersion, pondShrimpValue, ... } }` | client-state | None | None | **Manter Redux** — app config fetched once, consumed globally; could also be a static JSON import if values are build-time constants |
| `notificationExecute` | `src/components/Header/reducer.js` | `{ notificationExecuted: bool, notificationsError: bool, notifications: [], notificationCount: number, originalDataNotifications: [] }` | client-state | None | `notifications` ↔ `originalDataNotifications` (both hold notification arrays; `originalDataNotifications` is the raw source, `notifications` is the filtered/processed version used for display) | **Manter Redux** — global notification state needed in Header + ReceivedNotifications; **eliminate duplication** by storing only `originalDataNotifications` and deriving `notifications` via selector |

---

## Manual Caches in `src/controllers/Payment/order.js`

### `cachedApprovedOrders` + `cachedApprovedOrdersAt`

- **Type**: Module-level mutable variables (not in Redux)
- **TTL**: 60 000 ms (60 seconds)
- **Purpose**: Cache the result of `getAllApprovedOrders()` to avoid redundant Firestore reads for the full approved-orders list
- **Scope**: Module-private; no invalidation mechanism beyond TTL expiry
- **Risk**: Stale data for up to 60 s; no cache invalidation on write (save, update, delete operations do not bust this cache)
- **Duplication**: Caches the same data that could live in Redux or be served by RTK Query with built-in cache management

### `cachedApprovedOrdersByYear`

- **Type**: Plain object keyed by year string (`{ "2024": { at, data }, ... }`)
- **TTL**: 60 000 ms per year-key entry
- **Purpose**: Cache per-year filtered results of approved orders
- **Scope**: Module-private; no invalidation mechanism beyond TTL expiry
- **Risk**: Same staleness risk; also no cache busting on writes
- **Duplication**: Caches data that overlaps with `cachedApprovedOrders` (both filter by `status == "approved"`); the year-filtered version is a subset
- **Fallback**: On error, falls back to `getAllApprovedOrders()` and filters client-side — this is a second layer of implicit caching

### Combined Assessment of Manual Caches

| Aspect | Assessment |
|---|---|
| Cache strategy | Time-based only (TTL), no write-invalidation |
| Cache location | Module-level closures, invisible to Redux DevTools |
| Cache overlap | `cachedApprovedOrdersByYear` subsets `cachedApprovedOrders`; both contain the same approved orders |
| Staleness window | Up to 60 s for any order status change |
| Debuggability | None — no logging, no DevTools integration |
| Recommendation | **Eliminate** — replace with RTK Query cache or a centralized cache layer that supports invalidation on writes. If kept, at minimum add write-invalidation in `savePaymentOrder`, `updateOrderStatus`, `deleteOrder`, and `savePublicationPaymentOrder`. |

---

## State Duplication Detail

### `notificationExecute` slice

The `notifications` and `originalDataNotifications` fields hold the same array of notification objects. `originalDataNotifications` is the raw payload; `notifications` is the filtered/processed version used for display. This is a **manual memoization pattern** that should be replaced with a **selector** (`createSelector` from Redux Toolkit) that derives `notifications` from `originalDataNotifications` on demand.

### `cachedApprovedOrders` ↔ Redux

The approved-orders list is cached outside Redux entirely. Any component that needs this data either:
1. Calls `getAllApprovedOrders()` directly (hits the manual cache), or
2. Receives it via props from a parent that called the controller function.

This means the approved-orders data is **not in Redux at all**, creating a blind spot for global state management.

---

## Recommendations Summary

| Priority | Action | Slices Affected |
|---|---|---|
| **High** | Eliminate manual TTL caches in `order.js`; adopt RTK Query or centralized cache with write-invalidation | `payment` (indirectly) |
| **High** | Remove `notifications` field from `notificationExecute` reducer; derive via `createSelector` from `originalDataNotifications` | `notificationExecute` |
| **Medium** | Migrate `payment` slice from Redux to local component state (`useState`/`useReducer`) | `payment` |
| **Medium** | Evaluate whether `configSystem` can be static (imported JSON) rather than Redux state | `configSystem` |
| **Low** | Consider migrating from `combineReducers` + plain reducers to `createSlice` throughout for consistency with `configureStore` | All slices |
| **Low** | Add `immer` enable or adopt `createSlice` (which uses immer internally) to simplify immutable updates | All slices |

---

## Appendix: Redux Setup Details

- **Root reducer**: `combineReducers` from `redux` (not RTK's `configureStore` reducer wrapping)
- **Store**: `configureStore` from `@reduxjs/toolkit` with `immutableCheck: false` and `serializableCheck: false`
- **No middleware** added beyond defaults
- **No RTK Query** `apiSlice` or `createApi` usage found
- **No Redux Persist** or other middleware detected
- **Actions**: Each slice has its own `actions.js` file with plain string constants (not RTK `createAction`)
- **Reducers**: Hand-written switch statements (not `createSlice`)