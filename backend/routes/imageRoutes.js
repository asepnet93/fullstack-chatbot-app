import express from "express";
import { generateFromImage, analyzeImage } from "../controllers/imageController.js";
import { uploadImage } from "../middleware/upload.js";

const router = express.Router();

router.post("/generate-from-image", uploadImage, generateFromImage);
router.post("/analyze-image", uploadImage, analyzeImage);

export default router;