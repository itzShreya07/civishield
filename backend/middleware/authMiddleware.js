/**
 * CiviShield – JWT Auth Middleware
 *
 * Verifies Bearer tokens on every protected request.
 * Attaches decoded user payload to req.user.
 */

const jwt = require('jsonwebtoken');
const { logAudit } = require('../services/logService');
const { recordEvent } = require('../services/securityMonitor');

const JWT_SECRET = process.env.JWT_SECRET || 'civishield_jwt_secret_dev_key';

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logAudit({
            userId: 'anonymous',
            role: 'unknown',
            endpoint: req.originalUrl,
            method: req.method,
            status: 'denied',
            reason: 'Missing or malformed Authorization header',
        });
        return res.status(401).json({
            success: false,
            code: 'UNAUTHORIZED',
            message: 'Authorization token required.',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        const userId = 'unknown';
        recordEvent('failedLogin', userId, req);

        logAudit({
            userId,
            role: 'unknown',
            endpoint: req.originalUrl,
            method: req.method,
            status: 'denied',
            reason: 'Invalid or expired JWT token',
        });

        return res.status(401).json({
            success: false,
            code: 'TOKEN_INVALID',
            message: 'Token is invalid or has expired.',
        });
    }
}

module.exports = authMiddleware;
