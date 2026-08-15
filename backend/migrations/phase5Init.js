const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const ReadinessConfig = require("../models/ReadinessConfig");

async function seed() {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected.");

    // Remove existing if any
    await ReadinessConfig.deleteMany({});

    // Create fresh default config
    await ReadinessConfig.create({
      formulas: {
        assessmentWeight: 0.7,
        skillCompletionWeight: 0.3,
        mandatorySkillPenalty: 0.25
      },
      gapRules: [
        { label: "Critical Gap", minThreshold: 0, maxThreshold: 40, color: "#ef4444", priority: "high" }, // Red
        { label: "Moderate Gap", minThreshold: 41, maxThreshold: 70, color: "#f59e0b", priority: "medium" }, // Amber
        { label: "Strong Skill", minThreshold: 71, maxThreshold: 100, color: "#10b981", priority: "low" } // Emerald
      ],
      industryLevels: [
        { label: "Beginner", minThreshold: 0, maxThreshold: 40, color: "#ef4444" },
        { label: "Intermediate", minThreshold: 41, maxThreshold: 70, color: "#f59e0b" },
        { label: "Industry Ready", minThreshold: 71, maxThreshold: 90, color: "#3b82f6" }, // Blue
        { label: "Expert", minThreshold: 91, maxThreshold: 100, color: "#10b981" }
      ],
      benchmarks: {
        defaultBenchmarkScore: 80,
        allowRoleOverrides: true
      },
      recommendationRules: [
        { triggerMetric: "score", thresholdOperator: "lt", thresholdValue: 60, recommendationType: "learning_path" },
        { triggerMetric: "score", thresholdOperator: "lt", thresholdValue: 70, recommendationType: "projects" },
        { triggerMetric: "score", thresholdOperator: "lt", thresholdValue: 80, recommendationType: "interview_prep" }
      ]
    });

    console.log("Default Readiness Configuration seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

seed();
