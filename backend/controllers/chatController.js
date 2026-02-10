const { OpenAI } = require("openai");

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1", // Hugging Face Router
  apiKey: process.env.HF_TOKEN,
});

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.status(400).json({ message: "Message is required" });

    const response = await client.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3.2:novita", // or any other conversational model
      messages: [{ role: "user", content: message }],
    });

    const aiMessage = response.choices[0].message.content;

    res.status(200).json({ reply: aiMessage });
  } catch (error) {
    console.error("Chat AI error:", error.message);
    res.status(500).json({ message: "Chat AI failed" });
  }
};
