Security and Privacy Considerations for "Go Ad‑Free" (Google Play Billing)

Overview
- This document outlines security threats, mitigation strategies, and privacy/data considerations when implementing a one-time "Go Ad‑Free" purchase using Google Play Billing.

Client vs Server
- Do not trust client-only checks. A rooted or modified device can fake localStorage or in-app SDK responses.
- Always perform server-side receipt validation using Google Play Developer API and store a canonical purchase record server-side.

Threats / Potential Breaches
1) Local tampering
   - Attack: Modify app or local storage to mark `adsRemoved=true`.
   - Mitigation: Verify purchase tokens server-side and store state tied to a server-side account or device identifier.
2) Fake purchases or replayed receipts
   - Attack: Reuse a captured purchase token or use a forged response to the app.
   - Mitigation: Server verifies token with Google, checks orderId, purchaseState, and packageName.
3) Refunds and chargebacks
   - Attack: User obtains refund but still has ad-free access.
   - Mitigation: Server should subscribe to Real-time Developer Notifications (RTDN) or periodically validate purchase status and revoke access on refund.
4) Device cloning / multiple installs
   - Attack: Copy localStorage/payload to other devices.
   - Mitigation: Tie purchase to a user account (recommended) or maintain server-side mapping of purchase tokens to allowed device IDs. Use `purchaseToken` uniqueness checks.
5) Man-in-the-Middle (MITM)
   - Attack: Intercept client-server communication to alter verification.
   - Mitigation: Use HTTPS/TLS with certificate pinning where feasible; require server-signed validation tokens for client consumption.
6) Insecure storage of tokens/keys
   - Attack: Exfiltrate stored purchase tokens/credentials.
   - Mitigation: Do not store sensitive API keys in the client. Use server side service account credentials to call Google APIs and keep them secret.
7) Emulator / test account misuse
   - Attack: Abuse test purchases or emulator tooling to bypass checks.
   - Mitigation: Differentiate test purchases from real ones, validate developer payloads, and check account info server-side.

Recommended Secure Flow
1) Client initiates purchase via Play Billing.
2) Billing returns `purchaseToken` and purchase details to client.
3) Client POSTs `purchaseToken` + `productId` + `orderId` to secure backend over TLS.
4) Backend calls Google Play Developer API to verify token:
   - Use `purchases.products.get` or `purchases.subscriptions.get` as appropriate
   - Verify `purchaseState` (0 = purchased), `consumptionState`, and `orderId` matches
   - Check packageName and productId
5) Backend stores canonical purchase record (userId, purchaseToken, orderId, time, productId).
6) Backend returns an opaque signed session token (JWT) or boolean to client to indicate entitlement.
7) Client stores minimal flag; the app checks with backend when necessary (e.g., app reinstall, periodic validation).

Privacy Considerations
- Data collected during purchase flows may include:
  - User account email (if used server-side), Google account identifiers, device identifiers, purchase tokens, order IDs, timestamps.
- Limit data retention to business needs: do not store raw payment methods or personal financial data.
- Provide a privacy policy referencing:
  - What purchase data you collect
  - Why you collect it (receipt verification, fraud detection)
  - Retention period and user's rights (restore purchases, request deletion)
- If you tie purchases to user accounts, ensure your authentication and account management are GDPR/CCPA-compliant if applicable.

Implementation Notes
- Use the official Google Play Billing Client on Android and the Google Play Developer API on the server.
- For React + Capacitor, prefer a maintained Capacitor billing plugin that exposes native Play Billing features, or implement a minimal Capacitor plugin wrapper around native BillingClient APIs.
- Testing:
  - Use Google Play "internal testing" or "license testers" for real flows.
  - Use Google-provided test product IDs for initial validation.

Restore / Offline
- Allow users to restore purchases across devices via server-side mapping or use Play Billing's `queryPurchases`/`queryPurchaseHistory` to list owned products.
- For offline fallback, store a locally-signed receipt and periodically re-verify when online.

Server Requirements
- A secure server capable of calling Google Play Developer API using a service account and proper OAuth2.
- Endpoints:
  - POST /verify-purchase { token, productId, orderId } -> { valid: bool, productId }
  - POST /restore-purchases { userId or deviceId } -> list of purchases

Server verification example
- We included a small example server at `server/index.js` that uses the `googleapis` Node client
   to call `purchases.products.get` and validate a `purchaseToken`. This server is a starting
   point; for production you should harden it (HTTPS, auth, rate-limiting) and return a signed
   entitlement token to the client.

Summary
- Client changes alone are insufficient for secure entitlement. Implement server-side verification and mapping.
- Persist minimal info client-side; keep authoritative record server-side.
- Monitor refunds and revoke access if a purchase is reversed.

