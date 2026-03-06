/**
 * CiviShield – Security Monitor Service
 *
 * Lightweight threat detection engine.
 * Tracks: failed logins, restricted access attempts, rapid requests.
 * Generates alerts when thresholds are exceeded.
 */

// In-memory counters
const counters = {
    failedLoginAttempts: {}, // userId/ip → { count, lastAttempt }
    restrictedAccessAttempts: {}, // userId → { count, lastAttempt }
    rapidRequests: {}, // userId/ip → { count, windowStart }
};

// In-memory alert store
const alerts = [];

// Thresholds
const THRESHOLDS = {
    failedLogin: 3,      // x failed logins → alert
    restrictedAccess: 5, // x forbidden access hits → alert
    rapidRequests: 30,   // x requests in 10 seconds → alert
    rapidWindowMs: 10000,
};

function recordEvent(eventType, identifier, req) {
    const now = Date.now();

    if (eventType === 'failedLogin') {
        const key = identifier || req?.ip || 'unknown';
        if (!counters.failedLoginAttempts[key]) {
            counters.failedLoginAttempts[key] = { count: 0, lastAttempt: now };
        }
        counters.failedLoginAttempts[key].count += 1;
        counters.failedLoginAttempts[key].lastAttempt = now;

        if (counters.failedLoginAttempts[key].count >= THRESHOLDS.failedLogin) {
            createAlert({
                type: 'FAILED_LOGIN_THRESHOLD',
                severity: 'high',
                message: `Potential insider threat detected: ${counters.failedLoginAttempts[key].count} failed login attempts from identifier '${key}'.`,
                identifier: key,
                endpoint: req?.originalUrl || '/auth/login',
            });
            // Reset counter after alert
            counters.failedLoginAttempts[key].count = 0;
        }
    }

    if (eventType === 'restrictedAccess') {
        const key = identifier || 'unknown';
        if (!counters.restrictedAccessAttempts[key]) {
            counters.restrictedAccessAttempts[key] = { count: 0, lastAttempt: now };
        }
        counters.restrictedAccessAttempts[key].count += 1;
        counters.restrictedAccessAttempts[key].lastAttempt = now;

        if (counters.restrictedAccessAttempts[key].count >= THRESHOLDS.restrictedAccess) {
            createAlert({
                type: 'REPEATED_RESTRICTED_ACCESS',
                severity: 'medium',
                message: `Potential insider threat detected: user '${key}' made ${counters.restrictedAccessAttempts[key].count} unauthorized access attempts.`,
                identifier: key,
                endpoint: req?.originalUrl || 'restricted',
            });
            counters.restrictedAccessAttempts[key].count = 0;
        }
    }

    if (eventType === 'rapidRequest') {
        const key = identifier || req?.ip || 'unknown';
        if (!counters.rapidRequests[key] || now - counters.rapidRequests[key].windowStart > THRESHOLDS.rapidWindowMs) {
            counters.rapidRequests[key] = { count: 1, windowStart: now };
        } else {
            counters.rapidRequests[key].count += 1;
        }

        if (counters.rapidRequests[key].count >= THRESHOLDS.rapidRequests) {
            createAlert({
                type: 'RAPID_REQUEST_SURGE',
                severity: 'medium',
                message: `Unusual request velocity detected: '${key}' made ${counters.rapidRequests[key].count} requests within 10 seconds.`,
                identifier: key,
                endpoint: req?.originalUrl || 'multiple',
            });
            counters.rapidRequests[key].count = 0;
        }
    }
}

function createAlert(data) {
    // Deduplicate similar alerts within 5 minutes
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const existing = alerts.find(
        (a) => a.type === data.type && a.identifier === data.identifier && new Date(a.timestamp).getTime() > fiveMinutesAgo
    );

    if (existing) return;

    const alert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...data,
        timestamp: new Date().toISOString(),
        acknowledged: false,
    };

    alerts.unshift(alert);

    // Cap at 100 alerts
    if (alerts.length > 100) alerts.pop();

    console.warn(`[CiviShield SECURITY ALERT] ${alert.type}: ${alert.message}`);
}

function getAlerts() {
    return alerts;
}

function acknowledgeAlert(alertId) {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
        alert.acknowledged = true;
        return true;
    }
    return false;
}

function getCounters() {
    return counters;
}

module.exports = { recordEvent, getAlerts, acknowledgeAlert, getCounters, createAlert };
