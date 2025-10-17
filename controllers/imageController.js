import genAI from "../config/gemini.js";

export const generateFromImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File gambar tidak ditemukan.",
      });
    }

    const { prompt } = req.body;
    const defaultPrompt = "Analisis gambar ini secara detail.";

    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString("base64");

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt || defaultPrompt },
            {
              inlineData: {
                data: imageBase64,
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
    console.error("Error pada generateFromImage:", error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menganalisis gambar.",
    });
  }
};

export const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File gambar tidak ditemukan.",
      });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const imageBase64 = imageBuffer.toString("base64");

    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Apa isi gambar ini? Analisis dan jelaskan secara detail." },
            {
              inlineData: {
                data: imageBase64,
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
    console.error("Error pada analyzeImage:", error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menganalisis gambar.",
    });
  }
};