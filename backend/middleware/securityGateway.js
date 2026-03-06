/**
 * CiviShield – Unified Security Gateway Middleware Bundle
 *
 * Chains: rateLimitMiddleware → authMiddleware → roleMiddleware → zoneMiddleware
 * into a single composable middleware factory.
 *
 * Usage:
 *   const securityGateway = require('./securityGateway');
 *   router.get('/resource', securityGateway('view_all_issues'), handler);
 *
 * Individual middleware files are NOT removed — they remain usable independently.
 */

const authMiddleware = require('./authMiddleware');
const roleMiddleware = require('./roleMiddleware');
const zoneMiddleware = require('./zoneMiddleware');
const rateLimitMiddleware = require('./rateLimitMiddleware');

/**
 * securityGateway(permission?)
 *
 * Returns a single middleware that enforces the full security stack:
 *   Rate Limit → Auth → RBAC (optional) → Zone
 *
 * @param {string} [permission] - Optional permission key from policies/permissions.js.
 *   If omitted, RBAC check is skipped (useful for routes that only need auth + zone).
 */
function securityGateway(permission) {
    return function gatewayMiddleware(req, res, next) {
        // Step 1: Rate Limit
        rateLimitMiddleware(req, res, () => {
            // Step 2: Authentication
            authMiddleware(req, res, () => {
                // Step 3: Role-Based Access Control (only if permission specified)
                if (permission) {
                    roleMiddleware(permission)(req, res, () => {
                        // Step 4: Zone-Based Access Control
                        zoneMiddleware(req, res, next);
                    });
                } else {
                    // Step 4: Zone-Based Access Control (no RBAC check)
                    zoneMiddleware(req, res, next);
                }
            });
        });
    };
}

module.exports = securityGateway;
