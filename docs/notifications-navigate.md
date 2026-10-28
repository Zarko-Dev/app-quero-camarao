# Notifications Navigation Plug — Task 22

## Purpose

Replaces the `navigationRef.isReady()` polling loop (setTimeout × 10 attempts, 300ms) in `App.jsx` with a clean `navigateWhenReady()` function backed by `navigationRef.addListener('state')` + `Promise.race` with timeout.

## Prerequisites

- Task 18 must have completed extracting `setup.js` from `App.jsx`
- Task 21 must have created `src/notifications/router.js` with `createNavigationWaiter`
- `src/notifications/navigateWhenReady.js` must exist (this file)

## Plug — Exact Replacement

### Old code to remove from `App.jsx` (lines 198–235)

```js
let attempts = 0;
const tryNavigate = () => {
    if (navigationRef.isReady()) {
        if (isChatType) {
            navigationRef.navigate(dataRoutes.publicationChat, {
                publication: { id: data.publicationId },
                sellerId: data.sellerId,
                buyerId: data.buyerId,
                sellerName: data.sellerName,
                buyerName: data.buyerName,
                chatId: data.chatId,
            });
        } else if (data.type === "publication") {
            if (data.publicationId) {
                navigationRef.navigate(dataRoutes.publicationDetail, {
                    publicationId: data.publicationId,
                });
            } else {
                navigationRef.navigate(dataRoutes.home);
            }
        } else if (data.type === "registerMyAds") {
            navigationRef.navigate(dataRoutes.registerMyAds);
        }
        return;
    }
    attempts += 1;
    if (attempts < 10) {
        setTimeout(tryNavigate, 300);
    } else {
        Sentry.captureMessage("Notification navigation timed out waiting for navigationRef", {
            extra: {
                type: data.type,
                chatId: data.chatId,
                publicationId: data.publicationId,
            },
        });
    }
};
tryNavigate();
```

### New code to insert in its place

```js
import { navigateWhenReady } from "../notifications/navigateWhenReady";

const routeMap = {
    chat: { name: dataRoutes.publicationChat, params: { publication: { id: data.publicationId }, sellerId: data.sellerId, buyerId: data.buyerId, sellerName: data.sellerName, buyerName: data.buyerName, chatId: data.chatId } },
    publication: { name: data.publicationId ? dataRoutes.publicationDetail : dataRoutes.home, params: data.publicationId ? { publicationId: data.publicationId } : undefined },
    registerMyAds: { name: dataRoutes.registerMyAds, params: undefined },
};

const entry = routeMap[data.type];
if (entry) {
    await navigateWhenReady(navigationRef, entry.name, entry.params, { timeoutMs: 3000 });
}
```

## Integration Notes

- `navigateWhenReady` returns a `Promise` — `await` it inside the async `navigateToChatFromNotificationData` function.
- On timeout, the function rejects with an `Error`. Wrap in `try/catch` and call `Sentry.captureException` or `Sentry.captureMessage` as needed (same Sentry call as the old polling fallback).
- Once Task 21's `createNavigationWaiter` in `src/notifications/router.js` is available, consider migrating `navigateWhenReady` to delegate to it for consistency.
- The `routeMap` object centralises the route-name/params mapping that was previously inline in the `if/else` chain.