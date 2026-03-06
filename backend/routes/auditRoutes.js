const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const { getAuditLogs, getSecurityAlerts, ackAlert } = require('../controllers/auditController');
const { getSecurityMetrics } = require('../controllers/metricsController');

router.use(rateLimitMiddleware);
router.use(authMiddleware);

// GET /audit/logs — DepartmentAdmin and SuperAdmin
router.get('/logs', roleMiddleware('view_audit_logs'), getAuditLogs);

// GET /audit/alerts — SuperAdmin only (via view_security_alerts)
router.get('/alerts', roleMiddleware('view_security_alerts'), getSecurityAlerts);

// PATCH /audit/alerts/:alertId/ack — Acknowledge an alert
router.patch('/alerts/:alertId/ack', roleMiddleware('view_security_alerts'), ackAlert);

// GET /audit/metrics — Aggregated security metrics for dashboard card
router.get('/metrics', roleMiddleware('view_audit_logs'), getSecurityMetrics);

module.exports = router;
