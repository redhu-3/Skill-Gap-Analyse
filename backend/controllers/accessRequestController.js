const AccessRequest = require("../models/AccessRequest");
const JobRole = require("../models/JobRole");
const Admin = require("../models/Admin");
const emailService = require("../utils/emailService");

exports.requestAccess = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { jobRoleId, message } = req.body;

    const jobRole = await JobRole.findById(jobRoleId).populate("createdBy", "name email");
    if (!jobRole) return res.status(404).json({ message: "Job Role not found" });

    const owner = jobRole.createdBy;
    if (!owner) {
      return res.status(400).json({ message: "This Job Role has no owner assigned." });
    }
    
    if (owner._id.toString() === requesterId) {
      return res.status(400).json({ message: "You are the owner of this Job Role." });
    }

    // Check for duplicate pending requests
    const existingPending = await AccessRequest.findOne({
      requesterId,
      jobRoleId,
      status: "Pending"
    });
    if (existingPending) {
      return res.status(400).json({ message: "You already have a Pending request for this Job Role." });
    }

    // Create the request
    const accessRequest = new AccessRequest({
      requesterId,
      ownerId: owner._id,
      jobRoleId,
      message
    });
    await accessRequest.save();

    // Send email to owner
    const requester = await Admin.findById(requesterId);
    try {
      await emailService.sendAccessRequestEmail(owner.email, requester, jobRole.name, message);
    } catch (emailErr) {
      console.error("Failed to send access request email:", emailErr);
      // We don't fail the API request if email fails, but log it
    }

    res.status(201).json({ message: "Access request created and pending approval." });
  } catch (error) {
    console.error("Error creating access request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getIncomingRequests = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const requests = await AccessRequest.find({ ownerId })
      .populate("requesterId", "name email")
      .populate("jobRoleId", "name")
      .sort({ requestedAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getOutgoingRequests = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const requests = await AccessRequest.find({ requesterId })
      .populate("ownerId", "name email")
      .populate("jobRoleId", "name")
      .sort({ requestedAt: -1 });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;
    const { durationMs } = req.body; // Duration in milliseconds

    if (!durationMs || durationMs <= 0) {
      return res.status(400).json({ message: "Valid durationMs is required." });
    }

    const request = await AccessRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.ownerId.toString() !== ownerId) {
      return res.status(403).json({ message: "Forbidden: You are not the owner of this request." });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Request is no longer Pending." });
    }

    const now = new Date();
    request.status = "Approved";
    request.respondedAt = now;
    request.accessGrantedAt = now;
    request.accessExpiresAt = new Date(now.getTime() + durationMs);
    
    await request.save();

    // Send email to requester
    try {
      const requester = await Admin.findById(request.requesterId);
      const owner = await Admin.findById(ownerId);
      const jobRole = await JobRole.findById(request.jobRoleId);
      
      const durationHours = Math.round(durationMs / 3600000);
      const durationText = durationHours > 0 ? `${durationHours} hours` : "Temporary";
      
      await emailService.sendAccessApprovedEmail(requester.email, owner, jobRole.name, request.accessExpiresAt, durationText);
    } catch (emailErr) {
      console.error("Failed to send access approved email:", emailErr);
    }

    res.json({ message: "Request approved successfully", request });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.declineRequest = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { id } = req.params;

    const request = await AccessRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.ownerId.toString() !== ownerId) {
      return res.status(403).json({ message: "Forbidden: You are not the owner of this request." });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Request is no longer Pending." });
    }

    request.status = "Declined";
    request.respondedAt = new Date();
    
    await request.save();

    // Send email to requester
    try {
      const requester = await Admin.findById(request.requesterId);
      const owner = await Admin.findById(ownerId);
      const jobRole = await JobRole.findById(request.jobRoleId);
      
      await emailService.sendAccessDeclinedEmail(requester.email, owner, jobRole.name);
    } catch (emailErr) {
      console.error("Failed to send access declined email:", emailErr);
    }

    res.json({ message: "Request declined successfully", request });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
