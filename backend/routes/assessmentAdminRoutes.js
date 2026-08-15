const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/assessmentAdminController");
const { protect, verifyRole } = require("../middleware/authMiddleware");

// Admin Only endpoints
const adminOnly = [protect, verifyRole("admin")];

router.get("/skill/:skillId",          ...adminOnly, ctrl.getAssessmentsBySkill);
router.post("/blueprints",             ...adminOnly, ctrl.createOrUpdateBlueprint);
router.get("/versions",                ...adminOnly, ctrl.getBlueprintVersions);
router.get("/versions/:id/compare",    ...adminOnly, ctrl.compareVersions);
router.put("/versions/:id/publish",    ...adminOnly, ctrl.publishAssessmentVersion);
router.patch("/versions/:id/transition", ...adminOnly, ctrl.transitionVersion);
router.get("/analytics/:id",            ...adminOnly, ctrl.getAssessmentAnalytics);
router.post("/recommend-blueprint",    ...adminOnly, ctrl.aiRecommendBlueprint);

module.exports = router;
