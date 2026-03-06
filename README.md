# CiviShield

> **Modular Security Gateway for Smart City Infrastructure**
> Integration-ready with CiviFlow | Hackathon MVP | v1.0.0

---

## Problem Statement

Smart city platforms expose multiple APIs — traffic sensors, water management systems, IoT devices, citizen complaint portals — each with no unified security layer. This results in:

- No centralized access control
- No role-based or zone-based restrictions
- No audit trail of API activity
- No detection of suspicious behavior
- Vulnerable machine-to-machine communication

---

## Solution Overview

**CiviShield** is a **plug-and-play security middleware gateway** that sits in front of any city system API. It enforces:

| Feature | Description |
|---|---|
| Role-Based Access Control | 5 roles with centralized permission policies |
| Zone-Based Restrictions | Field Officers locked to assigned city zones |
| Suspicious Activity Detection | Failed logins, restricted access, request surge detection |
| External API Token Auth | x-api-key M2M authentication for IoT & partner systems |
| Rate Limiting | 50 req/min per user, in-memory sliding window |
| Audit Logging | Every request logged with user, role, endpoint, status |
| Centralized Policy Engine | Single permissions.js file — no hardcoded logic |

---

## Architecture Diagram

```
                        ┌─────────────────────────────────┐
  Client / IoT Sensor   │   CiviShield Security Gateway   │
  ────────────────────► │                                 │
                        │  [1] rateLimitMiddleware        │
                        │  [2] authMiddleware (JWT)       │
                        │  [3] roleMiddleware (RBAC)      │
                        │  [4] zoneMiddleware (Zone)      │
                        │  [5] auditResponseMiddleware    │
                        └──────────────┬──────────────────┘
                                       │
              ┌────────────────────────┼──────────────────────┐
              ▼                        ▼                       ▼
    City Issues API          Admin / Audit API        External Data API
    (Citizen, Officer)       (Admin, SuperAdmin)      (API Key auth)
```

---

## Folder Structure

```
civishield/
├── backend/
│   ├── controllers/        # Business logic handlers
│   │   ├── authController.js
│   │   ├── issueController.js
│   │   ├── adminController.js
│   │   ├── auditController.js
│   │   └── externalController.js
│   ├── middleware/         # Security layers (plug & play)
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── zoneMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   └── apiKeyAuth.js
│   ├── services/           # Business & security services
│   │   ├── logService.js
│   │   └── securityMonitor.js
│   ├── policies/
│   │   └── permissions.js  # Centralized permission engine
│   ├── routes/             # Route definitions
│   ├── data/               # In-memory mock data
│   └── server.js
├── frontend/
│   └── src/
│       ├── pages/          # Login, Dashboard, Issues, Audit, Alerts
│       ├── components/     # Layout, Icons
│       ├── context/        # AuthContext
│       └── services/       # Axios API client
└── docs/
    ├── architecture.md
    ├── api-spec.md
    └── integration.md
```

---

## Role Permission Matrix

| Permission | Citizen | FieldOfficer | DepartmentAdmin | SuperAdmin |
|---|:---:|:---:|:---:|:---:|
| view_own_issues | ✓ | | | ✓ |
| create_issue | ✓ | | | ✓ |
| view_zone_issues | | ✓ | | ✓ |
| update_zone_issues | | ✓ | | ✓ |
| assign_officers | | | ✓ | ✓ |
| view_all_issues | | | ✓ | ✓ |
| view_audit_logs | | | ✓ | ✓ |
| view_users | | | ✓ | ✓ |
| view_security_alerts | | | | ✓ |
| manage_api_keys | | | | ✓ |

---

## API List

| Method | Route | Auth | Permission |
|---|---|---|---|
| `POST` | `/auth/login` | None | — |
| `GET` | `/issues` | JWT | view_own_issues / view_zone_issues / view_all_issues |
| `POST` | `/issues` | JWT | create_issue |
| `PATCH` | `/issues/:id/status` | JWT + Zone | update_zone_issues |
| `GET` | `/admin/users` | JWT | view_users |
| `GET` | `/audit/logs` | JWT | view_audit_logs |
| `GET` | `/audit/alerts` | JWT | view_security_alerts |
| `PATCH` | `/audit/alerts/:id/ack` | JWT | view_security_alerts |
| `GET` | `/external/data` | API Key | — |
| `GET` | `/health` | None | — |

---

## Demo Credentials

| Role | Email | Password | Zone |
|---|---|---|---|
| Citizen | alice@civishield.io | citizen123 | — |
| Field Officer | raj@civishield.io | officer123 | Ward 5 |
| Field Officer | priya@civishield.io | officer123 | Ward 9 |
| Department Admin | kumar@civishield.io | admin123 | — |
| Super Admin | superadmin@civishield.io | super123 | — |

### External API Keys

| Client | API Key |
|---|---|
| Traffic Sensor | `cs_traffic_sensor_key_7f8e9a` |
| Water Management | `cs_water_mgmt_key_2b3c4d` |
| CiviFlow Integration | `cs_civiflow_int_key_5e6f7a` |
| Revoked Key | `cs_revoked_key_9x0y1z` |

---

## Run Instructions

### Prerequisites
- Node.js >= 18
- npm >= 9

### 1. Start Backend

```bash
cd backend
npm install
npm run dev
# Server: http://localhost:5001
```

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
# UI: http://localhost:5173
```

### Both servers must run simultaneously.

---

## Demo Scenarios

| Scenario | Steps |
|---|---|
| **1. Citizen access** | Login as Alice → view own issues only |
| **2. Officer zone access** | Login as Raj → see only Ward 5 issues |
| **3. Zone violation** | Login as Raj → try to update Ward 9 issue → 403 |
| **4. Suspicious login** | Login with wrong password 3 times → alert triggered |
| **5. Admin audit** | Login as Admin → view audit logs table |
| **6. External API** | Use any API key in Alerts page → test M2M auth |
| **7. Rate limit** | Send >50 requests/min → 429 Too Many Requests |

---

> CiviShield is designed for integration with **CiviFlow**. See `docs/integration.md` for details.
