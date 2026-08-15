const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/readinessController");
const { protect } = require("../middleware/authMiddleware");

router.get("/user/:userId/role/:roleId", protect, ctrl.getUserReadinessDetails);
router.get("/matches",                  protect, ctrl.getUserRoleMatches);

module.exports = router;
