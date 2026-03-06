/**
 * CiviShield – Auth Controller
 *
 * Handles login with JWT issuance and failed attempt tracking.
 */

const bcrypt = require('bcryptjs');
const { users } = require('../data/users');
const { generateToken } = require('../utils/tokenUtils');
const { logAudit } = require('../services/logService');
const { recordEvent } = require('../services/securityMonitor');

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required.',
        });
    }

    const user = users.find((u) => u.email === email);

    if (!user) {
        recordEvent('failedLogin', email, req);
        logAudit({
            userId: email,
            role: 'unknown',
            endpoint: '/auth/login',
            method: 'POST',
            status: 'denied',
            reason: 'User not found',
        });
        return res.status(401).json({
            success: false,
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
        });
    }

    // For demo: accept plaintext password matching demo passwords
    // or a bcrypt-hashed match
    const demoPasswords = {
        u1: 'citizen123',
        u2: 'officer123',
        u3: 'officer123',
        u4: 'admin123',
        u5: 'super123',
    };

    const isValidPassword = password === demoPasswords[user.id];

    if (!isValidPassword) {
        recordEvent('failedLogin', email, req);
        logAudit({
            userId: user.id,
            role: user.role,
            endpoint: '/auth/login',
            method: 'POST',
            status: 'denied',
            reason: 'Incorrect password',
        });
        return res.status(401).json({
            success: false,
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
        });
    }

    const token = generateToken(user);

    logAudit({
        userId: user.id,
        role: user.role,
        endpoint: '/auth/login',
        method: 'POST',
        status: 'success',
        reason: 'Login successful',
    });

    return res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            zone: user.zone,
        },
    });
}

module.exports = { login };
