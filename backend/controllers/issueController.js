/**
 * CiviShield – Issue Controller
 *
 * Handles CRUD operations on city issues.
 * Access is enforced by authMiddleware + roleMiddleware + zoneMiddleware.
 */

const { issues } = require('../data/issues');
const { users } = require('../data/users');
const { logAudit } = require('../services/logService');

function getAllIssues(req, res) {
    const user = req.user;
    let result = issues;

    // Field officers only see their zone
    if (user.role === 'FieldOfficer') {
        result = issues.filter((i) => i.zone === user.zone);
    }
    // Citizens only see their own issues
    else if (user.role === 'Citizen') {
        result = issues.filter((i) => i.createdBy === user.id);
    }
    // Admins and SuperAdmin see all

    logAudit({
        userId: user.id,
        role: user.role,
        endpoint: req.originalUrl,
        method: 'GET',
        status: 'success',
    });

    return res.json({
        success: true,
        count: result.length,
        data: result,
    });
}

function createIssue(req, res) {
    const user = req.user;
    const { title, description, category, zone } = req.body;

    if (!title || !description || !zone) {
        return res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: 'title, description, and zone are required.',
        });
    }

    const newIssue = {
        id: `i${Date.now()}`,
        title,
        description,
        category: category || 'General',
        status: 'open',
        zone,
        createdBy: user.id,
        assignedTo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    issues.unshift(newIssue);

    logAudit({
        userId: user.id,
        role: user.role,
        endpoint: req.originalUrl,
        method: 'POST',
        status: 'success',
    });

    return res.status(201).json({
        success: true,
        message: 'Issue created successfully.',
        data: newIssue,
    });
}

function updateIssueStatus(req, res) {
    const user = req.user;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];

    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: `status must be one of: ${validStatuses.join(', ')}`,
        });
    }

    // Issue was already attached by zoneMiddleware if officer
    const issue = req.issue || issues.find((i) => i.id === id);

    if (!issue) {
        return res.status(404).json({
            success: false,
            code: 'NOT_FOUND',
            message: 'Issue not found.',
        });
    }

    issue.status = status;
    issue.updatedAt = new Date().toISOString();

    logAudit({
        userId: user.id,
        role: user.role,
        endpoint: req.originalUrl,
        method: 'PATCH',
        status: 'success',
    });

    return res.json({
        success: true,
        message: 'Issue status updated.',
        data: issue,
    });
}

module.exports = { getAllIssues, createIssue, updateIssueStatus };
