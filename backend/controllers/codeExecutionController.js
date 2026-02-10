const axios = require("axios");

exports.runCode = async (req, res) => {
  try {
    const { language, version, code, stdin } = req.body;

    const response = await axios.post(
      "https://emkc.org/api/v2/piston/execute",
      {
        language,
        version,
        files: [
          {
            name: "main",
            content: code,
          },
        ],
        stdin: stdin || "",
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Code execution failed",
      error: error.message,
    });
  }
};
