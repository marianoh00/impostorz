const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Global error handlers to aid local debugging
process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (r) => {
  console.error('unhandledRejection', r);
});

// Environment: set GOOGLE_APPLICATION_CREDENTIALS to your service account json
// Ensure the service account has access to the Play Console (or delegated access) and
// the Android Publisher API enabled in the project.

const authClient = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/androidpublisher']
});

if (!process.env.SERVER_JWT_SECRET) {
  console.error('Missing required environment variable SERVER_JWT_SECRET. Set it in your environment or .env file.');
  process.exit(1);
}
const SERVER_JWT_SECRET = process.env.SERVER_JWT_SECRET;

// Basic health route
app.get('/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

app.post('/verify-purchase', async (req, res) => {
  const { token, productId, packageName } = req.body || {};
  if (!token || !productId || !packageName) return res.status(400).json({ valid: false, error: 'missing_fields' });

  try {
    // lazily acquire auth client to avoid startup-time failures when credentials are not present
    const client = await authClient.getClient();
    const publisher = google.androidpublisher({ version: 'v3', auth: client });

    // For one-time products use purchases.products.get
    const result = await publisher.purchases.products.get({ packageName, productId, token });

    // result.data holds purchaseState and other fields. purchaseState === 0 means purchased.
    const data = result.data || {};
    const purchaseState = data.purchaseState !== undefined ? data.purchaseState : null;

    const valid = (purchaseState === 0);

    if (!valid) {
      return res.json({ valid: false, data });
    }

    // Create a short-lived server-signed JWT to give the client an entitlement token
    const payload = {
      productId,
      packageName,
      purchaseToken: token,
      orderId: data.orderId || null,
      iat: Math.floor(Date.now() / 1000)
    };
    const signed = jwt.sign(payload, SERVER_JWT_SECRET, { expiresIn: '30d' });

    return res.json({ valid: true, data, token: signed });
  } catch (err) {
    console.error('verify-purchase error', err && err.stack ? err.stack : err);
    return res.status(500).json({ valid: false, error: 'verification_failed', detail: String(err) });
  }
});

// Verify a server-issued token
app.post('/verify-token', (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ valid: false, error: 'missing_token' });
  try {
    const decoded = jwt.verify(token, SERVER_JWT_SECRET);
    return res.json({ valid: true, payload: decoded });
  } catch (err) {
    return res.status(401).json({ valid: false, error: 'invalid_token', detail: String(err) });
  }
});

// Development-only: issue a signed test token (convenience for local testing)
if (process.env.NODE_ENV !== 'production') {
  app.post('/issue-test-token', (req, res) => {
    const { productId, packageName, orderId } = req.body || {};
    if (!productId || !packageName) return res.status(400).json({ error: 'missing_fields' });
    const payload = {
      productId,
      packageName,
      purchaseToken: `dev-token-${Date.now()}`,
      orderId: orderId || `dev-order-${Date.now()}`,
      iat: Math.floor(Date.now() / 1000)
    };
    const signed = jwt.sign(payload, SERVER_JWT_SECRET, { expiresIn: '30d' });
    return res.json({ token: signed, payload });
  });
}

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => console.log(`Billing verification server running on ${host}:${port} (NODE_ENV=${process.env.NODE_ENV || 'development'})`));
