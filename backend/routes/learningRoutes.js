const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/learningController");
const { protect } = require("../middleware/authMiddleware");

router.post("/generate/:roleId",               protect, ctrl.generatePath);
router.get("/active/:roleId",                  protect, ctrl.getActivePath);
router.patch("/status/:roleId/skill/:skillId", protect, ctrl.updateStepStatus);

module.exports = router;
