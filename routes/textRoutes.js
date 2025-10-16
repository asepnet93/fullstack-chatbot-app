import express from "express";
import { generateText } from "../controllers/textController.js";

const router = express.Router();

router.post("/generate-text", generateText);

export default router;