# CiviShield — CiviFlow Integration Guide

## Overview

CiviShield is designed to integrate seamlessly with **CiviFlow** — an urban issue management platform — by attaching its security middleware stack to CiviFlow's existing Express.js API routes.

---

## Integration Pattern

No code changes are needed inside CiviFlow's business logic. Simply mount CiviShield's middleware before your existing route handlers.

### Step 1: Install CiviShield as a module

```bash
# In your CiviFlow backend
npm install civishield
```

Or during development, use a relative path:

```js
const civishield = require('../civishield/backend');
```

### Step 2: Import CiviShield Middleware

```js
// In CiviFlow's server.js or app.js
const authMiddleware    = require('civishield/middleware/authMiddleware');
const roleMiddleware    = require('civishield/middleware/roleMiddleware');
const zoneMiddleware    = require('civishield/middleware/zoneMiddleware');
const rateLimitMiddleware = require('civishield/middleware/rateLimitMiddleware');
const apiKeyAuth        = require('civishield/middleware/apiKeyAuth');
const { auditResponseMiddleware } = require('civishield/services/logService');
```

### Step 3: Attach to CiviFlow Routes

```js
// Protect citizen-facing issue routes
app.use('/api/issues',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('view_own_issues'),
  auditResponseMiddleware,
  civiflowIssueRouter          // Your existing CiviFlow router
);

// Protect officer status update routes
app.patch('/api/issues/:id/status',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('update_zone_issues'),
  zoneMiddleware,
  civiflowIssueStatusHandler   // Your existing handler
);

// Protect admin dashboard routes
app.use('/api/admin',
  rateLimitMiddleware,
  authMiddleware,
  roleMiddleware('view_all_issues'),
  civiflowAdminRouter
);

// Protect machine-to-machine sensor endpoints
app.use('/api/sensors',
  rateLimitMiddleware,
  apiKeyAuth,
  civiflowSensorRouter
);
```

---

## Adding New Permissions to CiviFlow

All permissions are centralized in `policies/permissions.js`. To add a new CiviFlow-specific role or permission:

```js
// policies/permissions.js
const permissions = {
  // ... existing roles

  // New role for CiviFlow
  WardSupervisor: [
    'view_zone_issues',
    'assign_officers',
    'view_audit_logs',
  ],
};
```

No middleware code changes required — roleMiddleware reads from this file dynamically.

---

## JWT Token Compatibility

CiviFlow's existing JWT tokens must include these fields for CiviShield to work:

```json
{
  "id": "user_id",
  "name": "User Name",
  "email": "user@civiflow.io",
  "role": "FieldOfficer",
  "zone": "Ward 5"
}
```

If CiviFlow uses a different JWT structure, update `utils/tokenUtils.js` to match.

---

## Audit Log Access in CiviFlow

CiviShield's audit logs can be queried from CiviFlow's admin dashboard:

```js
const { getLogs } = require('civishield/services/logService');

// Get last 50 denied requests
const deniedRequests = getLogs({ limit: 50, status: 'denied' });

// Get all actions by a specific user
const userActivity = getLogs({ userId: 'u4' });
```

---

## Security Alerts in CiviFlow

```js
const { getAlerts, acknowledgeAlert } = require('civishield/services/securityMonitor');

// Show alerts in CiviFlow admin panel
const activeAlerts = getAlerts().filter(a => !a.acknowledged);

// Acknowledge from CiviFlow
acknowledgeAlert(alertId);
```

---

## Environment Configuration

```bash
# .env in CiviFlow backend
JWT_SECRET=your_civiflow_shared_jwt_secret
PORT=5001
FRONTEND_URL=https://civiflow.yourdomain.com
```

> The same `JWT_SECRET` must be used by both CiviFlow (token issuer) and CiviShield (token verifier).

---

## Integration Checklist

- [ ] Import CiviShield middleware files
- [ ] Mount middleware stack on each route group
- [ ] Ensure JWT tokens contain `id`, `role`, `zone` fields
- [ ] Share `JWT_SECRET` between CiviFlow auth and CiviShield
- [ ] Add new roles/permissions to `policies/permissions.js` as needed
- [ ] Wire `getLogs()` and `getAlerts()` to CiviFlow admin panel
