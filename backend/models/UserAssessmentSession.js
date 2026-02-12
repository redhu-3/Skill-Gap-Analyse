const mongoose = require("mongoose");

const userAssessmentSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assessment: { type: mongoose.Schema.Types.ObjectId, ref: "Assessment", required: true },
  startTime: { type: Date, required: true },
  submitted: { type: Boolean, default: false },
});

module.exports = mongoose.model("UserAssessmentSession", userAssessmentSessionSchema);
