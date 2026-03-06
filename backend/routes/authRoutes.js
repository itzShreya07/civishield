const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');

// POST /auth/login
router.post('/login', rateLimitMiddleware, login);

module.exports = router;
