/**
 * CiviShield – Centralized Permission Policy Engine
 *
 * All role-based permissions are defined here in one place.
 * Middleware reads from this file—no hardcoded permission strings anywhere else.
 */

const permissions = {
    Citizen: [
        'view_own_issues',
        'create_issue',
    ],

    FieldOfficer: [
        'view_zone_issues',
        'update_zone_issues',
    ],

    DepartmentAdmin: [
        'assign_officers',
        'view_all_issues',
        'view_audit_logs',
        'view_users',
    ],

    SuperAdmin: [
        'full_access',
        'view_own_issues',
        'create_issue',
        'view_zone_issues',
        'update_zone_issues',
        'assign_officers',
        'view_all_issues',
        'view_audit_logs',
        'view_users',
        'view_security_alerts',
        'manage_api_keys',
    ],
};

/**
 * Check if a role has a given permission.
 * SuperAdmin always passes via 'full_access'.
 */
function hasPermission(role, permission) {
    const rolePerms = permissions[role] || [];
    return rolePerms.includes('full_access') || rolePerms.includes(permission);
}

module.exports = { permissions, hasPermission };
