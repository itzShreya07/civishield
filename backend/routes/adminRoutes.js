const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const rateLimitMiddleware = require('../middleware/rateLimitMiddleware');
const { getAllUsers } = require('../controllers/adminController');

router.use(rateLimitMiddleware);
router.use(authMiddleware);

// GET /admin/users — DepartmentAdmin and SuperAdmin only
router.get('/users', roleMiddleware('view_users'), getAllUsers);

module.exports = router;
