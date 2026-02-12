const Question = require("../models/Question");
const UserQuestionAttempt = require("../models/UserQuestionAttempt");
const axios = require("axios");

const DEFAULT_VERSIONS = {
  javascript: "18.0.0",
  python: "3.10.0",
  java: "15.0.2",
};

exports.runCode = async (req, res) => {
  try {
    const { questionId, code, language } = req.body;

    // ✅ Basic validation
    if (!questionId || !code) {
      return res.status(400).json({
        success: false,
        message: "questionId and code are required",
        testCaseResults: [],
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
        testCaseResults: [],
      });
    }

    const lang = language || question.language || "python";
    const version = DEFAULT_VERSIONS[lang] || "3.10.0";

    const getFileName = () => {
      if (lang === "java") return "Main.java";
      if (lang === "javascript") return "index.js";
      if (lang === "python") return "main.py";
      return "main.txt";
    };

    const normalize = (str) => String(str || "").replace(/\r?\n/g, "").trim();

    const publicTests = question.testCases?.filter((t) => !t.isHidden) || [];
    const hiddenTests = question.testCases?.filter((t) => t.isHidden) || [];

    const publicResults = [];
    let allPublicPassed = true;
    let allHiddenPassed = true;

    // =========================
    // 🔵 RUN PUBLIC TEST CASES
    // =========================
    for (const testCase of publicTests) {
      let pistonRes;

      try {
        pistonRes = await axios.post(
          "https://emkc.org/api/v2/piston/execute",
          {
            language: lang,
            version,
            files: [{ name: getFileName(), content: code }],
            stdin: testCase.input || "",
          },
          {
            timeout: 10000,
            validateStatus: (status) => status >= 200 && status < 500,
          }
        );
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: "Code execution server error",
          error: err.message,
          testCaseResults: publicResults,
          allPublicPassed: false,
          allHiddenPassed: false,
        });
      }

      const stdout = pistonRes.data?.run?.stdout || "";
      const stderr = pistonRes.data?.run?.stderr || "";
      const exitCode = pistonRes.data?.run?.code;

      // 🔴 Compiler/runtime errors
      if (stderr && stderr.trim() !== "") {
        return res.json({
          success: false,
          compilerError: stderr,
          testCaseResults: publicResults,
          allPublicPassed: false,
          allHiddenPassed: false,
        });
      }

      if (exitCode !== 0) {
        return res.json({
          success: false,
          compilerError: stderr || "Execution failed",
          testCaseResults: publicResults,
          allPublicPassed: false,
          allHiddenPassed: false,
        });
      }

      const actualOutput = stdout.trim();
      const expectedOutput = testCase.expectedOutput?.trim() || "";
      const passed = normalize(actualOutput) === normalize(expectedOutput);

      publicResults.push({
        input: testCase.input,
        expectedOutput,
        actualOutput,
        passed,
        isHidden: false,
      });

      if (!passed) allPublicPassed = false;
    }

    // =========================
    // 🟣 RUN HIDDEN TEST CASES
    // =========================
    if (allPublicPassed) {
      for (const testCase of hiddenTests) {
        let pistonRes;

        try {
          pistonRes = await axios.post(
            "https://emkc.org/api/v2/piston/execute",
            {
              language: lang,
              version,
              files: [{ name: getFileName(), content: code }],
              stdin: testCase.input || "",
            },
            {
              timeout: 10000,
              validateStatus: (status) => status >= 200 && status < 500,
            }
          );
        } catch (err) {
          return res.status(500).json({
            success: false,
            message: "Code execution server error",
            error: err.message,
            testCaseResults: publicResults,
            allPublicPassed: true,
            allHiddenPassed: false,
          });
        }

        const stdout = pistonRes.data?.run?.stdout || "";
        const stderr = pistonRes.data?.run?.stderr || "";
        const exitCode = pistonRes.data?.run?.code;

        if (stderr && stderr.trim() !== "") {
          allHiddenPassed = false;
          break;
        }

        if (exitCode !== 0) {
          allHiddenPassed = false;
          break;
        }

        const actualOutput = stdout.trim();
        const expectedOutput = testCase.expectedOutput?.trim() || "";
        const passed = normalize(actualOutput) === normalize(expectedOutput);

        if (!passed) {
          allHiddenPassed = false;
          break;
        }
      }
    } else {
      allHiddenPassed = false;
    }

    // =========================
    // 💾 SAVE USER ATTEMPT
    // =========================
    await UserQuestionAttempt.findOneAndUpdate(
      { user: req.user.id, question: questionId },
      {
        code,
        language: lang,
        allPublicPassed,
        allHiddenPassed,
        isCorrect: allPublicPassed && allHiddenPassed,
        updatedAt: Date.now(),
      },
      { upsert: true }
    );

    // =========================
    // 🟢 FINAL RESPONSE
    // =========================
    return res.json({
      success: true,
      testCaseResults: publicResults,
      allPublicPassed,
      allHiddenPassed,
      message:
        allPublicPassed && allHiddenPassed
          ? "All test cases passed"
          : "Some test cases failed",
    });
  } catch (error) {
    console.error("RUN CODE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Code execution failed",
      error: error.message,
      testCaseResults: [],
    });
  }
};
