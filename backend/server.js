/**
 * CiviShield – Backend Server Entry Point
 *
 * Plug & Play Security Gateway for Smart City Infrastructure.
 * All security middleware is attached here as composable layers.
 *
 * Architecture:
 *   Client → Rate Limiter → Auth → RBAC → Zone Check → Business Logic
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const adminRoutes = require('./routes/adminRoutes');
const auditRoutes = require('./routes/auditRoutes');
const externalRoutes = require('./routes/externalRoutes');

const { logAudit } = require('./services/logService');
const { createAlert } = require('./services/securityMonitor');

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Global Middleware ──────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── CiviShield Gateway Info Header ────────────────────────────────────────
app.use((req, res, next) => {
    res.set('X-Powered-By', 'CiviShield Security Gateway');
    res.set('X-Shield-Version', '1.0.0');
    next();
});

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'operational',
        service: 'CiviShield Security Gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/issues', issueRoutes);
app.use('/admin', adminRoutes);
app.use('/audit', auditRoutes);
app.use('/external', externalRoutes);

// ─── Demo: Seed a test alert on startup ─────────────────────────────────────
setTimeout(() => {
    createAlert({
        type: 'FAILED_LOGIN_THRESHOLD',
        severity: 'high',
        message: 'Demo alert: 3 failed login attempts detected from IP 192.168.1.45 at system startup.',
        identifier: '192.168.1.45',
        endpoint: '/auth/login',
    });
    logAudit({
        userId: 'system',
        role: 'system',
        endpoint: '/system/startup',
        method: 'SYSTEM',
        status: 'success',
        reason: 'CiviShield Security Gateway started',
    });
}, 500);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.originalUrl} not found.`,
    });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[CiviShield ERROR]', err.stack);
    res.status(500).json({
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred.',
    });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════╗
  ║        CiviShield Security Gateway            ║
  ║        Version 1.0.0  |  Port ${PORT}            ║
  ║        Status: OPERATIONAL                    ║
  ╚═══════════════════════════════════════════════╝
  `);
    console.log(`[CiviShield] Server running at http://localhost:${PORT}`);
    console.log(`[CiviShield] Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
