const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/diagnosticController");
const { protect, verifyRoles } = require("../middleware/authMiddleware");

// All routes require user auth
router.use(protect);
router.use(verifyRoles(["user", "viewer"]));

router.get("/test", ctrl.getTest);
router.post("/submit", ctrl.submitTest);
router.get("/results", ctrl.getResults);

module.exports = router;
