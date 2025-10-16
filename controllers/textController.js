import genAI from "../config/gemini.js";

export const generateText = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt tidak boleh kosong.",
      });
    }

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: prompt,
    });

    res.json({
      success: true,
      response: response.text,
    });
  } catch (error) {
    console.error("Error pada generateText:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};