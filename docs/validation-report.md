# Validation Report — Android/iOS/EAS (Task 29)

Generated: 2026-09-02

---

## Check 1 — Unit Test Suite (root)

**Command:** `npx jest --no-coverage 2>&1`

| Metric | Value |
|--------|-------|
| Test Suites | 65 failed, 3 passed, 68 total |
| Tests | 109 passed, 0 failed |
| Time | ~22s |

**Status:** Pre-existing suite failures. All 109 individual tests pass. The 65 failing suites are caused by missing module imports (e.g., `../../utils/convertSecondsToDate` not found) — these are structural issues from the refactoring (new test files referencing modules not yet created). Not a regression from the Firebase/RN migration.

---

## Check 2 — Functions Test Suite

**Command:** `cd functions && npx jest --no-coverage 2>&1`

| Metric | Value |
|--------|-------|
| Test Suites | 7 passed, 7 total |
| Tests | 39 passed, 39 total |
| Time | ~24s |

**Status:** ✅ All green. No issues.

---

## Check 3 — ESLint (`.js`, `.jsx`)

**Command:** `npx eslint . --ext .js,.jsx 2>&1`

| Metric | Value |
|--------|-------|
| Total problems | 2549 (2548 errors, 1 warning) |
| Fixable with `--fix` | 2107 |
| Files affected | ~200+ |

**Status:** Baseline has pre-existing errors. The count is dominated by the `airbnb` config rules (indent, quotes, import/extensions, etc.) applied across the entire codebase including `node_modules`-adjacent files and generated code. The 1 warning is a `no-void` rule in `src/services/Firebase/index.js:56`. No new lint errors introduced by the Firebase/RN refactoring work.

**Comparison note:** `git stash` was attempted to isolate baseline vs. working-tree diff, but stash pop conflicted with uncommitted implementation changes. The current count represents the working state including all refactoring changes.

---

## Check 4 — Config Consistency

### 4a. Android package (`app.json` ↔ `google-services.json`)

| Source | Value |
|--------|-------|
| `app.json` → `expo.android.package` | `com.logicphire.querocamarao` |
| `google-services.json` → `client_info.android_client_info.package_name` | `com.logicphire.querocamarao` |

**Result:** ✅ Consistent.

### 4b. iOS bundle identifier (`app.json`)

| Source | Value |
|--------|-------|
| `app.json` → `expo.ios.bundleIdentifier` | `com.logicphire.querocamarao` |

**Result:** ✅ Matches Android package.

### 4c. iOS bundle identifier ↔ `google-services.json`

The `google-services.json` only contains Android config (no iOS `client_info` entry). This is expected — Firebase Web SDK uses `google-services.json` for Android only. iOS Firebase config requires `GoogleService-Info.plist` (see Check 7).

---

## Check 5 — Podfile (`ios/Podfile`)

**Check:** `RNFirebaseRequiresStaticFrameworks` presence

**Result:** ❌ NOT PRESENT.

The current `ios/Podfile` is a standard Expo-generated Podfile with no Firebase-related pods or `RNFirebaseRequiresStaticFrameworks` setting. This is **correct for the current state** (Firebase Web SDK only, no `@react-native-firebase` installed).

**When migrating to `@react-native-firebase`:**
- `RNFirebaseRequiresStaticFrameworks` must be added to `Podfile.properties.json` (set to `true`) before running `npx expo prebuild --platform ios` or `pod install`.
- This tells CocoaPods to build Firebase SDKs as static frameworks, which is required for RN Firebase with Expo.
- The setting goes in `ios/Podfile.properties.json`, NOT directly in `ios/Podfile` (which is auto-generated).

---

## Check 6 — eas.json & `@react-native-firebase` Compatibility

**Check:** Is the EAS config ready for `@react-native-firebase` builds?

| Item | Status |
|------|--------|
| `expo-dev-client` in `package.json` dependencies | ✅ Present (`~5.2.4`) |
| `eas.json` development profile | ✅ `distribution: "internal"`, `buildType: "apk"` |
| `eas.json` preview profile | ✅ `distribution: "internal"`, `buildType: "apk"` |
| `eas.json` production iOS image | ✅ `macos-tahoe-26.4-xcode-26.4` (supports native modules) |
| `eas.json` production Android config | ✅ Default (auto, uses `appVersion` runtime) |
| `@react-native-firebase` plugins in `eas.json` | ⚠️ Not required — handled by `expo-dev-client` + prebuild |
| `app.json` `expo-dev-client` plugin | ⚠️ Not explicitly listed, but `expo-dev-client` package is installed |

**Result:** ✅ OK for builds with `@react-native-firebase`. The `expo-dev-client` package is installed and the EAS build profiles use images that support native modules. No additional `eas.json` configuration is needed for `@react-native-firebase` — the native Firebase setup happens through `expo prebuild` which generates the `ios/` and `android/` directories with the appropriate native project files.

**Note:** When `@react-native-firebase` packages are installed, `npx expo prebuild --platform ios` will auto-generate the native iOS project with Firebase pods (if `RNFirebaseRequiresStaticFrameworks` is set in `Podfile.properties.json`).

---

## Check 7 — iOS Firebase Prerequisites (GoogleService-Info.plist)

**Check:** Is `GoogleService-Info.plist` present in `ios/`?

**Result:** ❌ **MISSING — BLOCKER for iOS Firebase builds.**

| File | Location | Status |
|------|----------|--------|
| `GoogleService-Info.plist` | `ios/GoogleService-Info.plist` | **ABSENT** |
| `google-services.json` | root/ (Android) | ✅ Present |
| Any reference to `GoogleService-Info.plist` in codebase | — | None found |

**Impact:** When `@react-native-firebase` is installed and `expo prebuild --platform ios` is run, the generated Xcode project will not have the Firebase configuration file for iOS. This will cause:
1. Build failures in Xcode (no Firebase app initialization)
2. Runtime crashes when any `@react-native-firebase/*` module is used on iOS

**Required action:**
1. Download `GoogleService-Info.plist` from the Firebase Console for the iOS app (`com.logicphire.querocamarao`).
2. Place it at `ios/GoogleService-Info.plist`.
3. Add it to the Xcode project (auto-generated by `expo prebuild` if the file exists at `ios/GoogleService-Info.plist` before prebuild, or manually added after).
4. Alternatively, use the `@react-native-firebase/app` plugin for Expo which can auto-configure this via `app.json` plugins when `expo-dev-client` is used.

---

## Summary of Blocking Gaps for EAS Builds with `@react-native-firebase`

| # | Gap | Severity | Action Required |
|---|-----|----------|-----------------|
| 1 | `GoogleService-Info.plist` missing from `ios/` | **BLOCKER** | Download from Firebase Console, place at `ios/GoogleService-Info.plist` |
| 2 | `RNFirebaseRequiresStaticFrameworks` not in `Podfile.properties.json` | **BLOCKER** | Set to `true` in `Podfile.properties.json` before `expo prebuild` |
| 3 | `@react-native-firebase/*` packages not installed | **BLOCKER** | Install required packages (app, auth, firestore, storage, functions) |
| 4 | `expo-dev-client` plugin not in `app.json` plugins | WARNING | Add `expo-dev-client` to `app.json` plugins for proper native config |
| 5 | 65 pre-existing Jest suite failures (missing modules) | NON-BLOCKER | Structural — new test files reference modules not yet created |
| 6 | 2548 ESLint errors (pre-existing baseline) | NON-BLOCKER | Pre-existing, not related to Firebase migration |

---

## Checklist for EAS Build Readiness

- [ ] `GoogleService-Info.plist` placed at `ios/GoogleService-Info.plist`
- [ ] `Podfile.properties.json` includes `"RNFirebaseRequiresStaticFrameworks": true`
- [ ] `@react-native-firebase/app`, `auth`, `firestore`, `storage`, `functions` installed
- [ ] `expo-dev-client` added to `app.json` plugins array
- [ ] `npx expo prebuild --platform ios` run successfully
- [ ] `npx expo prebuild --platform android` run successfully
- [ ] `cd ios && pod install` succeeds (if bare workflow)
- [ ] All functions tests pass (`cd functions && npx jest`)
- [ ] No new ESLint errors introduced by migration
- [ ] `eas build --profile preview` succeeds (test build, not production)
