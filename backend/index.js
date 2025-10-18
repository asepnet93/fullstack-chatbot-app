import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

// Import routes
import textRoutes from "./routes/textRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import audioRoutes from "./routes/audioRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Terlalu banyak request, coba lagi dalam 15 menit."
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(limiter);

// Routes
app.use("/api", textRoutes);
app.use("/api", imageRoutes);
app.use("/api", documentRoutes);
app.use("/api", audioRoutes);
app.use("/api", chatRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "AI Chatbot API is running!",
    version: "1.0.0"
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan."
  });
});

app.listen(3000, () => console.log("🚀 Server is running di http://localhost:3000"));