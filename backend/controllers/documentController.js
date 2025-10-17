import genAI from "../config/gemini.js";
import fs from "fs";

export const generateFromDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File dokumen tidak ditemukan.",
      });
    }

    const { prompt } = req.body;
    const defaultPrompt = "Analisis isi dokumen ini.";

    // Untuk dokumen, kita baca sebagai text dulu
    const documentBuffer = fs.readFileSync(req.file.path);
    const documentText = documentBuffer.toString('utf-8');

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: [
        {
          role: 'user',
          parts: [
            { 
              text: `${prompt || defaultPrompt}\n\nIsi dokumen:\n${documentText.substring(0, 10000)}` // Limit karakter
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
    console.error("Error pada generateFromDocument:", error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menganalisis dokumen.",
    });
  }
};