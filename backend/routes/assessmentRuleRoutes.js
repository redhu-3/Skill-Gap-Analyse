const express = require("express");
const router = express.Router();
const { addOrUpdateRule } = require("../controllers/assessmentRuleController");
const { protect, verifyRole } = require("../middleware/authMiddleware");

// Admin: Add or update assessment rule
router.post("/", protect, verifyRole("admin"), addOrUpdateRule);

module.exports = router;
