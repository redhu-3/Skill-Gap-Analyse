const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },

    name: {
      type: String,
      required: true, // e.g. "Level 1", "Beginner"
    },

    level: {
      type: Number,
      required: true, // 1, 2, 3...
    },
   questions: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    validate: {
      validator: function(arr) {
        return arr.length >= this.randomPick;
      },
      message: 'Questions array must have at least randomPick number of questions'
    }
  }
],

    totalQuestions: {
      type: Number,
      required: true,
    },

    randomPick: {
      type: Number,
      required: true, // how many to show to user
    },

    timer: {
      type: Number, // seconds
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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "inactive"],
      default: "draft",
    },
  },
  { timestamps: true }
);
assessmentSchema.index({ skill: 1, level: 1 }, { unique: true });
module.exports = mongoose.model("Assessment", assessmentSchema);
