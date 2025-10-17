import genAI from "../config/gemini.js";
import fs from "fs";

export const generateFromAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File audio tidak ditemukan.",
      });
    }

    const { prompt } = req.body;
    const defaultPrompt = "Transkripsikan dan analisis audio ini.";

    const audioBuffer = fs.readFileSync(req.file.path);
    const audioBase64 = audioBuffer.toString("base64");

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt || defaultPrompt },
            {
              inlineData: {
                data: audioBase64,
                mimeType: req.file.mimetype,
              },
            },
          ],
        },
      ],
    });

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      response: response.text,
    });
  } catch (error) {
    console.error("Error pada generateFromAudio:", error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menganalisis audio.",
    });
  }
};