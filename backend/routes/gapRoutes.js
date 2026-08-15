const express = require("express");
const router = express.Router();

const {
  getSelfGapAnalysis,
  getUserGapAnalysis,
  getAdminGapStats
} = require("../controllers/gapController");

const { protect, verifyRole } = require("../middleware/authMiddleware");

// ---- USER ENDPOINTS ----
// Fetch self gap analysis and readiness score for active role
router.get("/self", protect, getSelfGapAnalysis);

// ---- ADMIN ENDPOINTS ----
// Fetch specific user's gap analysis details
router.get("/admin/users/:userId", protect, verifyRole("admin"), getUserGapAnalysis);

// Fetch top gaps aggregation statistics across all users
router.get("/admin/stats", protect, verifyRole("admin"), getAdminGapStats);

module.exports = router;
