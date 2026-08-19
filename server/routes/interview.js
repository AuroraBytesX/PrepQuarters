const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});
const protect = require("../middleware/authMiddleware");
const {
  DOMAINS,
  CODING_PROBLEMS,
  APTITUDE_QUESTIONS,
  LANGUAGE_QUESTIONS,
  getDomainConfig,
  getTopCompaniesForDomain,
  validateDomainAndRole,
} = require("../services/DomainKnowledge");
const {
  generateInitialQuestion,
  evaluateAnswerAndGenerateNext,
  generateFinalEvaluation,
} = require("../services/InterviewService");
const { transcribeAudio } = require("../services/TranscriptionService");
const { executeCodeSandbox } = require("../services/CodingSandboxService");
const { getQuestions } = require("../services/QuestionBankService");
const {
  saveInterviewSession,
  getInterviewSession,
  listUserInterviewSessions,
  cleanupUserOlderSessions,
  updateUser,
  findUserById,
} = require("../services/AppwriteService");

/* =========================================
   SPEECH-TO-TEXT (AUDIO TRANSCRIPTION)
========================================= */
router.post("/transcribe-audio", protect, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        transcript: "",
        message: "No audio file provided for transcription.",
      });
    }

    const mimeType = req.file.mimetype || req.headers["content-type"] || "audio/webm";
    const result = await transcribeAudio({
      buffer: req.file.buffer,
      mimetype: mimeType,
      filename: req.file.originalname || "recording.webm",
    });

    res.json({
      success: true,
      transcript: result.transcript,
      provider: result.provider,
      confidence: result.confidence,
    });
  } catch (error) {
    console.error("Audio transcription error:", error.message);
    res.status(500).json({
      success: false,
      transcript: "",
      message: error.message || "Failed to transcribe audio.",
    });
  }
});

/* =========================================
   ISOLATED CODING SANDBOX EXECUTION
========================================= */
router.post("/run-code", protect, async (req, res) => {
  try {
    const { language = "javascript", code = "", testCases = [] } = req.body;
    const result = await executeCodeSandbox({ language, code, testCases });
    res.json({
      success: true,
      results: result.testResults,
      executionOutput: result.executionLog,
      ...result,
    });
  } catch (error) {
    console.error("Sandbox execution error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to execute code in sandbox.",
    });
  }
});

router.post("/:sessionId/run-code", protect, async (req, res) => {
  try {
    const { language = "javascript", code = "", testCases = [] } = req.body;
    const result = await executeCodeSandbox({ language, code, testCases });
    res.json({
      success: true,
      results: result.testResults,
      executionOutput: result.executionLog,
      ...result,
    });
  } catch (error) {
    console.error("Sandbox execution error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to execute code in sandbox.",
    });
  }
});

/* =========================================
   SOURCED QUESTION BANK (CODEFORCES + CURATED)
========================================= */
router.get("/library/questions", async (req, res) => {
  try {
    const { domain = "All", difficulty = "All", questionType = "All", search = "", page = 1, limit = 20 } = req.query;
    const result = await getQuestions({ domain, difficulty, questionType, search, page, limit });
    res.json(result);
  } catch (error) {
    console.error("Question library error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch question bank data.",
      questions: [],
    });
  }
});

/* =========================================
   START NEW INTERVIEW SESSION
========================================= */
router.post("/start", protect, async (req, res) => {
  try {
    const {
      role = "Software Engineer",
      domain = "Software Engineering",
      difficulty = "Hard",
      companyStyle = "Google",
      interviewType = "AI Voice + Technical Interview",
      programmingLanguage = "javascript",
      programmingLanguages,
      durationMinutes,
      sessionDuration,
      modalityConfig = {},
      totalQuestions = 5,
    } = req.body;

    // Validate Domain and Role Context
    const validation = validateDomainAndRole(domain, role);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        suggestedRoles: validation.suggestedRoles || [],
      });
    }

    const validDomain = validation.domain;
    const validRole = validation.role;

    // Extract programming languages
    const languagesList = Array.isArray(programmingLanguages) && programmingLanguages.length > 0
      ? programmingLanguages
      : [programmingLanguage].filter(Boolean);
    const primaryLanguage = languagesList[0] || programmingLanguage || "javascript";

    // Extract speech response mode
    const isAutoTTS = typeof req.body.autoTTS === "boolean"
      ? req.body.autoTTS
      : typeof modalityConfig.autoTTS === "boolean"
      ? modalityConfig.autoTTS
      : true;
    const speechMode = isAutoTTS ? "autonomous" : "explicit_on_demand";

    const parsedDurationMinutes = parseInt(durationMinutes || modalityConfig.sessionDuration || sessionDuration, 10) || 10;
    const selectedDurationStr = `${parsedDurationMinutes} Minutes`;
    const validatedTotalQuestions = Math.min(Math.max(parseInt(totalQuestions, 10) || 5, 1), 20);

    let firstQuestionData;
    if (req.body.initialQuestion && req.body.initialQuestion.questionText) {
      firstQuestionData = {
        topic: req.body.initialQuestion.topic || "Core Fundamentals",
        subtopic: req.body.initialQuestion.subtopic || "Domain Practice",
        difficulty: req.body.initialQuestion.difficulty || difficulty,
        questionType: req.body.initialQuestion.questionType || "Technical",
        starterCode: req.body.initialQuestion.starterCode || "",
        referenceSolution: req.body.initialQuestion.referenceSolution || "",
        hints: req.body.initialQuestion.hints || [],
        programmingLanguage: req.body.initialQuestion.programmingLanguage || primaryLanguage,
        testCases: req.body.initialQuestion.testCases || [],
        aptitudeOptions: req.body.initialQuestion.aptitudeOptions || [],
        correctOptionIndex: req.body.initialQuestion.correctOptionIndex,
        explanation: req.body.initialQuestion.explanation || "",
        questionText: req.body.initialQuestion.questionText,
        expectedKeyPoints: req.body.initialQuestion.expectedKeyPoints || [],
        isFollowUp: false,
        source: "question-library",
      };
    } else {
      // Fetch user's previous questions to guarantee cross-session uniqueness
      const userSessions = await listUserInterviewSessions(req.user.userId);
      const previouslyAskedTexts = userSessions.flatMap((s) => (s.questions || []).map((q) => q.questionText));

      // Generate first question with focus awareness
      firstQuestionData = await generateInitialQuestion({
        role: validRole,
        domain: validDomain,
        difficulty,
        companyStyle,
        interviewType,
        programmingLanguage: primaryLanguage,
        programmingLanguages: languagesList,
        hrFocusAreas: modalityConfig.hrFocusAreas || [],
        aptitudeFocusAreas: modalityConfig.aptitudeFocusAreas || [],
        dsaEnabled: Boolean(modalityConfig.dsaEnabled),
        dsaTopics: modalityConfig.dsaTopics || [],
        modalityConfig,
        previouslyAskedTexts,
      });
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + parsedDurationMinutes * 60 * 1000);
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newSession = {
      _id: sessionId,
      id: sessionId,
      userId: req.user.userId,
      role: validRole,
      domain: validDomain,
      difficulty: ["Easy", "Medium", "Hard"].includes(difficulty) ? difficulty : "Hard",
      companyStyle,
      interviewType,
      programmingLanguage: primaryLanguage,
      programmingLanguages: languagesList,
      autoTTS: isAutoTTS,
      speechResponseMode: speechMode,
      modalityConfig,
      sessionDurationMinutes: parsedDurationMinutes,
      selectedDuration: selectedDurationStr,
      sessionStartTime: now.toISOString(),
      sessionEndTime: endTime.toISOString(),
      remainingTimeSeconds: parsedDurationMinutes * 60,
      elapsedTimeSeconds: 0,
      isTimeExpired: false,
      status: "in_progress",
      totalQuestionsPlanned: validatedTotalQuestions,
      currentQuestionIndex: 0,
      questions: [
        {
          questionIndex: 0,
          topic: firstQuestionData.topic,
          subtopic: firstQuestionData.subtopic,
          difficulty: firstQuestionData.difficulty || difficulty,
          questionType: firstQuestionData.questionType || "Technical",
          starterCode: firstQuestionData.starterCode || "",
          referenceSolution: firstQuestionData.referenceSolution || "",
          hints: firstQuestionData.hints || [],
          programmingLanguage: firstQuestionData.programmingLanguage || primaryLanguage,
          testCases: firstQuestionData.testCases || [],
          aptitudeOptions: firstQuestionData.aptitudeOptions || [],
          correctOptionIndex: firstQuestionData.correctOptionIndex,
          explanation: firstQuestionData.explanation || "",
          questionText: firstQuestionData.questionText,
          expectedKeyPoints: firstQuestionData.expectedKeyPoints || [],
          isFollowUp: Boolean(firstQuestionData.isFollowUp),
          followUpReason: firstQuestionData.followUpReason || undefined,
          askedAt: now.toISOString(),
        },
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const saved = await saveInterviewSession(newSession);

    // Update user stats
    const currentUser = await findUserById(req.user.userId);
    if (currentUser) {
      const currentStats = currentUser.stats || {};
      await updateUser(req.user.userId, {
        stats: {
          ...currentStats,
          totalInterviews: (currentStats.totalInterviews || 0) + 1,
          lastPracticedAt: now.toISOString(),
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Interview session started.",
      sessionId: saved._id || saved.id,
      session: {
        ...saved,
        currentQuestion: saved.questions[0],
      },
    });
  } catch (error) {
    console.error("Start interview session failure:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initialize interview session.",
    });
  }
});

/* =========================================
   GET SESSION BY ID
========================================= */
router.get("/:id", protect, async (req, res) => {
  try {
    const session = await getInterviewSession(req.params.id);

    if (!session || String(session.userId) !== String(req.user.userId)) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found.",
      });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex] || null;

    res.json({
      success: true,
      session: {
        ...session,
        currentQuestion,
      },
    });
  } catch (error) {
    console.error("Error retrieving session:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve interview session.",
    });
  }
});

/* =========================================
   SUBMIT CANDIDATE ANSWER & EVALUATE
========================================= */
router.post("/:id/answer", protect, async (req, res) => {
  try {
    const candidateAnswer = req.body.candidateAnswer || req.body.answer || "";
    const timeSpentSeconds = Number(req.body.timeSpentSeconds || req.body.timeTakenSeconds || 0);

    const session = await getInterviewSession(req.params.id);

    if (!session || String(session.userId) !== String(req.user.userId)) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found.",
      });
    }

    if (session.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This interview session is already completed.",
      });
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      return res.status(400).json({
        success: false,
        message: "No active question found for this step.",
      });
    }

    // Evaluate answer with AI Reasoning
    const evalResult = await evaluateAnswerAndGenerateNext({
      session,
      currentQuestion,
      candidateAnswer: candidateAnswer.trim(),
      timeSpentSeconds,
    });

    if (evalResult.retryRequired) {
      return res.status(200).json({
        success: false,
        retryRequired: true,
        message: evalResult.retryMessage,
        retryPrompt: evalResult.retryPrompt,
      });
    }

    // Attach evaluation to current question
    currentQuestion.candidateAnswer = candidateAnswer.trim();
    currentQuestion.timeSpentSeconds = timeSpentSeconds;
    currentQuestion.answeredAt = new Date().toISOString();
    currentQuestion.evaluation = evalResult.evaluation;

    let isCompleted = evalResult.isCompleted;
    let nextQuestion = evalResult.nextQuestion || null;
    let overallEval = null;

    if (isCompleted || !nextQuestion) {
      session.status = "completed";
      session.completedAt = new Date().toISOString();
      session.isCompleted = true;

      overallEval = await generateFinalEvaluation(session);
      session.overallEvaluation = overallEval;

      // Update user stats
      const currentUser = await findUserById(req.user.userId);
      if (currentUser) {
        const stats = currentUser.stats || {};
        const completedCount = (stats.completedInterviews || 0) + 1;
        const currentAvg = stats.averageScore || 0;
        const newAvg = Math.round(((currentAvg * (completedCount - 1) + (overallEval.overallScore || 0)) / completedCount) * 10) / 10;

        await updateUser(req.user.userId, {
          stats: {
            ...stats,
            completedInterviews: completedCount,
            averageScore: newAvg,
            lastPracticedAt: new Date().toISOString(),
          },
        });
      }
    } else {
      session.questions.push({
        questionIndex: session.questions.length,
        ...nextQuestion,
        askedAt: new Date().toISOString(),
      });
      session.currentQuestionIndex = session.questions.length - 1;
    }

    await saveInterviewSession(session);

    // Keep only latest 2 completed sessions
    if (session.status === "completed") {
      await cleanupUserOlderSessions(req.user.userId, 2);
    }

    res.json({
      success: true,
      evaluation: evalResult.evaluation,
      isCompleted: session.status === "completed",
      nextQuestion: session.status === "completed" ? null : session.questions[session.currentQuestionIndex],
      currentQuestionIndex: session.currentQuestionIndex,
      overallEvaluation: session.overallEvaluation || null,
      session,
    });
  } catch (error) {
    console.error("Answer evaluation failure:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to evaluate candidate answer.",
    });
  }
});

/* =========================================
   FINISH SESSION EARLY
========================================= */
router.post("/:id/finish", protect, async (req, res) => {
  try {
    const session = await getInterviewSession(req.params.id);

    if (!session || String(session.userId) !== String(req.user.userId)) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found.",
      });
    }

    session.status = "completed";
    session.completedAt = new Date().toISOString();
    session.isCompleted = true;

    const overallEval = await generateFinalEvaluation(session);
    session.overallEvaluation = overallEval;

    await saveInterviewSession(session);
    await cleanupUserOlderSessions(req.user.userId, 2);

    res.json({
      success: true,
      message: "Interview session finalized.",
      session,
      overallEvaluation: overallEval,
    });
  } catch (error) {
    console.error("Finish session error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to finalize session.",
    });
  }
});

/* =========================================
   USER SESSIONS & HISTORY (LATEST 2 COMPLETED)
========================================= */
router.get("/user/sessions", protect, async (req, res) => {
  try {
    const sessions = await listUserInterviewSessions(req.user.userId);
    res.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("Error retrieving user sessions:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve interview history.",
    });
  }
});

router.get("/user/completed-sessions", protect, async (req, res) => {
  try {
    const all = await listUserInterviewSessions(req.user.userId);
    const completed = all.filter((s) => s.status === "completed").slice(0, 2);

    res.json({
      success: true,
      count: completed.length,
      sessions: completed,
    });
  } catch (error) {
    console.error("Error retrieving completed replays:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve interview replays.",
    });
  }
});

/* =========================================
   SKILL GAP DIAGNOSTIC ANALYTICS
========================================= */
router.get("/user/skill-gap-analytics", protect, async (req, res) => {
  try {
    const allSessions = await listUserInterviewSessions(req.user.userId);
    const completedSessions = allSessions.filter((s) => s.status === "completed");

    if (completedSessions.length === 0) {
      return res.json({
        success: true,
        hasData: false,
        message: "No completed interviews yet.",
        analytics: {
          totalCompleted: 0,
          averageScore: 0,
          strengths: [],
          weaknesses: [],
          recommendedPracticeTopics: ["System Design", "Algorithmic Complexity", "STAR Methodology"],
        },
      });
    }

    const scores = completedSessions.map((s) => s.overallEvaluation?.overallScore || 0);
    const avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;

    const allStrengths = completedSessions.flatMap((s) => s.overallEvaluation?.strengths || []);
    const allWeaknesses = completedSessions.flatMap((s) => s.overallEvaluation?.areasForImprovement || s.overallEvaluation?.weaknesses || []);

    res.json({
      success: true,
      hasData: true,
      analytics: {
        totalCompleted: completedSessions.length,
        averageScore: avgScore,
        strengths: Array.from(new Set(allStrengths)).slice(0, 5),
        weaknesses: Array.from(new Set(allWeaknesses)).slice(0, 5),
        recommendedPracticeTopics: Array.from(new Set(allWeaknesses.map((w) => w.split(" ")[0]))).slice(0, 4),
      },
    });
  } catch (error) {
    console.error("Skill gap analytics error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate skill gap analytics.",
    });
  }
});

module.exports = router;
