const express = require("express");
const router = express.Router();

const { createJobRole,getAllJobRoles,updateJobRole,getPublishedJobRoles,publishJobRole} = require("../controllers/jobRoleController");
const { protect, verifyRole } = require("../middleware/authMiddleware");

// Admin: Add new job role
router.post(
  "/create",
  protect,
  verifyRole("admin"),
  createJobRole
);

router.get(
  "/",
  protect,
  verifyRole("admin"),
  getAllJobRoles
);
router.put(
  "/:id",
  protect,
  verifyRole("admin"),
  updateJobRole
);

// Public: Get published job roles
router.get("/published", getPublishedJobRoles);

router.patch(
  "/:id/publish",
  protect,
  verifyRole("admin"),
  publishJobRole
);

module.exports = router;