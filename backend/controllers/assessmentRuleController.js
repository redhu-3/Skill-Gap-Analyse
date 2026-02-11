// const AssessmentRule = require("../models/AssessmentRule");

// // Admin: Add or update assessment rule
// exports.addOrUpdateRule = async (req, res) => {
//   try {
//     const { assessment, minPassingPercentage, maxAttempts, numQuestions } = req.body;

//     // Validate input
//     if (!assessment || minPassingPercentage == null || !maxAttempts || !numQuestions) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Check if a rule already exists for this assessment
//     let rule = await AssessmentRule.findOne({ assessment });

//     if (rule) {
//       // Update existing rule
//       rule.minPassingPercentage = minPassingPercentage;
//       rule.maxAttempts = maxAttempts;
//       rule.numQuestions = numQuestions;
//       await rule.save();

//       return res.status(200).json({
//         message: "Assessment rule updated successfully",
//         rule,
//       });
//     }

//     // Create new rule
//     rule = new AssessmentRule({
//       assessment,
//       minPassingPercentage,
//       maxAttempts,
//       numQuestions,
//       createdBy: req.user.id,
//     });

//     await rule.save();

//     res.status(201).json({
//       message: "Assessment rule created successfully",
//       rule,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Error creating or updating assessment rule",
//       error: error.message,
//     });
//   }
// };



// // Admin: Add or update assessment rule for a skill
// // exports.addOrUpdateRule = async (req, res) => {
// //   try {
// //     const { skill, minPassingPercentage, maxAttempts, numQuestions } = req.body;

// //     if (!skill || minPassingPercentage == null || !maxAttempts || !numQuestions) {
// //       return res.status(400).json({ message: "All fields are required" });
// //     }

// //     // Check if a rule already exists for this skill
// //     let rule = await AssessmentRule.findOne({ skill });

// //     if (rule) {
// //       // Update existing rule
// //       rule.minPassingPercentage = minPassingPercentage;
// //       rule.maxAttempts = maxAttempts;
// //       rule.numQuestions = numQuestions;
// //       await rule.save();
// //       return res.status(200).json({ message: "Assessment rule updated", rule });
// //     }

// //     // Create new rule
// //     rule = new AssessmentRule({
// //       skill,
// //       minPassingPercentage,
// //       maxAttempts,
// //       numQuestions,
// //       createdBy: req.user.id,
// //     });

// //     await rule.save();

// //     res.status(201).json({ message: "Assessment rule created", rule });
// //   } catch (error) {
// //     res.status(500).json({ message: "Error creating/updating rule", error: error.message });
// //   }
// // };
const AssessmentRule = require("../models/AssessmentRule");
const mongoose = require("mongoose");

exports.addOrUpdateRule = async (req, res) => {
  try {
    const { assessment, minPassingPercentage, maxAttempts, numQuestions } = req.body;

    if (
      !assessment ||
      minPassingPercentage == null ||
      maxAttempts == null ||
      numQuestions == null
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(assessment)) {
      return res.status(400).json({ message: "Invalid assessment ID" });
    }

    let rule = await AssessmentRule.findOne({ assessment });

    if (rule) {
      rule.minPassingPercentage = minPassingPercentage;
      rule.maxAttempts = maxAttempts;
      rule.numQuestions = numQuestions;
      await rule.save();

      return res.status(200).json({
        message: "Assessment rule updated successfully",
        rule,
      });
    }

    rule = new AssessmentRule({
      assessment,
      minPassingPercentage,
      maxAttempts,
      numQuestions,
      createdBy: req.user.id,
    });

    await rule.save();

    res.status(201).json({
      message: "Assessment rule created successfully",
      rule,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error creating or updating assessment rule",
      error: error.message,
    });
  }
};
