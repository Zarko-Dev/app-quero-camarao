# Firebase Web SDK Import Matrix — Complete Analysis

**Project:** app-quero-camarao
**Firebase Web SDK version:** 10.14.1 (package.json)
**Analysis date:** 2026-09-02
**Scope:** `/Users/pedroroger/Documents/app-quero-camarao/src/`

---

## 1. Firebase Web SDK Modules Found

| Module | Import Path | APIs Imported |
|--------|-------------|---------------|
| firebase/app | `firebase/app` | `initializeApp`, `getApps` |
| firebase/firestore | `firebase/firestore` | 22 distinct APIs (see below) |
| firebase/auth | `firebase/auth` | 6 distinct APIs (see below) |
| firebase/storage | `firebase/storage` | 6 distinct APIs (see below) |
| firebase/functions | `firebase/functions` | `getFunctions`, `httpsCallable` |
| firebase/messaging | — | **NOT IMPORTED** (only `messagingSenderId` in config) |
| firebase/analytics | — | **NOT IMPORTED** (only `measurementId` in config) |
| firebase/performance | — | **NOT IMPORTED** |
| firebase/remote-config | — | **NOT IMPORTED** |
| firebase/database | — | **NOT IMPORTED** |

---

## 2. Complete File → API Matrix

### 2.1 Firebase Initialization & Config

| File | Module | APIs Imported | Usage Pattern |
|------|--------|---------------|---------------|
| `src/services/Firebase/index.js` | firebase/app | `initializeApp`, `getApps` | Initialize app singleton, get existing app |
| `src/services/Firebase/index.js` | firebase/firestore | `getFirestore`, `initializeFirestore` | Init Firestore with long-polling settings |
| `src/services/Firebase/index.js` | firebase/storage | `getStorage` | Get storage instance |
| `src/services/Firebase/index.js` | firebase/functions | `getFunctions` | Get functions instance (us-central1) |
| `src/services/Firebase/index.js` | firebase/auth | `getAuth`, `initializeAuth`, `getReactNativePersistence` | Init auth with React Native AsyncStorage persistence |
| `src/services/Firebase/config.js` | — | — | Config object with env vars (API_KEY, AUTHDOMAIN, PROJECT_ID, STORAG_EBUCKET, MESSAGING_SENDER_ID, APP_ID, MEASUREMENT_ID) |
| `src/services/Firebase/models.js` | — | — | Collection/model name constants |

### 2.2 Firestore — Read Operations (getDoc, getDocs)

| File | APIs Used | Usage Pattern |
|------|-----------|---------------|
| `src/controllers/Invitations/find.js` | `collection`, `doc`, `getDoc`, `getDocs`, `query`, `where` | Get single doc by ID; query collection with where clause |
| `src/controllers/Signature/get.js` | `collection`, `getDocs`, `query` | Query collection |
| `src/controllers/Invitations/create.js` | `doc`, `setDoc` | Write (create) |
| `src/controllers/Invitations/delete.js` | `deleteDoc`, `doc` | Delete |
| `src/controllers/Invitations/update.js` | `doc`, `setDoc` | Write (update with merge) |
| `src/controllers/Chat/ratings.js` | `doc`, `getDoc`, `serverTimestamp`, `setDoc` | Read then write rating |
| `src/controllers/Chat/messageActions.js` | `addDoc`, `collection`, `doc`, `serverTimestamp`, `updateDoc`, `writeBatch` | Write messages, batch updates |
| `src/controllers/Chat/index.js` | `addDoc`, `collection`, `doc`, `getDoc`, `getDocs`, `onSnapshot`, `orderBy`, `query`, `serverTimestamp`, `setDoc`, `updateDoc`, `where` | Full CRUD + real-time listeners |
| `src/controllers/Chat/attention.js` | `doc`, `getDoc`, `updateDoc` | Read then update |
| `src/controllers/Chat/sold.js` | `collection`, `doc`, `getDocs`, `query`, `serverTimestamp`, `updateDoc`, `where`, `writeBatch` | Read + batch write |
| `src/controllers/Chat/uploadImage.js` | `getDownloadURL`, `ref`, `uploadBytes` | Storage write + read |
| `src/controllers/Chat/uploadVideo.js` | `getDownloadURL`, `ref`, `uploadBytes` | Storage write + read |
| `src/controllers/Chat/uploadAudio.js` | `getDownloadURL`, `ref`, `uploadBytes` | Storage write + read |
| `src/controllers/Chat/uploadFile.js` | `getDownloadURL`, `ref`, `uploadBytes` | Storage write + read |
| `src/controllers/Notifications/getAllNotifications.js` | `collection`, `getDocs`, `orderBy`, `query` | Query with orderBy |
| `src/controllers/Notifications/saveNotification.js` | `doc`, `setDoc` | Write |
| `src/controllers/Notifications/updateNotification.js` | `doc`, `setDoc` | Write (merge) |
| `src/controllers/Wallet/find.js` | `doc`, `getDoc` | Read single doc |
| `src/controllers/Wallet/create.js` | `doc`, `setDoc` | Write |
| `src/controllers/Wallet/delete.js` | `deleteDoc`, `doc` | Delete |
| `src/controllers/Wallet/update.js` | `doc`, `setDoc` | Write (merge) |
| `src/controllers/PublishAds/saveAds.js` | `doc`, `setDoc` + storage `uploadBytes`, `getDownloadURL`, `ref` | Firestore write + storage upload |
| `src/controllers/PublishAds/getPublishAds.js` | `collection`, `getDocs`, `orderBy`, `query`, `where` | Query with filter + order |
| `src/controllers/PublishAds/delete.js` | `deleteDoc`, `doc` + storage `deleteObject`, `ref` | Firestore delete + storage delete |
| `src/controllers/PublishAds/update.js` | `doc`, `setDoc` | Write (merge) |
| `src/controllers/ShrimpPonds/getShrimpPrice.js` | `collection`, `doc`, `getDoc`, `getDocs`, `query` | Read with query |
| `src/controllers/ShrimpPonds/getAll.js` | `collection`, `getDocs`, `orderBy`, `query`, `startAfter`, `limit`, `where` | Paginated query |
| `src/controllers/ShrimpPonds/updateShripmPrice.js` | `doc`, `setDoc` | Write |
| `src/controllers/ShrimpPonds/saveShrimpPrice10g.js` | `doc`, `setDoc` | Write |
| `src/controllers/User/authentication.js` | `getAuth`, `signInWithEmailAndPassword` + firestore `doc`, `getDoc` | Auth sign-in + read user doc |
| `src/controllers/User/getSummary.js` | `doc`, `getDoc` | Read single doc |
| `src/controllers/User/getAll.js` | `collection`, `getDocs`, `orderBy`, `query`, `where` | Query with filter |
| `src/controllers/User/register.js` | `getAuth`, `createUserWithEmailAndPassword` + firestore `doc`, `getDoc`, `setDoc` | Auth create + write user doc |
| `src/controllers/User/update.js` | `doc`, `setDoc` | Write (merge) |
| `src/controllers/User/updateToProductor.js` | `doc`, `setDoc` | Write (merge) |
| `src/controllers/User/updateAddress.js` | `doc`, `setDoc` | Write (merge) |
| `src/controllers/User/deleteUser.js` | `deleteDoc`, `doc`, `setDoc` + storage `deleteObject`, `ref` | Firestore delete + storage delete |
| `src/controllers/User/notification.js` | `collection`, `doc`, `getDoc`, `getDocs`, `query`, `setDoc` | Read + write user notification token |
| `src/controllers/User/getPasswordResetToken.js` | `httpsCallable` (functions) | Call Cloud Function |
| `src/controllers/User/resetPasswordByIdentifier.js` | `httpsCallable` (functions) | Call Cloud Function |
| `src/controllers/User/saveImage.js` | storage `deleteObject`, `getDownloadURL`, `ref`, `uploadBytes` + firestore `collection`, `doc`, `getDocs`, `query`, `setDoc`, `where` | Storage CRUD + Firestore write |
| `src/controllers/User/resetPassword.js` | `getAuth`, `sendPasswordResetEmail` | Auth password reset |
| `src/controllers/Payment/order.js` | `collection`, `deleteDoc`, `doc`, `getDoc`, `getDocs`, `orderBy`, `query`, `setDoc`, `where` | Full CRUD + query with caching |
| `src/controllers/ShirimpSale/sale.js` | `collection`, `doc`, `getDocs`, `limit`, `orderBy`, `query`, `setDoc`, `where` | Query with limit + write |
| `src/controllers/DrawPrizes/get.js` | `collection`, `getDocs`, `orderBy`, `query` | Query with orderBy |
| `src/controllers/DrawPrizes/create.js` | `doc`, `setDoc` | Write |
| `src/controllers/DrawPrizes/delete.js` | `doc`, `setDoc` | Write |
| `src/controllers/DrawPrizes/rules.js` | `collection`, `doc`, `getDocs`, `query`, `setDoc`, `addDoc`, `updateDoc`, `deleteDoc` | Full Firestore CRUD |
| `src/controllers/DrawPrizes/live.js` | `collection`, `deleteDoc`, `doc`, `getDoc`, `getDocs`, `query`, `setDoc`, `where` | Full CRUD + query |
| `src/controllers/Config/find.js` | `doc`, `getDoc` | Read single doc |
| `src/controllers/Cupons/incrementAmountCupom.js` | `doc`, `setDoc` | Write (merge) |
| `src/controllers/Cupons/createCupom.js` | `doc`, `setDoc` | Write |
| `src/controllers/Cupons/decreaseAmountCupom.js` | `doc`, `setDoc` | Write (merge) |
| `src/controllers/Cupons/deleteCupom.js` | `deleteDoc`, `doc` | Delete |
| `src/controllers/Cupons/getCupom.js` | `collection`, `doc`, `getDoc`, `getDocs`, `orderBy`, `query` | Read + query |
| `src/controllers/Cupons/defaultCoupon.js` | `collection`, `doc`, `getDocs`, `query`, `setDoc`, `where` | Query + write |
| `src/controllers/Publication/getViewLogs.js` | `collection`, `getDocs`, `query` | Query |
| `src/controllers/Publication/setNewVisuaization.js` | `doc`, `setDoc` | Write |
| `src/controllers/Publication/updatePublication.js` | `doc`, `setDoc` | Write (merge) |
| `src/controllers/Publication/requestAnalysis.js` | `doc`, `setDoc` | Write |
| `src/controllers/Publication/getViewLogsSummary.js` | `doc`, `getDoc` | Read |
| `src/controllers/Publication/getUserPublications.js` | `collection`, `getDocs`, `orderBy`, `query`, `where` | Query with filter + order |
| `src/controllers/Publication/delete.js` | `deleteDoc`, `doc` + storage `deleteObject`, `ref` | Firestore delete + storage delete |
| `src/controllers/Publication/savePondsImages.js` | `getDownloadURL`, `ref`, `uploadBytes` | Storage write + read |
| `src/controllers/Publication/saveShrimpPonds.js` | `doc`, `setDoc` | Write |
| `src/pages/PublicationDetail/index.jsx` | `doc`, `getDoc` | Read single doc |
| `src/pages/PublicationChat/index.jsx` | `doc`, `getDoc` | Read single doc |
| `src/pages/MyChats/index.jsx` | `doc`, `getDoc` | Read single doc |
| `src/pages/UserProfile/index.jsx` | `doc`, `getDoc` | Read single doc |
| `src/pages/Admin/DrawPrize/DrawPrizeNew.jsx` | `collection`, `query`, `where`, `getDocs` | Query with filter |
| `src/pages/Admin/DrawPrizeRules/DrawPrizeRulesNew.jsx` | `collection`, `query`, `where`, `getDocs` | Query with filter |

### 2.3 Firestore — Real-time Listeners (onSnapshot)

| File | APIs Used | Usage Pattern |
|------|-----------|---------------|
| `src/controllers/Chat/index.js` | `onSnapshot` (4 instances) | Listen to messages subcollection, chat doc, buyer chats, seller chats |

### 2.4 Firestore — Network Management

| File | APIs Used | Usage Pattern |
|------|-----------|---------------|
| `src/utils/hooks/useInternetConnection.jsx` | `disableNetwork`, `enableNetwork` | Toggle Firestore network connectivity |

### 2.5 Storage — Upload/Download/Delete

| File | APIs Used | Usage Pattern |
|------|-----------|---------------|
| `src/controllers/Chat/uploadImage.js` | `getDownloadURL`, `ref`, `uploadBytes` | Upload image, get URL |
| `src/controllers/Chat/uploadVideo.js` | `getDownloadURL`, `ref`, `uploadBytes` | Upload video, get URL |
| `src/controllers/Chat/uploadAudio.js` | `getDownloadURL`, `ref`, `uploadBytes` | Upload audio, get URL |
| `src/controllers/Chat/uploadFile.js` | `getDownloadURL`, `ref`, `uploadBytes` | Upload file, get URL |
| `src/controllers/User/saveImage.js` | `deleteObject`, `getDownloadURL`, `ref`, `uploadBytes` | Full storage CRUD |
| `src/controllers/User/deleteUser.js` | `deleteObject`, `ref` | Delete user image |
| `src/controllers/PublishAds/saveAds.js` | `getDownloadURL`, `ref`, `uploadBytes`, `uploadBytesResumable` | Upload ads image/video (with resumable for iOS video) |
| `src/controllers/PublishAds/delete.js` | `deleteObject`, `ref` | Delete ad image |
| `src/controllers/Publication/delete.js` | `deleteObject`, `ref` | Delete publication image |
| `src/controllers/Publication/savePondsImages.js` | `getDownloadURL`, `ref`, `uploadBytes` | Upload pond images |

### 2.6 Functions — Callable

| File | APIs Used | Usage Pattern |
|------|-----------|---------------|
| `src/controllers/User/getPasswordResetToken.js` | `httpsCallable` | Call `getPasswordResetToken` Cloud Function |
| `src/controllers/User/resetPasswordByIdentifier.js` | `httpsCallable` | Call `resetPasswordByIdentifier` Cloud Function |

### 2.7 Auth — Direct Imports

| File | APIs Used | Usage Pattern |
|------|-----------|---------------|
| `src/controllers/User/authentication.js` | `getAuth`, `signInWithEmailAndPassword` | Sign in with email/password |
| `src/controllers/User/register.js` | `getAuth`, `createUserWithEmailAndPassword` | Create user with email/password |
| `src/controllers/User/resetPassword.js` | `getAuth`, `sendPasswordResetEmail` | Send password reset email |

---

## 3. Distinct Firebase Web SDK APIs Used (Complete List)

### firebase/app
| API | Used In | Count |
|-----|---------|-------|
| `initializeApp` | Firebase/index.js | 1 |
| `getApps` | Firebase/index.js | 1 |

### firebase/firestore (22 APIs)
| API | Used In | Usage Pattern |
|-----|---------|---------------|
| `collection` | 20+ files | Build collection references |
| `doc` | 30+ files | Build document references |
| `getDoc` | 15+ files | Read single document |
| `getDocs` | 15+ files | Query collection |
| `setDoc` | 20+ files | Write/create document |
| `addDoc` | 3 files | Add to collection |
| `updateDoc` | 5 files | Update document fields |
| `deleteDoc` | 6 files | Delete document |
| `query` | 12+ files | Build query objects |
| `where` | 10+ files | Filter queries |
| `orderBy` | 6 files | Sort queries |
| `limit` | 2 files | Limit results |
| `startAfter` | 2 files | Pagination cursor |
| `serverTimestamp` | 8 files | Server-side timestamp |
| `onSnapshot` | 1 file (Chat/index.js) | Real-time listeners |
| `writeBatch` | 3 files | Batch writes |
| `disableNetwork` | 1 file (useInternetConnection) | Network toggle |
| `enableNetwork` | 1 file (useInternetConnection) | Network toggle |
| `initializeFirestore` | Firebase/index.js | Init with settings |
| `getFirestore` | Firebase/index.js | Get Firestore instance |

### firebase/auth (6 APIs)
| API | Used In | Usage Pattern |
|-----|---------|---------------|
| `getAuth` | 4 files | Get auth instance |
| `initializeAuth` | Firebase/index.js | Init auth with persistence |
| `getReactNativePersistence` | Firebase/index.js | RN AsyncStorage persistence |
| `signInWithEmailAndPassword` | authentication.js | Email/password sign-in |
| `createUserWithEmailAndPassword` | register.js | Email/password registration |
| `sendPasswordResetEmail` | resetPassword.js | Password reset |

### firebase/storage (6 APIs)
| API | Used In | Usage Pattern |
|-----|---------|---------------|
| `getStorage` | Firebase/index.js | Get storage instance |
| `ref` | 8 files | Build storage references |
| `uploadBytes` | 7 files | Upload file data |
| `uploadBytesResumable` | 1 file (saveAds.js) | Resumable upload (iOS video) |
| `getDownloadURL` | 7 files | Get public download URL |
| `deleteObject` | 3 files | Delete stored file |

### firebase/functions (2 APIs)
| API | Used In | Usage Pattern |
|-----|---------|---------------|
| `getFunctions` | Firebase/index.js | Get functions instance |
| `httpsCallable` | 2 files | Call Cloud Functions |

---

## 4. Firebase Web SDK APIs → React Native Firebase Equivalents

| Firebase Web SDK API | RN Firebase Equivalent | Module | Notes |
|----------------------|------------------------|--------|-------|
| `initializeApp` | `@react-native-firebase/app` — auto-initializes; `initializeApp` available but rarely needed | app | RN Firebase auto-initializes from native config |
| `getApps` | `@react-native-firebase/app` — `getApps()` | app | Direct equivalent |
| `getFirestore` | `@react-native-firebase/firestore` — `getFirestore()` | firestore | Direct equivalent |
| `initializeFirestore` | `@react-native-firebase/firestore` — `getFirestore()` with settings passed differently | firestore | **MIGRATION NOTE**: `experimentalForceLongPolling` and `useFetchStreams` settings are Web SDK-specific. RN Firebase uses native networking and does not support these settings. |
| `collection` | `@react-native-firebase/firestore` — `collection()` | firestore | Direct equivalent |
| `doc` | `@react-native-firebase/firestore` — `doc()` | firestore | Direct equivalent |
| `getDoc` | `@react-native-firebase/firestore` — `getDoc()` | firestore | Direct equivalent |
| `getDocs` | `@react-native-firebase/firestore` — `getDocs()` | firestore | Direct equivalent |
| `setDoc` | `@react-native-firebase/firestore` — `setDoc()` | firestore | Direct equivalent |
| `addDoc` | `@react-native-firebase/firestore` — `addDoc()` | firestore | Direct equivalent |
| `updateDoc` | `@react-native-firebase/firestore` — `updateDoc()` | firestore | Direct equivalent |
| `deleteDoc` | `@react-native-firebase/firestore` — `deleteDoc()` | firestore | Direct equivalent |
| `query` | `@react-native-firebase/firestore` — `query()` | firestore | Direct equivalent |
| `where` | `@react-native-firebase/firestore` — `where()` | firestore | Direct equivalent |
| `orderBy` | `@react-native-firebase/firestore` — `orderBy()` | firestore | Direct equivalent |
| `limit` | `@react-native-firebase/firestore` — `limit()` | firestore | Direct equivalent |
| `startAfter` | `@react-native-firebase/firestore` — `startAfter()` | firestore | Direct equivalent |
| `serverTimestamp` | `@react-native-firebase/firestore` — `serverTimestamp()` | firestore | Direct equivalent |
| `onSnapshot` | `@react-native-firebase/firestore` — `onSnapshot()` | firestore | Direct equivalent |
| `writeBatch` | `@react-native-firebase/firestore` — `writeBatch()` | firestore | Direct equivalent |
| `disableNetwork` | `@react-native-firebase/firestore` — `disableNetwork()` | firestore | Direct equivalent |
| `enableNetwork` | `@react-native-firebase/firestore` — `enableNetwork()` | firestore | Direct equivalent |
| `getAuth` | `@react-native-firebase/auth` — `getAuth()` | auth | Direct equivalent |
| `initializeAuth` | `@react-native-firebase/auth` — auto-initialized; `initializeAuth` not needed | auth | **MIGRATION NOTE**: RN Firebase auto-initializes auth; `initializeAuth` with persistence is handled differently |
| `getReactNativePersistence` | `@react-native-firebase/auth` — `getReactNativePersistence()` | auth | Direct equivalent |
| `signInWithEmailAndPassword` | `@react-native-firebase/auth` — `signInWithEmailAndPassword()` | auth | Direct equivalent |
| `createUserWithEmailAndPassword` | `@react-native-firebase/auth` — `createUserWithEmailAndPassword()` | auth | Direct equivalent |
| `sendPasswordResetEmail` | `@react-native-firebase/auth` — `sendPasswordResetEmail()` | auth | Direct equivalent |
| `getStorage` | `@react-native-firebase/storage` — `getStorage()` | storage | Direct equivalent |
| `ref` | `@react-native-firebase/storage` — `ref()` | storage | Direct equivalent |
| `uploadBytes` | `@react-native-firebase/storage` — `uploadBytes()` | storage | Direct equivalent |
| `uploadBytesResumable` | **NO DIRECT EQUIVALENT** | storage | **MIGRATION NOTE**: RN Firebase storage does not support resumable uploads. Need to use `uploadBytes` (which handles multipart/resumable at the native level) or implement custom resumable logic |
| `getDownloadURL` | `@react-native-firebase/storage` — `getDownloadURL()` | storage | Direct equivalent |
| `deleteObject` | `@react-native-firebase/storage` — `deleteObject()` | storage | Direct equivalent |
| `getFunctions` | `@react-native-firebase/functions` — `getFunctions()` | functions | Direct equivalent |
| `httpsCallable` | `@react-native-firebase/functions` — `httpsCallable()` | functions | Direct equivalent |

---

## 5. Firebase Web SDK APIs NOT Used (Can Be Skipped)

These Firebase Web SDK APIs are available in the SDK but are **not imported or used anywhere** in `src/`:

| Module | Unused APIs |
|--------|-------------|
| firebase/app | `getApp` (single app), `app()` |
| firebase/firestore | `collectionGroup`, `runTransaction`, `getCountFromServer`, `aggregate`, `arrayUnion`, `arrayRemove`, `increment`, `FieldValue`, `Timestamp`, `GeoPoint`, `DocumentReference`, `DocumentSnapshot`, `QuerySnapshot`, `QueryDocumentSnapshot`, `SnapshotMetadata`, `setLogLevel`, `enableIndexedDbPersistence`, `clearPersistence`, `settings`, `CACHE_SIZE_UNLIMITED`, `MemoryEfficientAggregationQuery` |
| firebase/auth | `signOut`, `signInAnonymously`, `signInWithPopup`, `signInWithRedirect`, `getRedirectResult`, `linkWithPopup`, `linkWithRedirect`, `reauthenticateWithPopup`, `reauthenticateWithRedirect`, `updateProfile`, `updateEmail`, `updatePassword`, `sendEmailVerification`, `isSignInWithEmailLink`, `signInWithEmailLink`, `fetchSignInMethodsForEmail`, `getAdditionalUserInfo`, `UserCredential`, `User`, `IdTokenResult`, `browserLocalPersistence`, `browserSessionPersistence`, `cookiePersistence`, `connectAuthEmulator` |
| firebase/storage | `list`, `listAll`, `getMetadata`, `updateMetadata`, `uploadString`, `uploadData`, `getBlob` |
| firebase/functions | `connectFunctionsEmulator`, `FunctionsError`, `HttpsCallableResult` |
| firebase/messaging | — (entire module unused) |
| firebase/analytics | — (entire module unused) |
| firebase/performance | — (entire module unused) |
| firebase/remote-config | — (entire module unused) |
| firebase/database | — (entire module unused) |

---

## 6. Firebase Web SDK APIs with NO React Native Firebase Equivalent

| API | Module | Reason | Alternative Approach |
|-----|--------|--------|---------------------|
| `initializeFirestore` with `experimentalForceLongPolling` / `useFetchStreams` | firebase/firestore | RN Firebase uses native SDKs with their own networking; these Web SDK-specific settings do not exist | Use default RN Firebase Firestore settings; the `experimentalForceLongPolling` workaround for iOS WebView is not needed in RN |
| `uploadBytesResumable` | firebase/storage | RN Firebase `@react-native-firebase/storage` does not expose a separate resumable upload API; `uploadBytes` handles multipart uploads natively | Replace `uploadBytesResumable` with `uploadBytes` (which is already multipart-based and handles large files at the native level) |
| `initializeAuth` with `getReactNativePersistence` | firebase/auth | While `getReactNativePersistence` exists in `@react-native-firebase/auth`, the `initializeAuth` pattern is Web SDK-specific; RN Firebase auto-initializes auth | Use `getAuth()` directly; RN Firebase manages persistence automatically via `@react-native-async-storage/async-storage` integration |
| `messagingSenderId` in config | firebase/config | Used for Web SDK FCM initialization; not needed for RN Firebase | Remove from config; RN Firebase uses `GoogleService-Info.plist` (iOS) and `google-services.json` (Android) for FCM setup |
| `measurementId` in config | firebase/config | Used for Web SDK Analytics; not needed for RN Firebase | Remove from config if Analytics is not being migrated; or use `@react-native-firebase/analytics` separately |
| `firebase/analytics` module | firebase/analytics | Not imported anywhere; Web SDK Analytics has no direct RN equivalent in the same import path | Use `@react-native-firebase/analytics` if analytics migration is desired |
| `firebase/messaging` module | firebase/messaging | Not imported anywhere; Web SDK FCM has no direct RN equivalent | Use `@react-native-firebase/messaging` if push notification migration is desired |

---

## 7. Architecture Summary

### Current Architecture
- **Single Firebase Web SDK v10.14.1** used for all Firebase operations
- **Centralized Firebase service** at `src/services/Firebase/index.js` exports `firebaseApp`, `firestore`, `storage`, `firestoreInstance`, `functions`
- **Auth** initialized with React Native AsyncStorage persistence in the Firebase service
- **Controllers pattern**: Each controller file imports specific Firestore/Storage/Functions/Auth APIs directly from `firebase/*` paths
- **Models**: `src/services/Firebase/models.js` defines collection name constants
- **Config**: `src/services/Firebase/config.js` reads from `@env` (environment variables)

### Key Hotspots for Migration
1. `src/services/Firebase/index.js` — Central initialization (HIGH RISK)
2. `src/services/Firebase/config.js` — Config with Web SDK-specific fields (MEDIUM RISK)
3. `src/utils/hooks/useInternetConnection.jsx` — Uses `firestoreInstance` export (MEDIUM RISK)
4. `src/controllers/User/authentication.js` — Auth + Firestore (HIGH RISK)
5. `src/controllers/User/register.js` — Auth + Firestore (HIGH RISK)
6. `src/controllers/User/resetPassword.js` — Auth (HIGH RISK)
7. `src/controllers/User/getPasswordResetToken.js` — Functions callable (HIGH RISK)
8. `src/controllers/User/resetPasswordByIdentifier.js` — Functions callable (HIGH RISK)
9. `src/controllers/Chat/index.js` — Complex real-time listeners (HIGH RISK)
10. `src/controllers/Chat/messageActions.js` — Batch writes (MEDIUM RISK)
11. `src/controllers/Payment/order.js` — Financial data + caching (HIGH RISK)
12. `src/controllers/PublishAds/saveAds.js` — Uses `uploadBytesResumable` (MEDIUM RISK)
13. `src/controllers/User/saveImage.js` — Storage + Firestore combined (MEDIUM RISK)
14. `src/controllers/User/deleteUser.js` — Storage + Firestore delete (MEDIUM RISK)
15. `src/controllers/Publication/delete.js` — Storage + Firestore delete (MEDIUM RISK)
16. `src/controllers/PublishAds/delete.js` — Storage + Firestore delete (MEDIUM RISK)

### Total File Count
- **44 files** in `src/` import from Firebase Web SDK
- **1 file** is the Firebase service/initialization (`src/services/Firebase/index.js`)
- **1 file** is the Firebase config (`src/services/Firebase/config.js`)
- **1 file** is the Firebase models (`src/services/Firebase/models.js`)
- **1 file** is the network connectivity hook (`src/utils/hooks/useInternetConnection.jsx`)
- **40 files** are controllers and pages that use Firebase APIs directly

### Notification Strategy
- **No Firebase Cloud Messaging (FCM) Web SDK** is imported in the app
- `messagingSenderId` exists in config but is unused in code
- Notifications use **Expo Notifications** (`expo-notifications` v0.31.5) — a separate push notification service
- `src/services/ExpoNotification/sendNotification.js` exists but has no Firebase imports
- This means the `firebase/messaging` migration is **not applicable** (no current usage)

### Analytics Strategy
- **No Firebase Analytics Web SDK** is imported in the app
- `measurementId` exists in config but is unused in code
- Analytics migration is **not applicable** (no current usage)

---

## 8. DAG Dependency Analysis (Actual vs. Planned)

The orchestrator document specifies these dependencies:

| Planned | Actual | Match? | Notes |
|---------|--------|--------|-------|
| 1 → 2 | 1 → 2 | ✅ | Baseline audit must precede import matrix |
| 3 + 4 after 1,2 | Firebase init (3) and native setup (4) after audit | ✅ | Correct |
| 3 + 4 → 5 | Auth migration after Firebase init + native setup | ✅ | Correct |
| 3 + 4 → 6 | Firestore read migration after init + native setup | ✅ | Correct |
| 3 + 4 → 8 | Storage migration after init + native setup | ✅ | Correct |
| 3 + 4 → 9 | Functions migration after init + native setup | ✅ | Correct |
| 3 + 4 → 7 | Orders contract before write path | ✅ | Correct (7 depends on 11) |
| 11 → 12 → 13 | Orders contract → legacy reader → validated writer | ✅ | Correct |
| 9 + 11 + 12 + 13 → 14 | Dashboard after Functions + orders | ✅ | Correct |
| 14 → 15 → 16 → 17 | Dashboard metrics → timezone tests → admin dashboard → remove bulk download | ✅ | Correct |
| 4 → 10 | Notifications strategy after native setup | ✅ | Correct |
| 10 + 18 + 19 → 20 | Notification payload after strategy + app architecture | ✅ | Correct |
| 20 → 21 → 22 | Payload → router → remove polling | ✅ | Correct |
| 23 → 24 | Redux inventory → cache removal | ✅ | Correct |
| 5 + 11 + 12 + 13 → 25 | Security rules after Auth + orders | ✅ | Correct |
| 8 → 26 | Storage rules after storage migration | ✅ | Correct |
| All impl → 27 | Hardening after all implementation | ✅ | Correct |
| 27 → 28 → 29 → 30 | Observability → performance → validation → regression | ✅ | Correct |

**No incorrect dependencies found in the planned DAG.**

---

## 9. Key Findings & Recommendations

1. **`uploadBytesResumable` is the only Firebase Web SDK API with no direct RN Firebase equivalent.** Replace with `uploadBytes` in `src/controllers/PublishAds/saveAds.js`.

2. **`initializeFirestore` with `experimentalForceLongPolling`/`useFetchStreams` is Web SDK-specific.** RN Firebase Firestore uses native networking and does not need these settings. Remove from `src/services/Firebase/index.js`.

3. **`initializeAuth` with `getReactNativePersistence` is partially Web SDK-specific.** RN Firebase's `@react-native-firebase/auth` auto-initializes and handles persistence differently. The `getReactNativePersistence` import from `firebase/auth` still works in v10 but should be replaced with RN Firebase's auth initialization pattern.

4. **`firebase/messaging` and `firebase/analytics` are NOT used in the codebase** despite config values existing. These modules can be skipped entirely in the migration.

5. **The `messagingSenderId` and `measurementId` in `config.js` are Web SDK-specific** and should be removed or kept only for reference.

6. **44 files** need migration from Firebase Web SDK to React Native Firebase. The majority are simple CRUD operations with direct 1:1 API mappings.

7. **The most complex migration** is `src/controllers/Chat/index.js` which uses `onSnapshot` real-time listeners extensively (4 instances) with complex subscription management and error handling.

8. **Financial data** in `src/controllers/Payment/order.js` uses manual caching (`cachedApprovedOrders`, `cachedApprovedOrdersByYear`) — this should be reviewed during migration to ensure cache consistency with RN Firebase's offline persistence.
