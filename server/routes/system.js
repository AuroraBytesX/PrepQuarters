/*
 * System Documentation & Architecture Route
 * PrepQuarters Core System Telemetry
 * Provides structured documentation, modality workflows, and API specifications.
 */

const express = require("express");
const router = express.Router();

router.get("/docs", (req, res) => {
  try {
    const docs = {
      title: "PrepQuarters System Documentation & Technical Architecture",
      version: "2.4.0",
      environment: process.env.NODE_ENV || "development",
      lastUpdated: new Date().toISOString(),
      overview: {
        description:
          "PrepQuarters is an autonomous AI mock interview and skill telemetry platform engineered for deep technical preparation across 10 distinct interview modalities.",
        architectureType: "Hybrid Deterministic-Neural Inference Architecture",
        coreEngines: [
          "Sequential Multi-Turn State Machine",
          "Multi-Modal Adaptive Cockpit (Coding IDE, MCQ Deck, Voice Visualizer, Architecture Scratchpad)",
          "Dual-Layer Answer Evaluation (Structured Key-Point Matcher + NVIDIA NIM LLM Reasoning)",
          "Live Speech-to-Text via Cloud Whisper Transcription Engine",
          "Longitudinal Skill-Gap Diagnostic Telemetry",
        ],
      },
      modalities: [
        {
          id: "voice",
          name: "AI Voice Interview",
          badge: "VOICE TELEMETRY",
          description:
            "Live bi-directional conversational interview with Web Audio spectrum visualizer, Groq Whisper transcription, and auto-spoken audio feedback.",
          configFields: ["role", "domain", "difficulty", "companyStyle", "sessionDuration", "autoTTS"],
          evaluationCriteria: ["Technical Depth", "Communication Articulation", "Trade-Off Discussion"],
        },
        {
          id: "technical",
          name: "Technical Interview",
          badge: "ARCHITECTURE & CONCEPTS",
          description:
            "Core CS fundamentals, distributed systems mechanics, database internals, and protocols.",
          configFields: ["discipline", "role", "difficulty", "companyStyle", "questionCount"],
          evaluationCriteria: ["Concept Accuracy", "Failure Mode Mitigations", "Component Decoupling"],
        },
        {
          id: "coding",
          name: "Coding Interview",
          badge: "ALGORITHMIC SUITE",
          description:
            "Interactive Monaco/Syntax workspace with multi-language starter templates, runtime sandbox execution, and test assertion verification.",
          configFields: ["language", "topic", "difficulty", "problemType", "timeLimit"],
          evaluationCriteria: ["Algorithmic Correctness", "Time Complexity Bounds", "Space Complexity Efficiency", "Edge Case Coverage"],
        },
        {
          id: "ai_coding",
          name: "AI Coding Interview",
          badge: "CONVERSATIONAL CODE",
          description:
            "Interactive AI interviewer probing solution design, edge case assumptions, hints, and evaluating both implementation and explanation.",
          configFields: ["language", "topic", "difficulty", "hintsEnabled", "timeLimit"],
          evaluationCriteria: ["Code Correctness", "Approach Articulation", "Algorithmic Complexity Communication"],
        },
        {
          id: "system_design",
          name: "System Design Interview",
          badge: "HIGH SCALE ARCHITECTURE",
          description:
            "High-scale distributed systems, database partitioning, caching layers, and regional failover patterns.",
          configFields: ["architectureTopic", "difficulty", "targetScale", "companyStyle", "sessionDuration"],
          evaluationCriteria: ["Scalability Bounds", "Bottleneck Identification", "Data Reconciliation", "Latency Percentiles"],
        },
        {
          id: "hr_behavioral",
          name: "HR / Behavioral Interview",
          badge: "STAR METHODOLOGY",
          description:
            "Leadership scenarios, stakeholder conflict resolution, project prioritization, and cross-functional ownership.",
          configFields: ["role", "behavioralFocus", "companyStyle", "sessionDuration"],
          evaluationCriteria: ["Situation Breakdown", "Task Clarity", "Action Impact", "Quantified Result"],
        },
        {
          id: "aptitude",
          name: "Aptitude Interview",
          badge: "COGNITIVE SPEED",
          description:
            "Quantitative aptitude, logical deduction, probability, and data interpretation with verified derivations.",
          configFields: ["category", "difficulty", "questionCount", "timeLimit"],
          evaluationCriteria: ["Mathematical Accuracy", "Formula Derivation", "Time Management"],
        },
        {
          id: "language_specific",
          name: "Language-Specific Technical Interview",
          badge: "RUNTIME INTERNALS",
          description:
            "Deep-dive questions into JavaScript V8 engine, Python GIL & generators, Java JVM memory allocation & Project Loom, and SQL indexing.",
          configFields: ["language", "concepts", "difficulty", "questionCount"],
          evaluationCriteria: ["Runtime Accuracy", "Memory Model Nuances", "Concurrency Semantics"],
        },
        {
          id: "company_specific",
          name: "Company-Specific Interview",
          badge: "COMPANY BENCHMARK",
          description:
            "Interviews calibrated to evaluation styles of Google, Meta, Amazon, Apple, Netflix, Uber, and Stripe.",
          configFields: ["company", "role", "interviewStyle", "difficulty"],
          evaluationCriteria: ["Company Cultural Rubrics", "Technical Bar Standards", "System Scale Expectations"],
        },
        {
          id: "mixed",
          name: "Mixed Interview",
          badge: "COMPREHENSIVE ROUND",
          description:
            "Full multi-discipline interview blending technical questions, algorithmic problem solving, system design, and behavioral traits.",
          configFields: ["selectedRounds", "difficulty", "totalQuestions", "companyStyle"],
          evaluationCriteria: ["Multi-Faceted Competency", "Adaptive Thinking", "Cross-Domain Knowledge"],
        },
      ],
      apiEndpoints: [
        { method: "POST", path: "/api/auth/register", description: "Register new candidate account with bcrypt password hashing." },
        { method: "POST", path: "/api/auth/login", description: "Authenticate candidate and issue secure JWT." },
        { method: "GET", path: "/api/auth/me", description: "Retrieve authenticated candidate profile and statistics." },
        { method: "POST", path: "/api/interview/start", description: "Initialize adaptive interview session with selected modality configuration." },
        { method: "POST", path: "/api/interview/:sessionId/answer", description: "Submit candidate answer, execute validation, generate rubric score & follow-up." },
        { method: "POST", path: "/api/interview/:sessionId/run-code", description: "Execute or validate code against test case assertions." },
        { method: "POST", path: "/api/interview/transcribe-audio", description: "Sub-second audio blob transcription using Groq Whisper." },
        { method: "POST", path: "/api/resume/analyze", description: "Deep ATS resume audit, keyword matching, and downloadable score report." },
        { method: "POST", path: "/api/resume/improve-bullet", description: "Transform weak resume bullets into STAR/XYZ impact statements." },
        { method: "GET", path: "/api/interview/library/questions", description: "Search, filter, and retrieve questions across all domains and modalities." },
        { method: "GET", path: "/api/interview/stats/summary", description: "Get candidate aggregate performance scores and skill radar metrics." },
        { method: "GET", path: "/api/interview/history/all", description: "Retrieve candidate past session transcripts for replay." },
        { method: "GET", path: "/api/system/docs", description: "Fetch platform documentation, modality workflows, and API specifications." },
      ],
      security: {
        dataIsolation: "Strict per-user data tenancy enforced in database queries.",
        secretProtection: "All AI keys (NVIDIA NIM, Groq STT) stored strictly server-side in .env.",
        sanitization: "Input validation and disallowed character stripping on all prompts and answers.",
      },
    };

    res.json({
      success: true,
      docs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to generate system documentation: " + err.message,
    });
  }
});

/* =========================================
   PROVIDER CONFIGURATION & BYOK VERIFICATION
========================================= */
router.get("/provider-config", (req, res) => {
  res.json({
    success: true,
    platformRateLimit: {
      requestsPerMinute: 40,
      description: "Platform-managed inference is rate limited to 40 requests per minute.",
    },
    supportedProviders: [
      { id: "platform", name: "My API (PrepQuarters Platform)", description: "Use built-in platform intelligence with 40 req/min rate limit.", requiresKey: false },
      { id: "openai", name: "OpenAI (BYOK)", description: "Connect your OpenAI API key for GPT-4o and reasoning models.", requiresKey: true },
      { id: "anthropic", name: "Anthropic (BYOK)", description: "Connect your Anthropic API key for Claude 3.5 models.", requiresKey: true },
      { id: "xai", name: "xAI (BYOK)", description: "Connect your xAI API key for Grok models.", requiresKey: true },
    ],
  });
});

router.post("/verify-byok", async (req, res) => {
  try {
    const { provider = "openai", apiKey = "" } = req.body;
    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 10) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Please enter a valid API key string.",
      });
    }

    const { callAiChatCompletion } = require("../services/AiProviderService");
    const testResult = await callAiChatCompletion({
      messages: [{ role: "user", content: "Say 'READY' in one word." }],
      options: { max_tokens: 10, temperature: 0.1, jsonMode: false },
      providerConfig: { mode: "byok", provider, apiKey: apiKey.trim() },
    });

    if (testResult.success) {
      res.json({
        success: true,
        valid: true,
        provider,
        message: `${provider.toUpperCase()} API key verified successfully.`,
      });
    } else {
      res.status(400).json({
        success: false,
        valid: false,
        message: testResult.error || "Failed to verify credentials with provider.",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      valid: false,
      message: "Verification failed.",
    });
  }
});

/* =========================================
   CONTACT / CONNECT FORM
========================================= */
const { sendContactEmail, isValidEmail } = require("../services/EmailService");

router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const cleanName = String(name || "").trim() || "Candidate";
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanMessage = String(message || "").trim();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (!cleanMessage || cleanMessage.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 5 characters long.",
      });
    }

    const emailResult = await sendContactEmail({
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
    });

    if (emailResult.success) {
      res.json({
        success: true,
        delivered: emailResult.delivered,
        recipient: emailResult.recipient,
        message: emailResult.message || "Thank you for reaching out. Your message has been received.",
      });
    } else {
      res.status(500).json({
        success: false,
        delivered: false,
        message: emailResult.message || "Could not deliver message to email service. Please try again.",
      });
    }
  } catch (error) {
    console.error("Contact form submission error:", error.message);
    res.status(500).json({
      success: false,
      message: "Could not submit message. Please try again.",
    });
  }
});

module.exports = router;
