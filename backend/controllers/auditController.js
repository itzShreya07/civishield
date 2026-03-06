/**
 * CiviShield – Audit Controller
 *
 * Exposes audit logs and security alerts.
 */

const { getLogs } = require('../services/logService');
const { getAlerts, acknowledgeAlert } = require('../services/securityMonitor');
const { logAudit } = require('../services/logService');

function getAuditLogs(req, res) {
    const user = req.user;
    const { limit, userId, status } = req.query;

    const logs = getLogs({
        limit: limit ? parseInt(limit) : 100,
        userId,
        status,
    });

    logAudit({
        userId: user.id,
        role: user.role,
        endpoint: req.originalUrl,
        method: 'GET',
        status: 'success',
    });

    return res.json({
        success: true,
        count: logs.length,
        data: logs,
    });
}

function getSecurityAlerts(req, res) {
    const user = req.user;
    const alerts = getAlerts();

    logAudit({
        userId: user.id,
        role: user.role,
        endpoint: req.originalUrl,
        method: 'GET',
        status: 'success',
    });

    return res.json({
        success: true,
        count: alerts.length,
        data: alerts,
    });
}

function ackAlert(req, res) {
    const { alertId } = req.params;
    const success = acknowledgeAlert(alertId);

    if (!success) {
        return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    return res.json({ success: true, message: 'Alert acknowledged.' });
}

module.exports = { getAuditLogs, getSecurityAlerts, ackAlert };
