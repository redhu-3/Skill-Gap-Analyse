const express = require("express");
const router = express.Router();

const { getUserRoadmap } = require("../controllers/roadmapController");
const { protect, verifyRole } = require("../middleware/authMiddleware");

router.get(
  "/:jobRoleId",
  protect,
  verifyRole("user"),
  getUserRoadmap
);

module.exports = router;
