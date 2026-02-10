const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Skill category is required"],
      trim: true,
    },
    
    // requiredProficiency: {
    //   type: Number,
    //   required: [true, "Required proficiency is required"],
    //   min: 0,
    //   max: 100,
    // },
    jobRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobRole",
      required: [true, "Job Role reference is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Skill", skillSchema);
