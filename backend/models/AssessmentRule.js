// const mongoose = require("mongoose");

// const assessmentRuleSchema = new mongoose.Schema(
//   {
//     skill: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Skill",
//       required: true,
//       unique: true, // one rule per skill
//     },
//     minPassingPercentage: {
//       type: Number,
//       required: true,
//       default: 70,
//     },
//     maxAttempts: {
//       type: Number,
//       required: true,
//       default: 3,
//     },
//     numQuestions: {
//       type: Number,
//       required: true,
//       default: 5,
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Admin",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("AssessmentRule", assessmentRuleSchema);


const mongoose = require("mongoose");

const assessmentRuleSchema = new mongoose.Schema({
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment",
    required: true,
  },
  minPassingPercentage: {
    type: Number,
    required: true,
  },
  maxAttempts: {
    type: Number,
    required: true,
  },
  numQuestions: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
     required: true,
  },
}, { timestamps: true });


// 🔹 Add this index to ensure one rule per assessment
assessmentRuleSchema.index({ assessment: 1 }, { unique: true });
module.exports = mongoose.model("AssessmentRule", assessmentRuleSchema);
