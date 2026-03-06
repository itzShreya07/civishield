/**
 * CiviShield – External API Key Authentication Middleware
 *
 * Validates machine-to-machine requests via x-api-key header.
 * Used by traffic sensors, water systems, IoT devices, and CiviFlow.
 */

const { apiKeys } = require('../data/apiKeys');
const { logAudit } = require('../services/logService');

function apiKeyAuth(req, res, next) {
    const providedKey = req.headers['x-api-key'];

    if (!providedKey) {
        logAudit({
            userId: 'external_client',
            role: 'ExternalSystem',
            endpoint: req.originalUrl,
            method: req.method,
            status: 'denied',
            reason: 'Missing x-api-key header',
        });

        return res.status(401).json({
            success: false,
            code: 'API_KEY_MISSING',
            message: 'External API access requires x-api-key header.',
        });
    }

    const apiKeyRecord = apiKeys.find((k) => k.key === providedKey);

    if (!apiKeyRecord) {
        logAudit({
            userId: 'external_client',
            role: 'ExternalSystem',
            endpoint: req.originalUrl,
            method: req.method,
            status: 'denied',
            reason: 'Invalid API key provided',
        });

        return res.status(401).json({
            success: false,
            code: 'API_KEY_INVALID',
            message: 'Invalid API key.',
        });
    }

    if (!apiKeyRecord.active) {
        logAudit({
            userId: 'external_client',
            role: 'ExternalSystem',
            endpoint: req.originalUrl,
            method: req.method,
            status: 'denied',
            reason: `Revoked API key used by client: ${apiKeyRecord.clientName}`,
        });

        return res.status(401).json({
            success: false,
            code: 'API_KEY_REVOKED',
            message: 'This API key has been revoked.',
        });
    }

    // Attach client info to request
    req.externalClient = {
        name: apiKeyRecord.clientName,
        type: apiKeyRecord.clientType,
        permissions: apiKeyRecord.permissions,
    };

    logAudit({
        userId: apiKeyRecord.clientName,
        role: 'ExternalSystem',
        endpoint: req.originalUrl,
        method: req.method,
        status: 'success',
        reason: 'Valid API key',
    });

    next();
}

module.exports = apiKeyAuth;
