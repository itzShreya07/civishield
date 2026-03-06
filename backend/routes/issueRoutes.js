const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const zoneMiddleware = require('../middleware/zoneMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const { auditResponseMiddleware } = require('../services/logService');
const { getAllIssues, createIssue, updateIssueStatus } = require('../controllers/issueController');

// All issue routes require authentication + rate limiting
router.use(rateLimitMiddleware);
router.use(authMiddleware);
router.use(auditResponseMiddleware);

// GET /issues — Citizens see own, officers see zone, admins see all
router.get('/', getAllIssues);

// POST /issues — Citizens and above can create
router.post('/', roleMiddleware('create_issue'), createIssue);

// PATCH /issues/:id/status — Field Officers (zone-checked), Admins
router.patch('/:id/status', zoneMiddleware, updateIssueStatus);

module.exports = router;
