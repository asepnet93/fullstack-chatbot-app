import express from "express";
import { generateFromDocument } from "../controllers/documentController.js";
import { uploadDocument } from "../middleware/upload.js";

const router = express.Router();

router.post("/generate-from-document", uploadDocument, generateFromDocument);

export default router;