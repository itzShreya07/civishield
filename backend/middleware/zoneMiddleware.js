/**
 * CiviShield – Zone-Based Access Control Middleware
 *
 * Restricts Field Officers to their assigned city zone.
 * Attaches to issue routes to enforce spatial restrictions.
 *
 * Usage: router.patch('/:id/status', authMiddleware, zoneMiddleware, handler)
 */

const { issues } = require('../data/issues');
const { logAudit } = require('../services/logService');

function zoneMiddleware(req, res, next) {
    const user = req.user;

    // Only FieldOfficer roles are zone-restricted; others pass through
    if (user.role !== 'FieldOfficer') {
        return next();
    }

    const issueId = req.params.id;

    if (!issueId) {
        // No specific issue targeted; apply zone filter via query
        return next();
    }

    const issue = issues.find((i) => i.id === issueId);

    if (!issue) {
        return res.status(404).json({
            success: false,
            code: 'NOT_FOUND',
            message: 'Issue not found.',
        });
    }

    if (user.zone !== issue.zone) {
        logAudit({
            userId: user.id,
            role: user.role,
            endpoint: req.originalUrl,
            method: req.method,
            status: 'denied',
            reason: `Zone violation: officer zone '${user.zone}' attempted access to issue in zone '${issue.zone}'`,
        });

        return res.status(403).json({
            success: false,
            code: 'ZONE_FORBIDDEN',
            message: `Access denied. Issue belongs to zone '${issue.zone}', but your assigned zone is '${user.zone}'.`,
        });
    }

    // Attach issue to request for convenience
    req.issue = issue;
    next();
}

module.exports = zoneMiddleware;
