const express = require("express");
const router = express.Router();

const {
  getAdminProfile,
  updateAdminProfile,
} = require("../controllers/adminProfileController");

const { protect, verifyRole } = require("../middleware/authMiddleware");

// Admin profile routes
router.get("/profile", protect, verifyRole("admin"), getAdminProfile);
router.put("/profile", protect, verifyRole("admin"), updateAdminProfile);

module.exports = router;
