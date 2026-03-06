/**
 * CiviShield – Audit Log Service
 *
 * Every request (success or denied) is logged here.
 * Logs are stored in-memory and exposed via the /audit/logs endpoint.
 */

const logs = [];

/**
 * Log an audit event.
 * @param {Object} entry
 * @param {string} entry.userId
 * @param {string} entry.role
 * @param {string} entry.endpoint
 * @param {string} entry.method
 * @param {string} entry.status  - 'success' | 'denied'
 * @param {string} [entry.reason]
 */
function logAudit(entry) {
    const record = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: entry.userId || 'anonymous',
        role: entry.role || 'unknown',
        endpoint: entry.endpoint,
        method: entry.method || 'GET',
        status: entry.status, // 'success' | 'denied'
        reason: entry.reason || null,
        timestamp: new Date().toISOString(),
    };

    logs.unshift(record);

    // Cap log size at 500 entries
    if (logs.length > 500) logs.pop();

    const symbol = record.status === 'success' ? '✓' : '✗';
    console.log(
        `[AUDIT] ${symbol} ${record.method} ${record.endpoint} | user:${record.userId} role:${record.role} | ${record.status}`
    );
}

/**
 * Return all audit logs, optionally filtered.
 */
function getLogs({ limit = 100, userId, status } = {}) {
    let result = [...logs];

    if (userId) result = result.filter((l) => l.userId === userId);
    if (status) result = result.filter((l) => l.status === status);

    return result.slice(0, limit);
}

/**
 * Express middleware: auto-log successful responses.
 * Attach after routes that should be tracked.
 */
function auditResponseMiddleware(req, res, next) {
    const originalJson = res.json.bind(res);

    res.json = (body) => {
        if (req.user && res.statusCode < 400) {
            logAudit({
                userId: req.user.id,
                role: req.user.role,
                endpoint: req.originalUrl,
                method: req.method,
                status: 'success',
            });
        }
        return originalJson(body);
    };

    next();
}

module.exports = { logAudit, getLogs, auditResponseMiddleware };
