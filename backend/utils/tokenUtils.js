/**
 * CiviShield – JWT Token Utilities
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'civishield_jwt_secret_dev_key';
const JWT_EXPIRES_IN = '24h';

function generateToken(user) {
    const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        zone: user.zone,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = { generateToken, verifyToken };
