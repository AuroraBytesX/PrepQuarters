/*
 * Resume Improvement, Tailoring & Conversational Builder Routes
 * PrepQuarters Engineering Platform
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max server-enforced limit
});
const {
  analyzeResume,
  processResumeBuilderMessage,
  generateCleanLatexFromGraph,
  extractTextFromPdfBuffer,
} = require("../services/ResumeService");
const { cleanDisallowedChars } = require("../services/SanitizationHelper");

async function parseBufferToText(buffer, filename = "", mimetype = "") {
  try {
    const isPdf =
      (mimetype && mimetype.toLowerCase().includes("pdf")) ||
      (filename && filename.toLowerCase().endsWith(".pdf")) ||
      (buffer.length >= 4 && buffer.slice(0, 4).toString() === "%PDF");

    if (isPdf) {
      const pdfText = await extractTextFromPdfBuffer(buffer);
      if (pdfText && pdfText.trim().length >= 15) {
        return pdfText.trim();
      }
    }

    const raw = buffer.toString("utf-8");
    return raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ").trim();
  } catch (e) {
    console.error("Buffer parsing error:", e.message);
    return "";
  }
}

/* =========================================
   ANALYZE RESUME (JSON or Document Upload)
========================================= */
router.post("/analyze", upload.any(), async (req, res) => {
  try {
    const uploadedFile = req.file || (Array.isArray(req.files) && req.files.length > 0 ? req.files[0] : null);
    let resumeContent = req.body.resumeText || "";
    const jobDescription = req.body.jobDescription || "";
    const targetRole = req.body.targetRole || "Software Engineer";

    console.log(`[RESUME_ANALYZE] File: ${uploadedFile ? `${uploadedFile.originalname} (${uploadedFile.size} bytes)` : "none"}, Text length: ${resumeContent.length}, Target Role: ${targetRole}`);

    if (uploadedFile && uploadedFile.buffer) {
      if (uploadedFile.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Document exceeds 5MB limit. Please upload a file under 5MB.",
        });
      }

      const extracted = await parseBufferToText(
        uploadedFile.buffer,
        uploadedFile.originalname || "resume.pdf",
        uploadedFile.mimetype || "application/pdf"
      );
      if (extracted && extracted.length >= 15) {
        resumeContent = extracted;
        console.log(`[RESUME_ANALYZE] Extracted ${extracted.length} characters from uploaded document.`);
      }
    }

    if (!resumeContent || typeof resumeContent !== "string" || resumeContent.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: "Please provide your resume content (pasted text, LaTeX, or uploaded document).",
      });
    }

    const report = await analyzeResume({
      resumeText: resumeContent,
      jobDescription,
      targetRole,
    });

    res.json({
      success: true,
      report,
      message: "Resume suggestions generated successfully.",
    });
  } catch (error) {
    console.error("Resume analysis error:", error.message);
    const statusCode = error.isRejected ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      isRejected: Boolean(error.isRejected),
      reason: error.reason || "",
      message: error.message || "Failed to analyze resume content.",
    });
  }
});

/* =========================================
   CONVERSATIONAL RESUME BUILDER CHAT
========================================= */
router.post("/builder/chat", async (req, res) => {
  try {
    const {
      currentResume = {},
      message = "",
      step = "start",
      userConfirmed = false,
      conversationHistory = [],
    } = req.body;

    const byokKey = req.headers["x-byok-key"] || "";
    const byokProvider = req.headers["x-byok-provider"] || "openai";
    const byokModel = req.headers["x-byok-model"] || "";

    const providerConfig = byokKey ? { mode: "byok", provider: byokProvider, apiKey: byokKey, model: byokModel } : { mode: "my_api" };

    const result = await processResumeBuilderMessage({
      currentGraph: currentResume,
      message,
      step,
      userConfirmed,
      conversationHistory,
      providerConfig,
    });

    res.json({
      success: true,
      aiResponse: result.aiResponse,
      nextStep: result.nextStep,
      updatedResume: result.updatedGraph,
      confirmationPending: result.confirmationPending,
      latex: result.latex || null,
    });
  } catch (error) {
    console.error("Builder chat error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================================
   GENERATE LATEX FROM STRUCTURED STATE
========================================= */
router.post("/generate-latex", (req, res) => {
  try {
    const { resumeData = {} } = req.body;
    const latex = generateCleanLatexFromGraph(resumeData);
    res.json({
      success: true,
      latex,
    });
  } catch (error) {
    console.error("LaTeX generation error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
