const express = require("express");
const router = express.Router();

const { getUserRoadmap } = require("../controllers/roadmapController");
const { protect, verifyRoles } = require("../middleware/authMiddleware"); // ✅ verifyRoles (plural)

router.get(
  "/:jobRoleId",
  protect,
  verifyRoles(["user", "viewer"]), // ✅ accepts both roles
  getUserRoadmap
);

module.exports = router;