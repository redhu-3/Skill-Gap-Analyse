const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/readinessAdminController");
const { protect, verifyRole } = require("../middleware/authMiddleware");

const adminOnly = [protect, verifyRole("admin")];

router.get("/config",    ...adminOnly, ctrl.getConfig);
router.post("/config",   ...adminOnly, ctrl.updateConfig);
router.get("/analytics", ...adminOnly, ctrl.getReadinessAnalytics);

module.exports = router;
