// backend/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { getDemandStats, getImportanceStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Any authenticated user can view analytics
router.get('/demand',     protect, getDemandStats);
router.get('/importance', protect, getImportanceStats);

module.exports = router;
