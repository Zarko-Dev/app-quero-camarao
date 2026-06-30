# Admin X-Ray Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 2 critical bugs (duplicate header, Gráficos crash) + 3 UX/code quality improvements found in X-ray audit.

**Architecture:** All changes are surgical — no structural refactors. Bug fixes target root causes confirmed by static analysis. Icon standardization replaces FontAwesome with MaterialCommunityIcons already used in drawer nav. Dead code cleanup removes unreachable state/functions from DrawPrizeLive.

**Tech Stack:** React Native (Expo SDK 53), React Navigation v6 (drawer + bottom tabs), victory-native (charts), node:test for unit tests.

---

## Root Cause Summary (for reference)

| Bug | File | Root Cause |
|-----|------|-----------|
| Duplicate header | AdminRoutes.jsx:50 + navigationTabs.jsx:64,72,80 | Both drawer and tab navigators render `<Header>` for the same screen |
| Gráficos crash | Charts/index.jsx:311-312 | `height` and `width` props on `VictoryLine` — only valid on `VictoryChart` |
| Icon inconsistency | navigationTabs.jsx:2 | FontAwesome in tab bar vs MaterialCommunityIcons in drawer |
| Dead code | DrawPrizeLive/index.jsx:106,108,323,362 | `showEditCodeDialog`, `showEditThemeDialog`, `openEditCodeDialog`, `openEditThemeDialog` never used |
| Toast malformed | Users/index.jsx:113 | `Toast.show({ type: "Não foram encontrados..." })` — `type` is wrong field |

---

### Task 1: Fix duplicate header bar

**Files:**
- Modify: `src/routes/AdminRoutes.jsx:48-54`

The `AdminTabNavigation` is registered as a Screen in the DrawerNavigator with `header: (props) => <Header {...props} />`. The tab screens INSIDE `AdminTabNavigation` also each have their own `header` option. React Navigation renders both → two headers stacked.

Fix: replace `header:` with `headerShown: false` on the drawer Screen wrapping `AdminTabNavigation`. The tab navigator's own headers remain active.

- [ ] **Step 1: Apply fix**

In `src/routes/AdminRoutes.jsx`, find the screen at line ~48:

```jsx
<Screen
    name={dataRoutes.admin.navigationTab}
    component={AdminTabNavigation}
    options={{
        title: "Início Administrador",
        header: (props) => <Header {...props} />,   // ← REMOVE this line
        drawerIcon: ({ color }) => (
```

Replace the entire `options` block with:

```jsx
    options={{
        title: "Início Administrador",
        headerShown: false,
        drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={21} color={color} />
        ),
    }}
```

- [ ] **Step 2: No unit test applicable (navigation render issue — verify visually)**

Run: `npx expo start` → open admin → confirm only ONE orange header visible.

- [ ] **Step 3: Commit**

```bash
git add src/routes/AdminRoutes.jsx
git commit -m "fix: remove duplicate header from admin drawer wrapping AdminTabNavigation"
```

---

### Task 2: Fix Gráficos crash (VictoryLine invalid props)

**Files:**
- Modify: `src/pages/Admin/Charts/index.jsx:311-312`

`VictoryLine` receives `height={400}` and `width={800}`. These props are only valid on `VictoryChart`. Passing them to `VictoryLine` causes a render crash on Android (the app closes). `VictoryChart` at line 284 already sets `width` correctly.

- [ ] **Step 1: Remove invalid props from VictoryLine**

In `src/pages/Admin/Charts/index.jsx`, find lines 307-314:

```jsx
                            domainPadding={{
                                x: 5,
                                y: [0, 15],
                            }}
                            height={400}
                            width={800}
                            labels={({ datum }) => datum.y}
```

Change to:

```jsx
                            domainPadding={{
                                x: 5,
                                y: [0, 15],
                            }}
                            labels={({ datum }) => datum.y}
```

- [ ] **Step 2: No unit test applicable (victory-native render crash)**

Run: `npx expo start` → open admin → tap "Gráficos" tab → confirm screen loads without crash.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Admin/Charts/index.jsx
git commit -m "fix: remove invalid height/width props from VictoryLine (crash on Gráficos tab)"
```

---

### Task 3: Standardize tab bar icons to MaterialCommunityIcons

**Files:**
- Modify: `src/routes/navigationTabs.jsx`

Tab bar uses `FontAwesome` (`user-secret`, `area-chart`, `users`). Drawer uses `MaterialCommunityIcons`. Mixing icon libs looks inconsistent. Replace with semantically equivalent MCIcons already imported in the project.

- [ ] **Step 1: Replace icon import and icons**

In `src/routes/navigationTabs.jsx`, replace:

```jsx
import { FontAwesome } from "@expo/vector-icons";
```

With:

```jsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
```

Replace the `switch` block inside `tabBarIcon`:

```jsx
// BEFORE
switch (route.name) {
    case dataRoutes.admin.home:
        iconName = "user-secret";
        break;
    case dataRoutes.admin.charts:
        iconName = "area-chart";
        break;
    case dataRoutes.admin.users:
        iconName = "users";
        break;
    default:
        iconName = "user-secret";
        break;
}

return (
    <FontAwesome
        name={iconName}
        size={size - 2}
        color={color}
    />
);
```

With:

```jsx
switch (route.name) {
    case dataRoutes.admin.home:
        iconName = "home-variant-outline";
        break;
    case dataRoutes.admin.charts:
        iconName = "chart-line";
        break;
    case dataRoutes.admin.users:
        iconName = "account-group-outline";
        break;
    default:
        iconName = "home-variant-outline";
        break;
}

return (
    <MaterialCommunityIcons
        name={iconName}
        size={size - 2}
        color={color}
    />
);
```

- [ ] **Step 2: No unit test applicable (visual icon change)**

Run: `npx expo start` → open admin → confirm bottom tab icons look correct and consistent with drawer.

- [ ] **Step 3: Commit**

```bash
git add src/routes/navigationTabs.jsx
git commit -m "ux: standardize tab bar icons to MaterialCommunityIcons (matches drawer nav)"
```

---

### Task 4: Remove dead code from DrawPrizeLive

**Files:**
- Modify: `src/pages/Admin/DrawPrizeLive/index.jsx`

After removing `indicatedWinnerEmail` in previous session, there are still unreachable states and functions:
- States `showEditCodeDialog`, `showEditThemeDialog` are never set to `true` → never used
- Functions `openEditCodeDialog()`, `openEditThemeDialog()` are never called from JSX

These are safe to remove: no UI renders them, no handler calls them.

- [ ] **Step 1: Remove dead states**

Find and remove these two state lines:

```jsx
    const [showEditCodeDialog, setShowEditCodeDialog] = useState(false);
    // ...
    const [showEditThemeDialog, setShowEditThemeDialog] = useState(false);
```

- [ ] **Step 2: Remove dead functions**

Find and remove `openEditCodeDialog` function (searches for `setShowEditCodeDialog(true)`) and `openEditThemeDialog` function (searches for `setShowEditThemeDialog(true)`).

To locate them exactly, grep:
```bash
grep -n "openEditCodeDialog\|openEditThemeDialog\|showEditCodeDialog\|showEditThemeDialog" src/pages/Admin/DrawPrizeLive/index.jsx
```

Remove the state declarations and the two functions entirely.

- [ ] **Step 3: No unit test applicable (dead code removal)**

Run: `npx expo start` → open Sorteio ao Vivo → confirm no regression.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Admin/DrawPrizeLive/index.jsx
git commit -m "chore: remove dead state and functions from DrawPrizeLive (showEditCodeDialog, showEditThemeDialog)"
```

---

### Task 5: Fix malformed Toast in Users screen

**Files:**
- Modify: `src/pages/Admin/Users/index.jsx:113`

Current code (wrong):
```jsx
Toast.show({ type: "Não foram encontrados usuários!" });
```

`type` should be `"info"` or `"error"`. The actual message belongs in `text1`. This shows no toast at all (or a broken one).

- [ ] **Step 1: Write failing test for toast utility (if applicable)**

This is a UI call, not a pure function — no unit test needed. Verify manually.

- [ ] **Step 2: Fix the Toast call**

Find line ~113 in `src/pages/Admin/Users/index.jsx`:

```jsx
Toast.show({ type: "Não foram encontrados usuários!" });
```

Replace with:

```jsx
Toast.show({ type: "info", text1: "Nenhum usuário encontrado" });
```

- [ ] **Step 3: Verify manually**

Run: `npx expo start` → admin → Usuários → search for a term that yields no results → confirm toast message appears correctly.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Admin/Users/index.jsx
git commit -m "fix: correct malformed Toast.show call in Users screen (missing text1 field)"
```

---

## Execution Order

Tasks 1 and 2 are critical bugs — do these first. Tasks 3-5 are improvements — do in any order after.

| Priority | Task | Type |
|----------|------|------|
| P0 | Task 1: Duplicate header | Bug |
| P0 | Task 2: Gráficos crash | Bug |
| P1 | Task 3: Icon standardization | UX |
| P2 | Task 4: Dead code cleanup | Code quality |
| P2 | Task 5: Toast fix | Bug (minor) |
