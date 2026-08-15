const JobRole = require("../models/JobRole");
const AccessRequest = require("../models/AccessRequest");

/**
 * Checks if the given user (Admin) has modification access to the specified Job Role.
 * Access is granted if:
 * 1. The Admin is the owner (createdBy) of the Job Role.
 * 2. The Admin has an Approved AccessRequest for the Job Role, and it hasn't expired.
 * 
 * @param {String} userId - The ID of the requester.
 * @param {String} jobRoleId - The ID of the Job Role to check access for.
 * @returns {Promise<Boolean>} - true if authorized, false otherwise.
 */
exports.canModifyJobRole = async (userId, jobRoleId) => {
  try {
    const jobRole = await JobRole.findById(jobRoleId);
    if (!jobRole) return false;

    // 1. Is the user the owner?
    const ownerId = typeof jobRole.createdBy === "object" ? jobRole.createdBy._id.toString() : jobRole.createdBy.toString();
    if (ownerId === userId.toString()) {
      return true;
    }

    // 2. Does the user have active temporary access?
    const activeRequest = await AccessRequest.findOne({
      requesterId: userId,
      jobRoleId: jobRoleId,
      status: "Approved",
      accessExpiresAt: { $gt: new Date() } // Must not be expired
    });

    if (activeRequest) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error in canModifyJobRole:", error);
    return false; // Fail safe
  }
};
