# Security Patch — 2026-08-20

This package applies the final security cleanup requested after the Firebase security review.

## Changes

1. Removed the legacy plaintext `adminPassword` value from `data/foundation_store.json`.
2. Removed the independent `sessionStorage` administrator flag. Administrator state is now derived from Firebase Authentication only.
3. Administrator UI access now requires both a signed-in Firebase user and an exact UID match with `VITE_ADMIN_UID`. If `VITE_ADMIN_UID` is missing, administrator access is denied.
4. Hardened public Firestore create rules for `donations`, `inquiries`, and `subscribers` using `hasOnly()` plus type/length/status checks.
5. Synchronized the duplicate Storage Rules file under `src/firebase/storage.rules`.
6. Updated administrator authentication documentation to match the actual implementation.

## Required deployment setting

The Vercel project must contain:

`VITE_ADMIN_UID=<the Firebase Authentication UID of the administrator>`

Do not put a Firebase password in source code or in Vercel source files.

## Important

The Firebase API key in `firebase-applet-config.json` is a client configuration value, not the administrator password. The actual access boundary is Firebase Authentication plus Firestore/Storage Security Rules.
