Local verification server for Impostorz

This small Express server demonstrates how to verify Google Play purchase tokens server-side.

Prerequisites
- Create a Google Cloud service account with access to the Google Play Android Developer API for your project.
- Download the service account JSON and keep it secret.
- Enable the Android Publisher API in Google Cloud for the project that owns your Play Console.
- Grant the service account access to your Play Console or use a project linked to your Play Console.

Run locally (emulator-friendly)
1. Copy your service account JSON to the server folder or a secure location.
2. Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to the path of that JSON file.
3. Install dependencies and run:

   npm install
   npm start

The server listens on port 3000 by default.

Endpoint
POST /verify-purchase
- Request JSON: { token: string, productId: string, packageName: string }
- Response JSON: { valid: boolean, data: object }

Notes
- For production, run the server behind HTTPS and protect the endpoint with authentication.
- Consider returning a signed short-lived JWT to the client indicating entitlement instead of raw verification data.
   This example issues a server-signed JWT (`token`) when verification succeeds. The client should
   store that token and use `/verify-token` to validate it locally during restores or app startup.

Environment variables
- `GOOGLE_APPLICATION_CREDENTIALS` -> path to service account JSON
- `SERVER_JWT_SECRET` -> HMAC secret used to sign entitlement tokens (change for production)
- Subscribe to Google Play Real-time Developer Notifications (RTDN) or periodically poll purchases to detect refunds and revoke access.

Emulator tip
- From an Android emulator, `10.0.2.2` maps to the host machine. The client in `App.tsx` uses `http://10.0.2.2:3000` by default for verification when not running in a browser.
