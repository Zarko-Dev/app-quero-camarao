# Firestore Rules Changes — Task 25

## Summary

Two changes were made to `firestore.rules`:

1. **Hardened `orders/update` rule** — owner can no longer change `status`, `published`, or `paymentValue` except in a narrow exception for free/pix orders.
2. **Added `isAdminViaClaim()` function** — claim-based admin check integrated into `isAdmin()` as OR, preserving backward compatibility with the existing doc-based check.

---

## Change 1: Hardened `orders/update` Rule

### Before

```
allow update: if isOwner(resource.data.userId) && unchanged(['userId']);
```

The owner could change any field except `userId`, including `status`, `published`, and `paymentValue`.

### After

```
allow update: if isOwner(resource.data.userId)
  && unchanged(['userId', 'paymentValue'])
  && (
    unchanged(['status', 'published'])
    || (
      resource.data.paymentValue == 0
      && request.resource.data.status == 'approved'
      && resource.data.status == 'pending'
      && request.resource.data.published == true
      && resource.data.published != true
    )
  );
```

### What Changed

- **Blocked fields for owner updates**: `userId` (already blocked), `paymentValue`, `status`, `published`
- **Exception for free/pix orders**: When `paymentValue == 0`, the owner can transition `status` from `pending` → `approved` and set `published` from non-true → true
- **Why**: The client-side flows in `PaymentEnd/index.jsx` and `PaymentButton/index.jsx` write `status` and `published` directly for free/pix orders. Blocking these entirely would break those flows. The exception is narrow and only allows the specific transition needed.

### Client-Side Sources Analyzed

| File | Flow | Fields Written |
|------|------|---------------|
| `src/pages/PaymentEnd/index.jsx` (line 276-281) | Approved payment (any type) | `status`, `published`, `paymentLog`, plus spread of full order |
| `src/pages/PaymentEnd/index.jsx` (line 403-407) | Non-approved status (default case) | `status`, `paymentLog`, plus spread of full order |
| `src/pages/Payment/components/PaymentButton/index.jsx` (line 254-263) | Free order (paymentValue==0) | `status="approved"`, `published=true`, `paymentLog`, plus spread |

### Future Work

Migrate free/pix order approval to a Cloud Function so that `status` and `published` are never set client-side, allowing the hardened rule to apply universally without exception.

---

## Change 2: Added `isAdminViaClaim()` and Integrated into `isAdmin()`

### Before

```javascript
function isAdmin() {
  return isSignedIn()
    && exists(/databases/$(database)/documents/users/$(myEmail()))
    && get(/databases/$(database)/documents/users/$(myEmail())).data.rules.hasAny(['Admin']);
}
```

### After

```javascript
function isAdminViaClaim() {
  return request.auth != null && request.auth.token.admin == true;
}

function isAdmin() {
  return isAdminViaClaim()
    || (isSignedIn()
      && exists(/databases/$(database)/documents/users/$(myEmail()))
      && get(/databases/$(database)/documents/users/$(myEmail())).data.rules.hasAny(['Admin']));
}
```

### What Changed

- **New function `isAdminViaClaim()`**: Checks `request.auth.token.admin == true` — a claim-based admin check that works when the Firebase Auth token has the `admin` custom claim set (e.g., by Cloud Functions or Admin SDK during custom login).
- **`isAdmin()` now uses OR**: Returns `true` if EITHER the claim-based check passes OR the existing doc-based check passes. This preserves full backward compatibility with the current document-based admin model while enabling claim-based admin for future use.

### Why

The current admin model relies on reading the `users/{email}` document and checking its `rules` array. This requires a Firestore read per admin check and depends on the document being correctly populated. The claim-based approach is faster (no Firestore read) and more secure (claims are set server-side and cannot be tampered with by the client). Supporting both approaches ensures no regression during the transition.

---

## Validation

- **Syntax**: Manual review of all modified sections against existing Firestore rules patterns in the file. No `@firebase/rules-unit-testing` or `firebase emulators:start` was available in this environment for automated validation.
- **No commits made.**