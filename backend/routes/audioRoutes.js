import express from "express";
import { generateFromAudio } from "../controllers/audioController.js";
import { uploadAudio } from "../middleware/upload.js";

const router = express.Router();

router.post("/generate-from-audio", uploadAudio, generateFromAudio);

export default router;