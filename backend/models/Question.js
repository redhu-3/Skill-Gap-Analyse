// const mongoose = require("mongoose");
// const testCaseSchema = new mongoose.Schema({
//   input: { type: String, required: true },
//   expectedOutput: { type: String, required: true },
//   isHidden: { type: Boolean, default: false },
// });

// const questionSchema = new mongoose.Schema(
//   {
//     skill: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Skill",
//       required: [true, "Associated skill is required"],
//     },
//     type: {
//       type: String,
//       enum: ["mcq", "coding", "output","fill-blank"],
//       required: [true, "Question type is required"],
//     },
//     difficulty: {
//       type: String,
//       enum: ["easy", "medium", "hard"],
//       default: "medium",
//     },
//     questionText: {
//       type: String,
//       required: [true, "Question text is required"],
//     },
//     options: [
//       {
//         type: String, // Only for MCQs
//       },
//     ],

//     testCases: [
//   {
//     input: {
//       type: String,
//     },
//     expectedOutput: {
//       type: String,
//     },
//     isHidden: {
//       type: Boolean,
//       default: false,
//     },
//   },
// ],

//    correctAnswer: {
//   type: mongoose.Schema.Types.Mixed,
//   required: function () {
//     return this.type !== "coding";
//   },
// },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Admin",
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["active", "inactive"],
//       default: "active",
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Question", questionSchema);

const mongoose = require("mongoose");

// Schema for coding test cases
const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
});

// Main Question Schema
const questionSchema = new mongoose.Schema(
  {
    // Either skill or assessment must exist
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: function () {
        // Skill is required if not part of an assessment
        return !this.assessment;
      },
    },

    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      default: null,
      validate: {
        validator: function (v) {
          // Either skill or assessment must exist
          return this.skill || v;
        },
        message: "Question must belong to a skill or an assessment",
      },
    },

    type: {
      type: String,
      enum: ["mcq", "coding", "fill-blank"],
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    questionText: {
      type: String,
      required: true,
    },

    // MCQ specific
    options: [String],
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: function () {
        return this.type !== "coding";
      },
    },

    // Coding specific
    language: String,
    testCases: [testCaseSchema],

    // Optional timer for each question
    timer: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Indexes for faster lookups
questionSchema.index({ skill: 1 });
questionSchema.index({ assessment: 1 });

module.exports = mongoose.model("Question", questionSchema);
