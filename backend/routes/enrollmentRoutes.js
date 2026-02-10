const express = require("express");
const router = express.Router();

const { enrollInJobRole } = require("../controllers/enrollmentController");
const { protect } = require("../middleware/authMiddleware");

router.post(
  "/enroll/:jobRoleId",
  protect,
  enrollInJobRole
);

module.exports = router;
