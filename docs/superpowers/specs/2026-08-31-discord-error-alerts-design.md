# Discord Error Alerts Design

## Goal

Add Discord webhook alerts for errors in both the React Native app and Firebase Functions of Quero Camarao, with enough context to identify which user was affected, where the error happened, and likely cause details.

## Scope

- React Native app in `/Users/pedroroger/Documents/app-quero-camarao`
- Firebase Functions in `/Users/pedroroger/Documents/app-quero-camarao/functions`
- Hardcoded Discord webhook URL is allowed for this task
- Alerting must not block the user flow or function execution

## Non-Goals

- Replacing Sentry
- Building a full observability pipeline
- Persisting alert history in Firestore
- Refactoring every existing error path in the app

## Approach

Use one centralized Discord alert helper in the app and one in the functions package.

The app helper will:

- send a normalized payload to the Discord webhook
- enrich alerts with current route and current user details
- expose a `reportDiscordError()` function for manual calls in critical catch blocks
- expose a `captureExceptionWithDiscord()` wrapper so existing Sentry captures can also emit Discord alerts
- install a global JavaScript error handler for uncaught runtime errors

The functions helper will:

- send a normalized payload to the same Discord webhook
- expose `reportDiscordFunctionError()` for use inside catch blocks and guarded failure paths
- enrich alerts with function name, request/event identifiers, and inferred user identifiers when available

## App Design

### Files

- `src/services/DiscordAlerts/index.js`
- `src/services/DiscordAlerts/context.js`
- `App.jsx`

### Context captured

- `userId`
- `userName`
- `email`
- `phone`
- `routeName`
- `platform`
- `appVersion` if cheaply available
- `feature`
- `action`
- `message`
- `stack`
- `extra`

### User resolution

Use this order:

1. Redux `store.getState().login`
2. `GetUserStorage()`
3. explicit user data passed by the caller

If fields are missing, send `unknown` instead of failing the alert.

### Route resolution

Read the active route from `navigationRef.getCurrentRoute()`.

### Global error capture

Install a JS global handler in `App.jsx` after Sentry initialization. The handler should:

- forward the error to Sentry
- emit a Discord alert with source `app.global`
- preserve any previous global handler by calling it afterward

### Manual app capture points

Wire the new helper into high-value error paths already visible in the codebase:

- Firebase bootstrap failure in `src/services/Firebase/index.js`
- auth/storage failures from `src/services/Storage/UserStorage.js`
- Mercado Pago failures in `src/services/MercadoPago/createPixPayment.js`
- Mercado Pago order lookup failures in `src/services/MercadoPago/getOrder.js`
- chat send/upload failures in:
  - `src/controllers/Chat/index.js`
  - `src/controllers/Chat/uploadAudio.js`
  - `src/controllers/Chat/uploadFile.js`
  - `src/controllers/Chat/uploadImage.js`
  - `src/controllers/Chat/uploadVideo.js`
  - `src/controllers/Chat/getLocation.js`

The first implementation pass only needs to patch paths that already have clear `catch` blocks or existing `Sentry.captureException()` calls.

### Anti-spam

Add a simple in-memory dedup window in the app helper:

- key: `source + routeName + message`
- ttl: 60 seconds

If the same error repeats within the TTL, skip the duplicate Discord send.

## Functions Design

### Files

- `functions/src/discordAlerts.js`
- `functions/src/index.js`

### Context captured

- `functionName`
- `userId`
- `email`
- `phone`
- `requestPath`
- `eventId`
- `documentPath`
- `message`
- `stack`
- `extra`

### Manual function capture points

Patch the handlers that already have clear top-level execution boundaries:

- `functions/src/paymentPix.js`
- `functions/src/paymentWebhook.js`
- `functions/src/chatNotifications.js`
- `functions/src/reminders.js`
- callable handlers in `functions/src/index.js` for password reset flows

If a handler already logs a caught exception, add Discord reporting next to that log.

### User inference

Use, in order:

1. explicit context passed by the handler
2. `request.auth.uid` for callable functions
3. known payload fields like `userId`, `buyerId`, `sellerId`, `email`, `phone`
4. `unknown`

### Anti-spam

Add a process-local dedup window:

- key: `functionName + message + eventId`
- ttl: 60 seconds

## Payload Format

Send Discord webhook payload as a compact text message with sections:

- environment: `app` or `functions`
- source
- user
- route or function
- message
- stack snippet
- extra JSON snippet

Trim long stack or JSON values to stay within Discord message limits.

## Failure Handling

- Webhook delivery must be `fire-and-forget` from business logic perspective
- Any webhook failure must be swallowed after optional local logging
- Alert generation must never throw into the main app/function path

## Testing

### App

Add focused unit tests for the new helper:

- formats payload with explicit user and route
- falls back to `unknown` values
- dedups repeated errors in the TTL window

### Functions

Add focused Jest tests for the functions helper:

- formats payload
- derives user from supplied context
- dedups repeated errors
- swallows webhook transport failure

## Validation

Before claiming ready:

- run focused app tests for the Discord helper
- run focused functions Jest tests
- verify no import cycle or boot crash in `App.jsx`
- only after alert work is validated, return to Android/iOS build and TestFlight submission flow

## Risks

- The worktree is already dirty, so edits must stay isolated
- Some existing handled failures return `{ error: true }` without throwing; those require selective manual instrumentation
- React Native global error APIs differ slightly by runtime, so the implementation should preserve the previous handler and degrade safely

## Implementation Slice

Implement the smallest safe slice first:

1. app helper + tests
2. app global hook + a few critical catches
3. functions helper + tests
4. functions top-level catch instrumentation
5. then resume release work
