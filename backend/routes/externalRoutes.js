const express = require('express');
const router = express.Router();

const apiKeyAuth = require('../middleware/apiKeyAuth');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const { getExternalData } = require('../controllers/externalController');

// External API routes use API key auth (not JWT)
router.use(rateLimitMiddleware);

// GET /external/data — Requires valid x-api-key header
router.get('/data', apiKeyAuth, getExternalData);

module.exports = router;
