
const mongoose = require("mongoose");

const userRoleEnrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    jobRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRole",
      required: true,
    },

    roleVersion: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Prevent duplicate enrollment for same role
userRoleEnrollmentSchema.index(
  { user: 1, jobRole: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "UserRoleEnrollment",
  userRoleEnrollmentSchema
);
