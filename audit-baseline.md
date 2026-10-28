# Baseline Audit Report — Firebase / React Native Refactor

## 1. Architecture Overview

- **Project**: mobile-quero-camarao (React Native + Expo)
- **Version**: 2.0.5 (Expo SDK 53)
- **Build system**: Expo (EAS), React Native 0.79.6
- **State management**: Redux Toolkit (@reduxjs/toolkit v1.9.5 + react-redux v8.1.2)
- **Navigation**: React Navigation v7 (native-stack + drawer + bottom-tabs)
- **Firebase**: Firebase Web SDK v10.14.1 (NOT React Native Firebase)
- **Notifications**: Expo Notifications (expo-notifications v0.31.5)
- **Backend**: Firebase Cloud Functions (Node 20, firebase-functions v4.9.0)
- **Tests**: Jest (65 unit tests + 7 functions tests)

### Key Directories

```
src/
  services/Firebase/     — Firebase init, config, models
  controllers/           — Business logic (Auth, Firestore, Storage, Notifications)
  store/                 — Redux store + reducers
  routes/                — Navigation (stack, drawer, tabs, dataRoutes)
  pages/                 — Screen components
  components/            — Reusable UI components
  utils/                 — Utilities, hooks
  services/ExpoNotification/ — Custom notification sender
  services/DiscordAlerts/    — Discord error reporting
  services/Storage/          — UserStorage (AsyncStorage)
  services/MercadoPago/      — Payment integration
  functions/               — Cloud Functions source
tests/                     — Unit tests
functions/                 — Cloud Functions (Node 20)
android/                   — Android native (Expo managed)
ios/                       — iOS native (Expo managed)
```

## 2. Firebase Web SDK Imports — Complete Inventory

### Central Firebase Service
- **`src/services/Firebase/index.js`**: Initializes app, auth, firestore, storage, functions
  - `firebase/app`: `initializeApp`, `getApps`
  - `firebase/auth`: `getAuth`, `initializeAuth`, `getReactNativePersistence`
  - `firebase/firestore`: `getFirestore`, `initializeFirestore`
  - `firebase/storage`: `getStorage`
  - `firebase/functions`: `getFunctions`

### Auth Controllers (firebase/auth)
- `src/controllers/User/authentication.js`: `getAuth`, `signInWithEmailAndPassword`
- `src/controllers/User/register.js`: `getAuth`, `createUserWithEmailAndPassword`
- `src/controllers/User/resetPassword.js`: `getAuth`, `sendPasswordResetEmail`
- `src/controllers/User/resetPasswordByIdentifier.js`: `httpsCallable` (from `firebase/functions`)

### Firestore Controllers (firebase/firestore)
- `src/controllers/Chat/index.js`: `onSnapshot`, `doc`, `setDoc`, `addDoc`, `updateDoc`, `deleteDoc`, `getDoc`, `getDocs`, `query`, `where`, `orderBy`, `collection`
- `src/controllers/Chat/attention.js`: `doc`, `getDoc`, `updateDoc`
- `src/controllers/Chat/messageActions.js`: `doc`, `setDoc`, `updateDoc`, `deleteDoc`
- `src/controllers/Chat/ratings.js`: `doc`, `setDoc`
- `src/controllers/Chat/sold.js`: `doc`, `setDoc`
- `src/controllers/Chat/uploadAudio.js`: `getDownloadURL`, `ref`, `uploadBytes` (storage)
- `src/controllers/Chat/uploadFile.js`: `getDownloadURL`, `ref`, `uploadBytes` (storage)
- `src/controllers/Chat/uploadImage.js`: `getDownloadURL`, `ref`, `uploadBytes` (storage)
- `src/controllers/Chat/uploadVideo.js`: `getDownloadURL`, `ref`, `uploadBytes` (storage)
- `src/controllers/Config/find.js`: `doc`, `getDoc`
- `src/controllers/Cupons/createCupom.js`: `doc`, `setDoc`
- `src/controllers/Cupons/decreaseAmountCupom.js`: `doc`, `setDoc`
- `src/controllers/Cupons/defaultCoupon.js`: `doc`, `getDoc`, `setDoc`
- `src/controllers/Cupons/deleteCupom.js`: `deleteDoc`, `doc`
- `src/controllers/Cupons/getCupom.js`: `doc`, `getDoc`
- `src/controllers/Cupons/incrementAmountCupom.js`: `doc`, `setDoc`
- `src/controllers/DrawPrizes/create.js`: `doc`, `setDoc`
- `src/controllers/DrawPrizes/delete.js`: `doc`, `setDoc`
- `src/controllers/DrawPrizes/get.js`: `collection`, `getDocs`, `orderBy`, `query`
- `src/controllers/DrawPrizes/live.js`: `doc`, `onSnapshot`, `setDoc`, `updateDoc`
- `src/controllers/DrawPrizes/rules.js`: `collection`, `doc`, `getDocs`, `query`, `setDoc`, `addDoc`, `updateDoc`, `deleteDoc`
- `src/controllers/Invitations/create.js`: `doc`, `setDoc`
- `src/controllers/Invitations/delete.js`: `deleteDoc`, `doc`
- `src/controllers/Invitations/find.js`: `doc`, `getDoc`, `getDocs`, `query`, `where`
- `src/controllers/Invitations/update.js`: `doc`, `setDoc`
- `src/controllers/Notifications/getAllNotifications.js`: `collection`, `getDocs`, `orderBy`, `query`
- `src/controllers/Notifications/saveNotification.js`: `doc`, `setDoc`
- `src/controllers/Notifications/updateNotification.js`: `doc`, `setDoc`
- `src/controllers/Payment/order.js`: `collection`, `deleteDoc`, `doc`, `getDoc`, `getDocs`, `orderBy`, `query`, `setDoc`, `where`
- `src/controllers/Publication/delete.js`: `deleteDoc`, `doc`, `deleteObject`, `ref` (storage)
- `src/controllers/Publication/getPublicationViewsLogs.js`: `doc`, `getDoc`
- `src/controllers/Publication/getUserPublications.js`: `collection`, `getDocs`, `orderBy`, `query`, `where`
- `src/controllers/Publication/getViewLogs.js`: `collection`, `getDocs`, `query`
- `src/controllers/Publication/getViewLogsSummary.js`: `doc`, `getDoc`
- `src/controllers/Publication/requestAnalysis.js`: `doc`, `setDoc`
- `src/controllers/Publication/savePondsImages.js`: `getDownloadURL`, `ref`, `uploadBytes` (storage)
- `src/controllers/Publication/saveShrimpPonds.js`: `doc`, `setDoc`
- `src/controllers/Publication/setNewVisuaization.js`: `doc`, `setDoc`
- `src/controllers/Publication/updatePublication.js`: `doc`, `setDoc`
- `src/controllers/PublishAds/delete.js`: `deleteDoc`, `doc`, `deleteObject`, `ref` (storage)
- `src/controllers/PublishAds/getPublishAds.js`: `collection`, `getDocs`, `orderBy`, `query`, `where`
- `src/controllers/PublishAds/saveAds.js`: `doc`, `setDoc` (firestore) + `ref`, `uploadBytes` (storage)
- `src/controllers/PublishAds/update.js`: `doc`, `setDoc`
- `src/controllers/ShirimpSale/sale.js`: `doc`, `setDoc`, `getDoc`, `getDocs`, `query`, `where`
- `src/controllers/ShrimpPonds/getAll.js`: `collection`, `getDocs`, `query`, `where`, `orderBy`, `doc`
- `src/controllers/ShrimpPonds/getShrimpPrice.js`: `collection`, `doc`, `getDoc`, `getDocs`, `query`
- `src/controllers/ShrimpPonds/saveShrimpPrice10g.js`: `doc`, `setDoc`
- `src/controllers/ShrimpPonds/updateShripmPrice.js`: `doc`, `setDoc`
- `src/controllers/Signature/get.js`: `collection`, `getDocs`, `query`
- `src/controllers/User/getAll.js`: `collection`, `getDocs`, `orderBy`, `query`, `where`
- `src/controllers/User/deleteUser.js`: `deleteDoc`, `doc`, `setDoc` (firestore) + `deleteObject`, `ref` (storage)
- `src/controllers/User/getPasswordResetToken.js`: `httpsCallable` (functions)
- `src/controllers/User/getSummary.js`: `doc`, `getDoc`
- `src/controllers/User/notification.js`: `collection`, `doc`, `getDoc`, `getDocs`, `query`, `setDoc`
- `src/controllers/User/register.js`: `doc`, `getDoc`, `setDoc` (firestore) + `getAuth`, `createUserWithEmailAndPassword` (auth)
- `src/controllers/User/saveImage.js`: `doc`, `setDoc` (firestore) + `getDownloadURL`, `ref`, `uploadBytes` (storage)
- `src/controllers/User/update.js`: `doc`, `setDoc`
- `src/controllers/User/updateAddress.js`: `doc`, `setDoc`
- `src/controllers/User/updateToProductor.js`: `doc`, `setDoc`
- `src/controllers/Wallet/create.js`: `doc`, `setDoc`
- `src/controllers/Wallet/delete.js`: `deleteDoc`, `doc`
- `src/controllers/Wallet/find.js`: `doc`, `getDoc`
- `src/controllers/Wallet/update.js`: `doc`, `setDoc`

### Storage Controllers (firebase/storage)
- `src/controllers/Chat/uploadAudio.js`: `getDownloadURL`, `ref`, `uploadBytes`
- `src/controllers/Chat/uploadFile.js`: `getDownloadURL`, `ref`, `uploadBytes`
- `src/controllers/Chat/uploadImage.js`: `getDownloadURL`, `ref`, `uploadBytes`
- `src/controllers/Chat/uploadVideo.js`: `getDownloadURL`, `ref`, `uploadBytes`
- `src/controllers/Publication/savePondsImages.js`: `getDownloadURL`, `ref`, `uploadBytes`
- `src/controllers/PublishAds/saveAds.js`: `ref`, `uploadBytes`
- `src/controllers/PublishAds/delete.js`: `deleteObject`, `ref`
- `src/controllers/User/deleteUser.js`: `deleteObject`, `ref`
- `src/controllers/User/saveImage.js`: `getDownloadURL`, `ref`, `uploadBytes`

### Functions Controllers (firebase/functions)
- `src/controllers/User/getPasswordResetToken.js`: `httpsCallable`
- `src/controllers/User/resetPasswordByIdentifier.js`: `httpsCallable`

### Network Utility (firebase/firestore)
- `src/utils/hooks/useInternetConnection.jsx`: `disableNetwork`, `enableNetwork`

### Admin Pages (firebase/firestore)
- `src/pages/Admin/DrawPrize/DrawPrizeNew.jsx`: `collection`, `query`, `where`, `getDocs`
- `src/pages/Admin/DrawPrizeRules/DrawPrizeRulesNew.jsx`: `collection`, `query`, `where`, `getDocs`

### Chat Pages (firebase/firestore)
- `src/pages/MyChats/index.jsx`: `doc`, `getDoc`
- `src/pages/PublicationChat/index.jsx`: `doc`, `getDoc`
- `src/pages/PublicationDetail/index.jsx`: `doc`, `getDoc`
- `src/pages/UserProfile/index.jsx`: `doc`, `getDoc`

### Notification System
- `src/services/ExpoNotification/sendNotification.js`: Uses Expo push API (NOT Firebase)
- `src/controllers/Notifications/sendNotifications.js`: Batches Expo push notifications
- `src/controllers/Notifications/sendNotificationNewPublication.js`: Triggers notifications on new publications
- `src/controllers/User/notification.js`: Manages user notification tokens in Firestore

## 3. Hotspots (High Conflict Risk)

| File | Risk | Reason |
|------|------|--------|
| `src/services/Firebase/index.js` | CRITICAL | Central Firebase initialization — all services depend on it |
| `src/services/Firebase/config.js` | HIGH | Firebase config values — used everywhere |
| `src/services/Firebase/models.js` | HIGH | Firestore collection names — referenced by all controllers |
| `App.jsx` | HIGH | Main app entry — notification setup, Sentry, providers |
| `src/routes/index.jsx` | HIGH | Navigation root — `navigationRef` used in notifications |
| `src/routes/dataRoutes.js` | MEDIUM | Route names — referenced by navigation and notifications |
| `src/store/reducers.js` | MEDIUM | Redux root reducer — all state slices |
| `firestore.rules` | HIGH | Security rules — must be updated with orders/admin rules |
| `storage.rules` | MEDIUM | Storage rules — must be updated for new paths |
| `package.json` | HIGH | Dependencies — will need @react-native-firebase packages |
| `functions/src/index.js` | HIGH | Cloud Functions entry — may need admin SDK changes |
| `src/controllers/Payment/order.js` | HIGH | Financial data — orders with payment values |
| `src/controllers/User/authentication.js` | CRITICAL | Auth flow — must migrate to React Native Firebase Auth |

## 4. Dependency Graph (Actual)

```
App.jsx
  → src/services/Firebase/index.js (init)
  → src/services/Firebase/config.js (config)
  → src/services/Firebase/models.js (collection names)
  → src/routes/index.jsx (navigationRef)
  → src/store/index.js (Redux)
  → src/store/reducers.js (Redux reducers)
  → src/services/ExpoNotification/sendNotification.js
  → src/services/DiscordAlerts/context.js

All controllers
  → src/services/Firebase/index.js (firestore, storage, functions, auth)
  → src/services/Firebase/models.js (collection names)

All pages
  → Controllers (indirectly via Firebase)
  → src/services/Firebase/index.js (indirectly)
```

## 5. Firebase APIs Used

| Firebase Module | APIs Used | Migration Target |
|----------------|-----------|-----------------|
| `firebase/app` | `initializeApp`, `getApps` | `@react-native-firebase/app` |
| `firebase/auth` | `getAuth`, `initializeAuth`, `getReactNativePersistence`, `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `sendPasswordResetEmail` | `@react-native-firebase/auth` |
| `firebase/firestore` | `getFirestore`, `initializeFirestore`, `doc`, `setDoc`, `getDoc`, `getDocs`, `query`, `where`, `orderBy`, `collection`, `addDoc`, `updateDoc`, `deleteDoc`, `onSnapshot`, `disableNetwork`, `enableNetwork` | `@react-native-firebase/firestore` |
| `firebase/storage` | `getStorage`, `ref`, `uploadBytes`, `getDownloadURL`, `deleteObject` | `@react-native-firebase/storage` |
| `firebase/functions` | `getFunctions`, `httpsCallable` | `@react-native-firebase/functions` |
| `firebase/messaging` | NOT USED IN CODE (config present) | `@react-native-firebase/messaging` (if needed) |
| `firebase/analytics` | NOT USED IN CODE (config present) | `@react-native-firebase/analytics` (if needed) |

## 6. Notification Strategy

- **Current**: Expo Notifications (`expo-notifications` v0.31.5)
- **Token management**: User notification tokens stored in Firestore `users` collection under `notification.token` field
- **Push sending**: Custom `sendNotification.js` calls Expo push API (`https://exp.host/--/api/v2/push/send`)
- **Notification handling**: `App.jsx` sets `Notifications.setNotificationHandler`, listens for `addNotificationResponseReceivedListener` and `addNotificationReceivedListener`
- **Deep linking**: Navigation via `navigationRef.navigate()` with retry logic (polling `navigationRef.isReady()`)
- **Channels**: Android notification channel `notifications-app` created in App.jsx

## 7. Orders Structure

Firestore collection: `orders`
Key fields per order document:
- `idOrder` (string) — unique order identifier
- `userId` (string) — user email
- `paymentValue` (number) — payment amount
- `status` (string) — e.g., "approved", "pending"
- `published` (boolean) — whether order is published
- `dataPublication` (object) — publication data
- `dataCupomPayment` (object) — coupon payment data
- `paymentUrl` (string) — payment URL
- `paymentLog` (object) — PIX payment log
- `createdAt` (Date/Timestamp)
- `updatedAt` (Date/Timestamp)
- `user` (object) — user data (embedded)

Local caches in `src/controllers/Payment/order.js`:
- `cachedApprovedOrders` (array, TTL 60s)
- `cachedApprovedOrdersByYear` (object keyed by year)

## 8. Cloud Functions (Existing)

| Function | Trigger | Purpose |
|----------|---------|---------|
| `getPasswordResetToken` | onCall | Validates user by CPF/phone |
| `resetPasswordByIdentifier` | onCall | Resets password via Admin SDK |
| `paymentpix` | onRequest (HTTP) | Handles PIX payment |
| `paymentwebhook` | onRequest (HTTP) | Payment webhook handler |
| `onRatingWritten` | Firestore trigger | Handles rating writes |
| `onChatMessageCreated` | Firestore trigger | Chat notification fan-out |
| `onUserWritten` | Firestore trigger | User document changes |
| `onPublicationViewWritten` | Firestore trigger | Publication view tracking |
| `mondayProducerReminder` | Scheduled | Monday producer reminder |
| `tuesdayProducerReminder` | Scheduled | Tuesday producer reminder |
| `wednesdayClientReminder` | Scheduled | Wednesday client reminder |
| `thursdayClientReminder` | Scheduled | Thursday client reminder |

**Missing**: No `adminDashboardMetrics` function exists yet (Task 14).

## 9. Firestore Rules Summary

- **Auth model**: Email-based (not UID-based) — `request.auth.token.email` used for ownership
- **Collections covered**: users, chats, messages, ratings, reports, shrimpPonds, logPublicationsViews, cupons, orders, wallets, invitations, config, publishAds, feedBack, drawPrizesHistory, drawPrizesLive, drawPrizesRules, newDrawPrizeRules, notifications, listSignatures, shirimpSale, shrimpPrice, stats, publicationViewsRollup
- **Admin check**: `isAdmin()` function checks `users/{email}.rules` for `['Admin']`
- **Known gaps**: orders status/published can be set client-side (not purely server-side)

## 10. Storage Rules Summary

- **Public read**: user/, Shrimp/, ads/ paths
- **Authenticated write**: user/, Shrimp/, ads/ paths
- **Chat attachments**: chats/{chatId}/** requires auth
- **Default deny**: all other paths

## 11. Redux Structure

| Slice | Reducer | Source |
|-------|---------|--------|
| login | LoginReducer | pages/Login/reducer |
| publication | PublicationReducer | pages/Publication/reducer |
| shrimpCardShared | ShrimpCardSharedReducer | components/ShrimpCardShared/reducer |
| payment | PaymentReducer | pages/Payment/reducer |
| invitation | InvitationReducer | pages/ValidateInvitation/reducer |
| paymentWallet | PaymentWalletReducer | pages/Payment/components/ResumeCrad/reducer |
| configSystem | ConfigDataReducer | components/AlertNewVersion/reducer |
| notificationExecute | NotificationExecuteReducer | components/Header/reducer |

## 12. Scripts Available

**Root package.json**: `start`, `android`, `ios`, `web`, `eject`, `lint`, `test`
**Functions package.json**: `serve`, `deploy`, `test` (jest)

## 13. Tests Available

- **Unit tests**: 65+ tests in `tests/` directory (Jest)
- **Functions tests**: 7 tests in `functions/src/` (`.test.js` files)
- **No E2E tests**

## 14. Android/iOS/EAS Setup

- **Expo managed workflow** (no bare React Native)
- **EAS**: Project ID `9b561f08-e352-4697-940d-bca41e1c5cc6`
- **Android**: `google-services.json` present, `com.google.android.gms.permission.AD_ID` permission
- **iOS**: Standard Expo Podfile, no Firebase pods currently
- **No `android/` directory** at root (Expo managed)
- **iOS**: `ios/Podfile`, `ios/QueroCamarao.xcodeproj`

## 15. DAG Comparison — Planned vs Actual

### Planned Dependencies (from orchestrator doc):
```
1 → 2
1+2 → 3,4,11,23
3+4 → 5
3+4+5 → 6
3+4+5+6 → 8
3+4+5+6+8 → 9
11 → 12,13
9+11+12+13 → 14 → 15 → 16 → 17
4 → 10
10+18+19 → 20 → 21 → 22
23 → 24
5+11+12+13 → 25
8 → 26
All implementations → 27 → 28 → 29 → 30
```

### Actual Dependencies (from codebase analysis):

**Confirmed correct:**
- 1 → 2 (audit must precede import matrix) ✓
- 3+4 → 5 (adapter + native setup must precede auth migration) ✓
- 3+4 → 6 (adapter + native setup must precede Firestore read migration) ✓
- 3+4 → 8 (adapter + native setup must precede Storage migration) ✓
- 3+4 → 9 (adapter + native setup must precede Functions migration) ✓
- 11 → 12,13 (order contract must precede reader/writer) ✓
- 11+12+13 → 14 (order contract + reader + writer must precede dashboard metrics) ✓
- 14 → 15 → 16 → 17 (metrics → tests → dashboard → remove bulk download) ✓
- 8 → 26 (Storage migration must precede Storage rules) ✓

**Adjustments needed:**

1. **Task 7 depends on Task 11 (order contract)**: The orchestrator doc says task 7 (Firestore write path) should consider the order contract before modifying order-related paths. This is correct — `src/controllers/Payment/order.js` writes to the `orders` collection, so the order contract must be defined first. **DAG is correct.**

2. **Task 10 (Messaging/Expo) depends on Task 4 (native setup)**: The orchestrator doc says `4 → 10`. This is correct because React Native Firebase Messaging requires native setup first. **DAG is correct.**

3. **Task 23 (Redux inventory) and Task 24 (cache removal) depend on Task 23 first**: The orchestrator doc says `23 → 24`. This is correct. **DAG is correct.**

4. **Task 25 (Firestore rules) depends on Tasks 5, 11, 12, 13**: The orchestrator doc says `5+11+12+13 → 25`. This is correct because Firestore rules for orders depend on the order contract and auth migration. **DAG is correct.**

5. **Task 18 (App.jsx refactor) and Task 19 (Providers) should precede Task 20 (Notification payload contract)**: The orchestrator doc says `10+18+19 → 20`. This is correct because the notification payload contract depends on the App.jsx being refactored into a composition root with providers. **DAG is correct.**

6. **Missing dependency**: Task 22 (remove polling `navigationRef.isReady`) depends on Task 21 (notification router and deep linking). The orchestrator doc shows `21 → 22` but doesn't explicitly show `20 → 21`. The notification payload contract (20) must be defined before the notification router (21) can be implemented. **DAG is correct.**

7. **Task 27 (observability) depends on all implementations**: The orchestrator doc says `all implementations → 27`. This is correct. **DAG is correct.**

8. **Task 28 (performance audit) depends on 27**: The orchestrator doc says `27 → 28`. This is correct — observability must be in place before performance auditing. **DAG is correct.**

9. **Task 29 (Android/iOS/EAS validation) depends on 28**: The orchestrator doc says `28 → 29`. This is correct. **DAG is correct.**

10. **Task 30 (final checklist) depends on 29**: The orchestrator doc says `29 → 30`. This is correct. **DAG is correct.**

### No dependency corrections needed — the DAG accurately reflects the codebase.

## 16. Risk Assessment

| Risk | Level | Mitigation |
|------|-------|-----------|
| Firebase init refactor breaking all services | CRITICAL | Keep Web SDK adapter during transition; test thoroughly |
| Auth migration breaking login flow | CRITICAL | Maintain backward compatibility during migration |
| Orders financial data corruption | CRITICAL | Write validation + Cloud Functions for financial ops |
| Notification routing breakage | HIGH | Payload contract + deep linking tests |
| Firestore rules gaps | HIGH | Comprehensive rules review + testing |
| Storage rules gaps | MEDIUM | Public images must remain accessible |
| Redux state inconsistency | MEDIUM | Incremental migration, keep existing reducers |
| EAS build breakage | MEDIUM | Test on preview channel before production |
| Performance regression from listeners | MEDIUM | Audit re-renders and listener counts |
| Expo → React Native Firebase messaging migration | MEDIUM | Decide strategy early (Expo Notifications vs RN Firebase) |

## 17. Key Findings

1. **44 files** import from Firebase Web SDK — all need migration to `@react-native-firebase/*`
2. **1 central file** (`src/services/Firebase/index.js`) is the initialization point — highest risk
3. **No `firebase/messaging` or `firebase/analytics` imports** in code despite config values — can be skipped
4. **Expo Notifications** is the current push notification system — decision needed on whether to migrate to React Native Firebase Messaging
5. **Orders use email as document ID** (not Firebase Auth UID) — this pattern must be preserved in migration
6. **Cloud Functions use `firebase-admin`** (server-side) — out of scope for client migration but may need updates for new SDK
7. **No `android/` directory** at root — Expo managed workflow, native config is in `app.json` and `eas.json`
8. **No Firestore rules for `adminDashboardMetrics`** — this is a new function (Task 14) that will need rules
9. **Local caches in `order.js`** (60s TTL) should be replaced with proper state management (Task 24)
10. **`navigationRef.isReady()` polling** in notification handler (App.jsx lines 198-235) should be eliminated (Task 22)
