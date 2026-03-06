/**
 * CiviShield – Rate Limiting Middleware
 *
 * Limits each user/IP to 50 requests per minute.
 * Uses in-memory counters (no Redis dependency for MVP).
 */

const RATE_LIMIT = 50; // max requests
const WINDOW_MS = 60 * 1000; // 1 minute window

// Map: key → { count, resetAt }
const requestCounts = new Map();

function getRateLimitKey(req) {
    // Use user ID if authenticated, else fall back to IP
    return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
}

function rateLimitMiddleware(req, res, next) {
    const key = getRateLimitKey(req);
    const now = Date.now();

    if (!requestCounts.has(key)) {
        requestCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return next();
    }

    const record = requestCounts.get(key);

    // Window expired — reset counter
    if (now > record.resetAt) {
        requestCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
        return next();
    }

    // Increment count
    record.count += 1;

    if (record.count > RATE_LIMIT) {
        const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);

        res.set('Retry-After', retryAfterSec);
        res.set('X-RateLimit-Limit', RATE_LIMIT);
        res.set('X-RateLimit-Remaining', 0);
        res.set('X-RateLimit-Reset', new Date(record.resetAt).toISOString());

        return res.status(429).json({
            success: false,
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many requests. Limit: ${RATE_LIMIT} per minute. Retry after ${retryAfterSec}s.`,
            retryAfter: retryAfterSec,
        });
    }

    // Set informational headers
    res.set('X-RateLimit-Limit', RATE_LIMIT);
    res.set('X-RateLimit-Remaining', RATE_LIMIT - record.count);
    res.set('X-RateLimit-Reset', new Date(record.resetAt).toISOString());

    next();
}

module.exports = rateLimitMiddleware;
