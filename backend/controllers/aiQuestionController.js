const { OpenAI } = require("openai");

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1", // HF Router
  apiKey: process.env.HF_TOKEN,
});

exports.generateQuestion = async (req, res) => {
  try {
    const {role, skill, difficulty, type } = req.body;

    if (!skill || !role||!difficulty || !type) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Prompt depending on type
    let prompt = "";

    if (type === "mcq") {
      prompt = `
Generate ONE MCQ question.role:
"${role}"

Skill: ${skill}
Difficulty: ${difficulty}

Rules:
- Provide 4 options
- Respond ONLY with valid JSON
- No explanations

JSON format:
{
  "questionText": "",
  "options": ["", "", "", ""],
  "correctAnswer": ""
}
`;
    } else if (type === "fill-blank") {
      prompt = `
Generate ONE Fill-in-the-Blank question.
role:"${role}"
Skill: ${skill}
Difficulty: ${difficulty}

Rules:
- Respond ONLY with valid JSON
- No explanations

JSON format:
{
  "questionText": "",
  "correctAnswer": ""
}
`;
    } else if (type === "coding") {
      prompt = `
Generate ONE coding question.
role:"${role}"
Skill: ${skill}
Difficulty: ${difficulty}

Rules:
- Provide language, input/output test cases
- Mark if test cases are hidden
- Respond ONLY with valid JSON
- No explanations

JSON format:
{
  "questionText": "",
  "language": "javascript",
  "testCases": [
    { "input": "", "expectedOutput": "", "isHidden": false }
  ]
}
`;
    } else {
      return res.status(400).json({ message: "Invalid question type" });
    }

    // Call Hugging Face via OpenAI-compatible client
    const response = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3.2:novita",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0].message.content;

    // Parse JSON safely
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}") + 1;

    if (start === -1 || end === -1) {
      throw new Error("Invalid AI response");
    }

    const cleanJson = text.slice(start, end);
    const result = JSON.parse(cleanJson);

    res.status(200).json(result);

  } catch (error) {
    console.error("AI generation error:", error.message, error.response?.data);
    res.status(500).json({ message: "AI generation failed" });
  }
};
