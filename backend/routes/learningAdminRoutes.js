const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/learningAdminController");
const { protect, verifyRole } = require("../middleware/authMiddleware");

const adminOnly = [protect, verifyRole("admin")];

router.get("/templates",             ...adminOnly, ctrl.listTemplates);
router.post("/templates",            ...adminOnly, ctrl.createOrUpdateTemplate);
router.get("/resources",             ...adminOnly, ctrl.listResources);
router.post("/resources",            ...adminOnly, ctrl.createOrUpdateResource);
router.delete("/resources/:id",      ...adminOnly, ctrl.deleteResource);
router.get("/analytics",             ...adminOnly, ctrl.getLearningAnalytics);
router.post("/ai-recommend",         ...adminOnly, ctrl.aiRecommendRoadmap);

module.exports = router;
