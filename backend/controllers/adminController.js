/**
 * CiviShield – Admin Controller
 *
 * User management operations for DepartmentAdmin and SuperAdmin.
 */

const { users } = require('../data/users');
const { logAudit } = require('../services/logService');

function getAllUsers(req, res) {
    const user = req.user;

    // Return sanitized user list (no passwords)
    const sanitized = users.map(({ password, ...rest }) => rest);

    logAudit({
        userId: user.id,
        role: user.role,
        endpoint: req.originalUrl,
        method: 'GET',
        status: 'success',
    });

    return res.json({
        success: true,
        count: sanitized.length,
        data: sanitized,
    });
}

module.exports = { getAllUsers };
