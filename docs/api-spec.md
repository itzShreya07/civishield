# CiviShield — API Specification

**Base URL:** `http://localhost:5001`
**Auth:** Bearer JWT (most routes) | x-api-key header (external routes)

---

## Authentication

### POST /auth/login

Login and receive a JWT token.

**Request Body:**
```json
{
  "email": "alice@civishield.io",
  "password": "citizen123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u1",
    "name": "Alice Chen",
    "email": "alice@civishield.io",
    "role": "Citizen",
    "zone": null
  }
}
```

**Error Responses:**
- `400` — Missing email or password
- `401` — Invalid credentials (also triggers failed login counter)
- `429` — Rate limit exceeded

---

## Issues

> All routes require: `Authorization: Bearer <token>`

### GET /issues

Returns issues filtered by role:
- **Citizen** → own issues only
- **FieldOfficer** → zone issues only
- **DepartmentAdmin / SuperAdmin** → all issues

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "i1",
      "title": "Broken Street Light",
      "description": "...",
      "category": "Infrastructure",
      "status": "open",
      "zone": "Ward 5",
      "createdBy": "u1",
      "createdAt": "2026-03-01T08:00:00.000Z"
    }
  ]
}
```

---

### POST /issues

Create a new issue. Requires `create_issue` permission.

**Request Body:**
```json
{
  "title": "Pothole on Main Street",
  "description": "Large pothole causing traffic hazard.",
  "category": "Roads",
  "zone": "Ward 5"
}
```

**Response (201):**
```json
{ "success": true, "message": "Issue created successfully.", "data": { ... } }
```

**Error Responses:**
- `400` — Validation error (missing required fields)
- `403` — Forbidden (role lacks create_issue permission)

---

### PATCH /issues/:id/status

Update an issue's status. FieldOfficers are zone-restricted.

**Request Body:**
```json
{ "status": "in_progress" }
```

Valid statuses: `open`, `in_progress`, `resolved`, `closed`

**Response (200):**
```json
{ "success": true, "message": "Issue status updated.", "data": { ... } }
```

**Error Responses:**
- `403 ZONE_FORBIDDEN` — FieldOfficer accessing issue outside their zone
- `404` — Issue not found

---

## Admin

> Requires `view_users` permission (DepartmentAdmin or SuperAdmin)

### GET /admin/users

Returns all registered users (passwords omitted).

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    { "id": "u1", "name": "Alice Chen", "email": "alice@civishield.io", "role": "Citizen", "zone": null },
    ...
  ]
}
```

---

## Audit

> Requires DepartmentAdmin or SuperAdmin JWT

### GET /audit/logs

Returns audit log entries. Requires `view_audit_logs` permission.

**Query Parameters:**
- `limit` (number, default 100)
- `userId` (string, filter by user)
- `status` (`success` | `denied`)

**Response (200):**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": "log_1234_abc",
      "userId": "u2",
      "role": "FieldOfficer",
      "endpoint": "/issues/i3/status",
      "method": "PATCH",
      "status": "denied",
      "reason": "Zone violation: officer zone 'Ward 5' attempted access to issue in zone 'Ward 9'",
      "timestamp": "2026-03-06T09:01:00.000Z"
    }
  ]
}
```

---

### GET /audit/alerts

Returns security alerts. Requires `view_security_alerts` permission (SuperAdmin only).

**Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "alert_1234_xyz",
      "type": "FAILED_LOGIN_THRESHOLD",
      "severity": "high",
      "message": "Potential insider threat detected: 3 failed login attempts from identifier 'alice@civishield.io'.",
      "identifier": "alice@civishield.io",
      "endpoint": "/auth/login",
      "timestamp": "2026-03-06T09:05:00.000Z",
      "acknowledged": false
    }
  ]
}
```

---

### PATCH /audit/alerts/:alertId/ack

Acknowledge a security alert. Requires SuperAdmin.

**Response (200):**
```json
{ "success": true, "message": "Alert acknowledged." }
```

---

## External System API

> Authentication: `x-api-key: <api_key>` header (no JWT)

### GET /external/data

Machine-to-machine endpoint for external smart city systems.

**Request Headers:**
```
x-api-key: cs_traffic_sensor_key_7f8e9a
```

**Response (200):**
```json
{
  "success": true,
  "message": "External data retrieved successfully via CiviShield Gateway.",
  "source": "CiviShield Gateway",
  "client": "Traffic Sensor Network",
  "clientType": "IoT",
  "data": {
    "trafficStatus": { ... },
    "waterSystemStatus": { ... },
    "iotSensorHealth": { ... },
    "systemStatus": "operational"
  }
}
```

**Error Responses:**
- `401 API_KEY_MISSING` — No x-api-key header
- `401 API_KEY_INVALID` — Key not found in store
- `401 API_KEY_REVOKED` — Key is inactive

---

## Health Check

### GET /health

No authentication required.

**Response (200):**
```json
{
  "status": "operational",
  "service": "CiviShield Security Gateway",
  "version": "1.0.0",
  "timestamp": "2026-03-06T09:00:00.000Z",
  "uptime": 3600
}
```

---

## Error Response Format

All errors follow this standard structure:

```json
{
  "success": false,
  "code": "ERROR_CODE",
  "message": "Human-readable error message."
}
```

| Code | HTTP | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `TOKEN_INVALID` | 401 | JWT expired or malformed |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `API_KEY_MISSING` | 401 | No x-api-key header |
| `API_KEY_INVALID` | 401 | Unknown API key |
| `API_KEY_REVOKED` | 401 | Deactivated API key |
| `FORBIDDEN` | 403 | Insufficient role permissions |
| `ZONE_FORBIDDEN` | 403 | Officer outside assigned zone |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Server error |
