/**
 * CiviShield – Security Metrics API Endpoint
 *
 * Returns aggregated security metrics from audit logs and security monitor.
 * Exposed as GET /audit/metrics — accessible to DepartmentAdmin and SuperAdmin.
 */

const { getLogs } = require('../services/logService');
const { getAlerts, getCounters } = require('../services/securityMonitor');
const { logAudit } = require('../services/logService');

function getSecurityMetrics(req, res) {
    const user = req.user;
    const logs = getLogs({ limit: 500 });
    const alerts = getAlerts();

    const failedLogins = logs.filter(
        (l) => l.status === 'denied' && l.endpoint?.includes('/auth/login')
    ).length;

    const blockedRequests = logs.filter(
        (l) => l.status === 'denied' && !l.endpoint?.includes('/auth/login')
    ).length;

    const rateLimitViolations = logs.filter(
        (l) => l.reason?.toLowerCase().includes('rate') || l.reason?.toLowerCase().includes('429')
    ).length;

    const activeAlerts = alerts.filter((a) => !a.acknowledged).length;
    const highSeverityAlerts = alerts.filter(
        (a) => !a.acknowledged && a.severity === 'high'
    ).length;

    logAudit({
        userId: user.id,
        role: user.role,
        endpoint: req.originalUrl,
        method: 'GET',
        status: 'success',
    });

    return res.json({
        success: true,
        data: {
            failedLogins,
            blockedRequests,
            rateLimitViolations,
            activeAlerts,
            highSeverityAlerts,
            totalRequests: logs.length,
            timestamp: new Date().toISOString(),
        },
    });
}

module.exports = { getSecurityMetrics };
