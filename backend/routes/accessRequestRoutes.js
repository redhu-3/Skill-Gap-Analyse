const express = require("express");
const router = express.Router();
const { protect, verifyRole } = require("../middleware/authMiddleware");
const accessRequestController = require("../controllers/accessRequestController");

// All access request endpoints require authentication and admin role
router.use(protect, verifyRole("admin"));
router.post("/", accessRequestController.requestAccess);

// Get incoming/outgoing requests
router.get("/incoming", accessRequestController.getIncomingRequests);
router.get("/outgoing", accessRequestController.getOutgoingRequests);

// Respond to requests
router.put("/:id/approve", accessRequestController.approveRequest);
router.put("/:id/decline", accessRequestController.declineRequest);

module.exports = router;
