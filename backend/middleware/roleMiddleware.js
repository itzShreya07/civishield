/**
 * CiviShield – Role-Based Access Control Middleware
 *
 * Factory function: roleMiddleware('permission_name')
 * Reads permissions from policies/permissions.js — no hardcoded strings.
 */

const { hasPermission } = require('../policies/permissions');
const { logAudit } = require('../services/logService');
const { recordEvent } = require('../services/securityMonitor');

function roleMiddleware(requiredPermission) {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Authentication required.',
            });
        }

        if (!hasPermission(user.role, requiredPermission)) {
            recordEvent('restrictedAccess', user.id, req);

            logAudit({
                userId: user.id,
                role: user.role,
                endpoint: req.originalUrl,
                method: req.method,
                status: 'denied',
                reason: `Permission denied: requires '${requiredPermission}', role '${user.role}' not authorized`,
            });

            return res.status(403).json({
                success: false,
                code: 'FORBIDDEN',
                message: `Access denied. Your role '${user.role}' does not have permission: ${requiredPermission}.`,
            });
        }

        next();
    };
}

module.exports = roleMiddleware;
