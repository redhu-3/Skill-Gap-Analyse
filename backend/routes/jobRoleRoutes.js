const express = require("express");
const router = express.Router();

const {
  createJobRole,
  getAllJobRoles,
  updateJobRole,
  getPublishedJobRoles,
  publishJobRole,
  duplicateJobRoleVersion,
  getRoleTemplates,
  createRoleTemplate,
  deleteJobRole
} = require("../controllers/jobRoleController");
const { protect, verifyRoles } = require("../middleware/authMiddleware");

// ---- TEMPLATES ----
// Get all dynamic role templates (admin & user)
router.get("/templates", protect, getRoleTemplates);

// Admin: Create a new role template
router.post("/templates", protect, verifyRoles(["admin"]), createRoleTemplate);

// ---- JOB ROLES ----
// Admin/Manager: Create new job role (supports templateId for preset seeding)
router.post("/create", protect, verifyRoles(["admin"]), createJobRole);

// Get all job roles (all backend admin users)
router.get("/", protect, verifyRoles(["admin", "manager", "contributor", "viewer", "user"]), getAllJobRoles);

// Admin/Manager: Update a draft job role
router.put("/:id", protect, verifyRoles(["admin", "manager"]), updateJobRole);

// Public: Get published job roles
router.get("/published", getPublishedJobRoles);

// Admin: Publish a job role (validates weightage constraints)
router.patch("/:id/publish", protect, verifyRoles(["admin"]), publishJobRole);

// Admin: Clone a published role into a new draft version
router.post("/:id/new-version", protect, verifyRoles(["admin"]), duplicateJobRoleVersion);

// Admin: Delete a job role
router.delete("/:id", protect, verifyRoles(["admin"]), deleteJobRole);

module.exports = router;