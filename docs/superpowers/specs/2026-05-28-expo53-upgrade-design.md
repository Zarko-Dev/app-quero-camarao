# Expo SDK 53 Upgrade — Design Spec

**Date:** 2026-05-28  
**Goal:** Fix Android 16KB page alignment requirement (Google Play enforcement)  
**Scope:** iOS + Android  

---

## Context

App `quero-camarao` currently on Expo SDK 52 / React Native 0.76.9. Google Play requires 16KB ELF page alignment for apps targeting Android 15 (API 35). Pre-built `.so` files in RN 0.76.x are not aligned. RN 0.77 (ships with Expo SDK 53) resolves this across all core libraries.

**Libraries currently failing 16KB check:**
- `libhermes.so`, `libreactnative.so`, `libjsi.so`, `libfbjni.so` — RN core
- `libreanimated.so`, `libworklets.so` — Reanimated
- `librnscreens.so` — react-native-screens
- `libexpo-av.so`, `libexpo-modules-core.so` — Expo
- `libbarhopper_v3.so` — Google ML Kit barcode (source: likely expo-camera)
- `libgifimage.so`, `libimagepipeline.so`, `libnative-filters.so`, `libnative-imagetranscoder.so`, `libstatic-webp.so` — Fresco (bundled in RN)
- `libc++_shared.so` — C++ stdlib

---

## Architecture

### Branch Strategy

- Branch: `feat/expo-sdk-53` off `main`
- Old Architecture stays disabled (`newArchEnabled=false`) — 16KB fix comes from RN 0.77 binaries, not new arch
- NDK 27.1.12297006 maintained
- Merge target: `main` after EAS dev build passes

### Upgrade Groups (ordered, one commit per group)

| # | Group | What changes | Risk |
|---|-------|-------------|------|
| 1 | Core | `expo` → ^53.0.0, `react-native` + `@react-native/metro-config` → version pinned by SDK 53 | High |
| 2 | Expo packages | All `expo-*` via `npx expo install --fix` | Medium |
| 3 | Navigation | `@react-navigation/*`, `react-native-screens`, `react-native-safe-area-context`, `react-native-gesture-handler` | Medium |
| 4 | Reanimated | `react-native-reanimated` (worklets comes with it) | Medium |
| 5 | Sentry | `@sentry/react-native` | Low |
| 6 | Other native | `lottie-react-native`, `@shopify/flash-list`, `victory-native`, `@bam.tech/react-native-image-resizer`, `react-native-fs`, `react-native-share`, `react-native-webview` | Variable |
| 7 | Prebuild | `npx expo prebuild --clean`, `npx expo-doctor` | — |

Each group gets its own commit. If a group breaks the build, revert that commit and investigate before proceeding.

---

## Execution Steps

### Pre-work
1. Create branch: `git checkout -b feat/expo-sdk-53`
2. Note current working EAS dev build as baseline

### Group 1 — Core
```bash
yarn add expo@^53.0.0
npx expo install react-native @react-native/metro-config
```
- `npx expo install react-native` resolves to the exact RN version pinned by SDK 53
- `@react-native/metro-config` must match the resolved RN version (currently 0.76.9, will become 0.77.x)
- Verify `package.json` updated
- Commit: `chore: upgrade expo 53 + RN 0.77 core`

### Group 2 — Expo packages
```bash
npx expo install --fix
```
- Resolves all `expo-*` to SDK 53-compatible versions automatically
- Review diff before committing
- Commit: `chore: upgrade expo-* packages to SDK 53`

### Group 3 — Navigation
```bash
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs @react-navigation/drawer
```
- Commit: `chore: upgrade navigation stack for SDK 53`

### Group 4 — Reanimated
```bash
npx expo install react-native-reanimated
```
- Check for breaking changes in Reanimated changelog
- Commit: `chore: upgrade react-native-reanimated for SDK 53`

### Group 5 — Sentry
```bash
npx expo install @sentry/react-native
```
- Verify `sentry.gradle` still referenced correctly in `android/app/build.gradle`
- Commit: `chore: upgrade @sentry/react-native for SDK 53`

### Group 6 — Other native modules
```bash
npx expo install lottie-react-native @shopify/flash-list victory-native @bam.tech/react-native-image-resizer react-native-fs react-native-share react-native-webview react-native-pager-view react-native-svg react-native-paper
```
- For packages not managed by expo install: check npm for SDK 53 / RN 0.77 compatible versions manually
- Commit: `chore: upgrade remaining native modules for SDK 53`

### Group 7 — Prebuild + verification
```bash
npx expo prebuild --clean
npx expo-doctor@latest
```
- Verify `gradle.properties` still has `newArchEnabled=false`
- Verify NDK 27 still set
- Verify `libbarhopper_v3.so` status — if expo-camera upgrade resolved it, confirm
- Commit: `chore: regenerate native projects for SDK 53`

### Validation
- Run EAS build: `eas build --profile development --platform android`
- Run EAS build: `eas build --profile development --platform ios`
- Both pass → smoke test on device
- Verify Google Play Console 16KB compliance check

---

## Success Criteria

1. EAS development build passes for Android and iOS
2. No runtime crashes on core flows (login, sales, draws)
3. Google Play Console no longer flags 16KB non-compliance
4. `libbarhopper_v3.so` compliance resolved (either by expo-camera upgrade or identified for separate action)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| `react-native-fs` no SDK 53 support | Replace with `expo-file-system` (already a dep) if needed |
| `react-native-masked-text` incompatible | Find fork or replace with custom mask |
| `victory-native` breaking changes | Pin to last working version, defer upgrade |
| `libbarhopper_v3.so` still failing after upgrade | Identify exact source package, open issue or remove barcode feature |
| EAS node version (18.18.0) too old for SDK 53 | Bump to 20.x in `eas.json` if needed |

---

## Out of Scope

- New Architecture enablement (separate effort post-stabilization)
- Automated test suite (separate effort)
- iOS 16KB compliance check (separate from Android requirement)
