# CiviShield — Security Gateway Architecture

## Overview

CiviShield is a **plug-and-play security middleware layer** built on Express.js. It intercepts every API request before it reaches city platform business logic, enforcing authentication, authorization, zone restrictions, rate limiting, and audit logging.

---

## Security Gateway Architecture

```
                          ┌──────────────────────────────────────────┐
  Incoming Request        │          CiviShield Gateway              │
  ──────────────────────► │                                          │
                          │   ┌──────────────────────────────────┐  │
                          │   │  1. rateLimitMiddleware           │  │
                          │   │     50 req/min per user/IP        │  │
                          │   │     → 429 if exceeded            │  │
                          │   └────────────────┬─────────────────┘  │
                          │                    ▼                     │
                          │   ┌──────────────────────────────────┐  │
                          │   │  2. authMiddleware                │  │
                          │   │     Validates JWT Bearer token    │  │
                          │   │     → 401 if missing/invalid     │  │
                          │   └────────────────┬─────────────────┘  │
                          │                    ▼                     │
                          │   ┌──────────────────────────────────┐  │
                          │   │  3. roleMiddleware(permission)    │  │
                          │   │     Reads policies/permissions.js │  │
                          │   │     → 403 if role not allowed    │  │
                          │   └────────────────┬─────────────────┘  │
                          │                    ▼                     │
                          │   ┌──────────────────────────────────┐  │
                          │   │  4. zoneMiddleware (optional)     │  │
                          │   │     Restricts FieldOfficers to    │  │
                          │   │     assigned city zone            │  │
                          │   │     → 403 ZONE_FORBIDDEN         │  │
                          │   └────────────────┬─────────────────┘  │
                          │                    ▼                     │
                          │   ┌──────────────────────────────────┐  │
                          │   │  5. Business Logic Handler        │  │
                          │   │     Controller runs only if all  │  │
                          │   │     security checks pass         │  │
                          │   └────────────────┬─────────────────┘  │
                          │                    ▼                     │
                          │   ┌──────────────────────────────────┐  │
                          │   │  6. auditResponseMiddleware       │  │
                          │   │     Logs every successful resp.   │  │
                          └───└──────────────────────────────────┘──┘
                                               │
                                               ▼
                                    Response sent to client
```

---

## External API Authentication Flow

For machine-to-machine (M2M) clients (IoT, traffic sensors, water systems):

```
External Client ──► x-api-key header ──► apiKeyAuth middleware
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                          Key missing    Key invalid     Key revoked
                          → 401          → 401           → 401
                                                  │
                                          Key valid + active
                                          → Attach client info
                                          → Pass to controller
```

---

## Module Responsibilities

| Module | File | Responsibility |
|---|---|---|
| Auth | `middleware/authMiddleware.js` | JWT validation, failed login tracking |
| RBAC | `middleware/roleMiddleware.js` | Permission checking via policy engine |
| Zone | `middleware/zoneMiddleware.js` | Spatial access restriction for officers |
| Rate Limit | `middleware/rateLimitMiddleware.js` | 50 req/min sliding window |
| API Key | `middleware/apiKeyAuth.js` | M2M x-api-key validation |
| Policy Engine | `policies/permissions.js` | Single source of truth for all permissions |
| Security Monitor | `services/securityMonitor.js` | Threat detection and alerting |
| Audit Log | `services/logService.js` | Immutable request audit trail |

---

## Security Monitor Service

The `securityMonitor` service tracks three threat patterns:

| Pattern | Threshold | Alert Type |
|---|---|---|
| Failed login attempts | 3 per identifier | `FAILED_LOGIN_THRESHOLD` |
| Repeated restricted access | 5 per user | `REPEATED_RESTRICTED_ACCESS` |
| Rapid request surge | 30 in 10s per user | `RAPID_REQUEST_SURGE` |

Alerts are deduplicated (no duplicate of same type within 5 minutes), stored in-memory, and exposed via `GET /audit/alerts`.

---

## Design Principles

1. **Separation of concerns** — Security logic is entirely in `middleware/` and `services/`. Controllers contain only business logic.
2. **Policy-driven** — All permissions defined in `policies/permissions.js`. Changing a role's access requires editing only one file.
3. **Composable middleware chain** — Each middleware is independent. Routes compose exactly the security layers they need.
4. **Fail-secure** — Any authentication or authorization failure returns a structured error immediately; the controller is never called.
5. **Observable** — Every request, success or denial, is logged with full context.
