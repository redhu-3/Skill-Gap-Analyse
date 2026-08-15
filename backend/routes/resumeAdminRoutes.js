const express = require("express");
const router = express.Router();
const configCtrl = require("../controllers/resumeConfigController");
const mappingCtrl = require("../controllers/resumeMappingController");
const analyticsCtrl = require("../controllers/resumeAnalyticsController");
const { protect, verifyRole } = require("../middleware/authMiddleware");

const adminOnly = [protect, verifyRole("admin")];

// Configuration Routes
router.get("/config", ...adminOnly, configCtrl.getConfig);
router.post("/config", ...adminOnly, configCtrl.updateConfig);

// Skill Aliases CRUD
router.get("/aliases", ...adminOnly, mappingCtrl.getAliases);
router.post("/aliases", ...adminOnly, mappingCtrl.createAlias);
router.put("/aliases/:id", ...adminOnly, mappingCtrl.updateAlias);
router.delete("/aliases/:id", ...adminOnly, mappingCtrl.deleteAlias);

// Keyword Mappings CRUD
router.get("/keywords", ...adminOnly, mappingCtrl.getKeywords);
router.post("/keywords", ...adminOnly, mappingCtrl.createKeyword);
router.put("/keywords/:id", ...adminOnly, mappingCtrl.updateKeyword);
router.delete("/keywords/:id", ...adminOnly, mappingCtrl.deleteKeyword);

// Certification Mappings CRUD
router.get("/certifications", ...adminOnly, mappingCtrl.getCertifications);
router.post("/certifications", ...adminOnly, mappingCtrl.createCertification);
router.put("/certifications/:id", ...adminOnly, mappingCtrl.updateCertification);
router.delete("/certifications/:id", ...adminOnly, mappingCtrl.deleteCertification);

// Project Mappings CRUD
router.get("/projects", ...adminOnly, mappingCtrl.getProjects);
router.post("/projects", ...adminOnly, mappingCtrl.createProject);
router.put("/projects/:id", ...adminOnly, mappingCtrl.updateProject);
router.delete("/projects/:id", ...adminOnly, mappingCtrl.deleteProject);

// Experience Mappings CRUD
router.get("/experience", ...adminOnly, mappingCtrl.getExperiences);
router.post("/experience", ...adminOnly, mappingCtrl.createExperience);
router.put("/experience/:id", ...adminOnly, mappingCtrl.updateExperience);
router.delete("/experience/:id", ...adminOnly, mappingCtrl.deleteExperience);

// Analytics
router.get("/analytics", ...adminOnly, analyticsCtrl.getAnalytics);

module.exports = router;
