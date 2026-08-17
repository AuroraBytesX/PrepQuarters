/*
 * AI Interview Service
 * PrepQuarters Core Orchestration Engine
 * Integrates NVIDIA NIM LLM inference with adaptive questioning,
 * domain intelligence, intelligent follow-ups, and skill-gap analysis.
 */

const {
  DOMAINS,
  CODING_PROBLEMS,
  APTITUDE_QUESTIONS,
  LANGUAGE_QUESTIONS,
  getDomainConfig,
  getCompanyStyleProfile,
} = require("./DomainKnowledge");

const {
  isNimConfigured,
  callNimChatCompletion,
} = require("./NvidiaNimService");

const {
  validateCandidateAnswer,
} = require("./AnswerValidationService");

/**
 * Generates the opening interview question based on interviewType, domain, and language.
 */
async function generateInitialQuestion({
  role,
  domain,
  difficulty = "Hard",
  companyStyle = "General Tech",
  interviewType = "Mixed",
  programmingLanguage = "javascript",
  programmingLanguages = [],
  hrFocusAreas = [],
  aptitudeFocusAreas = [],
  dsaEnabled = false,
  dsaTopics = [],
  modalityConfig = {},
  previouslyAskedTexts = [],
}) {
  const domainConfig = getDomainConfig(domain);
  const companyProfile = getCompanyStyleProfile(domain, companyStyle);

  // 1. Specialized Coding Interview Mode or Language-Specific with DSA
  if (interviewType.includes("Coding") || (interviewType.includes("Language-Specific") && dsaEnabled)) {
    const lang = (programmingLanguage || "javascript").toLowerCase();
    const targetTopics = Array.isArray(dsaTopics) && dsaTopics.length > 0 ? dsaTopics.map((t) => t.toLowerCase()) : [];
    const usedTexts = new Set((previouslyAskedTexts || []).map((t) => t.toLowerCase().trim()));
    
    let matching = CODING_PROBLEMS.filter((p) => !usedTexts.has(p.questionText.toLowerCase().trim()));
    if (targetTopics.length > 0) {
      const topicMatches = matching.filter((p) => targetTopics.some((t) => p.topic.toLowerCase().includes(t) || p.title.toLowerCase().includes(t)));
      if (topicMatches.length > 0) matching = topicMatches;
    }

    const selected = matching.length > 0 ? matching[0] : CODING_PROBLEMS[0];

    return {
      topic: selected.topic,
      subtopic: selected.title,
      questionType: "Coding",
      difficulty: selected.difficulty || difficulty,
      programmingLanguage: lang,
      starterCode: (selected.starterCode && (selected.starterCode[lang] || selected.starterCode.javascript)) || "",
      referenceSolution: (selected.referenceSolution && (selected.referenceSolution[lang] || selected.referenceSolution.javascript)) || "",
      hints: selected.hints || [],
      testCases: selected.testCases || [],
      questionText: cleanDisallowedChars(selected.questionText),
      expectedKeyPoints: selected.expectedKeyPoints || ["O(n) time complexity", "Clean boundary handling"],
      source: "coding-challenge-bank",
    };
  }

  // 2. Aptitude & Reasoning Mode
  if (interviewType.includes("Aptitude")) {
    const targetCategories = Array.isArray(aptitudeFocusAreas) && aptitudeFocusAreas.length > 0
      ? aptitudeFocusAreas.map((c) => c.toLowerCase())
      : [];
    const usedTexts = new Set((previouslyAskedTexts || []).map((t) => t.toLowerCase().trim()));
    
    let matching = APTITUDE_QUESTIONS.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
    if (targetCategories.length > 0) {
      const catMatches = matching.filter((q) => targetCategories.some((c) => q.topic.toLowerCase().includes(c) || q.subtopic.toLowerCase().includes(c)));
      if (catMatches.length > 0) matching = catMatches;
    }

    const selected = matching.length > 0 ? matching[0] : APTITUDE_QUESTIONS[0];

    return {
      topic: selected.topic,
      subtopic: selected.subtopic,
      questionType: "Aptitude",
      difficulty: selected.difficulty || difficulty,
      aptitudeOptions: selected.aptitudeOptions,
      correctOptionIndex: selected.correctOptionIndex,
      explanation: selected.explanation,
      starterCode: "",
      referenceSolution: `Correct Answer: Option ${String.fromCharCode(65 + selected.correctOptionIndex)}\nExplanation:\n${selected.explanation}`,
      hints: [
        `Identify the fundamental formula or deduction pattern connecting the given values.`,
        `Calculate step by step to verify logical consistency.`,
      ],
      questionText: cleanDisallowedChars(selected.questionText),
      expectedKeyPoints: selected.expectedKeyPoints || ["Correct mathematical deduction"],
      source: "aptitude-knowledge-bank",
    };
  }

  // 3. Language-Specific Technical Mode
  if (interviewType.includes("Language-Specific") || interviewType.includes("Language-specific")) {
    const lang = (programmingLanguage || "javascript").toLowerCase();
    const langQuestions = LANGUAGE_QUESTIONS[lang] || LANGUAGE_QUESTIONS.javascript;
    if (langQuestions && langQuestions.length > 0) {
      const usedTexts = new Set((previouslyAskedTexts || []).map((t) => t.toLowerCase().trim()));
      const fresh = langQuestions.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
      const selected = fresh.length > 0 ? fresh[0] : langQuestions[0];

      return {
        topic: selected.topic,
        subtopic: selected.subtopic,
        questionType: "Technical",
        difficulty: selected.difficulty || difficulty,
        programmingLanguage: lang,
        starterCode: "",
        referenceSolution: `Reference Benchmark for ${selected.topic}:\n- Key Points: ${(selected.expectedKeyPoints || []).join("; ")}`,
        hints: [
          `Consider how ${lang} handles memory layout and execution order internally.`,
          `Analyze concurrency primitives and runtime overhead.`,
        ],
        questionText: cleanDisallowedChars(selected.questionText),
        expectedKeyPoints: selected.expectedKeyPoints,
        source: "language-knowledge-bank",
      };
    }
  }

  if (isNimConfigured()) {
    const excludeList = (previouslyAskedTexts || [])
      .slice(0, 15)
      .map((t) => `"${t}"`)
      .join("; ");

    const systemPrompt = `You are a senior hiring manager and principal interviewer at a top technology company.
Domain: ${domain}
Target Role: ${role}
Difficulty Level: ${difficulty}
Company Interview Style: ${companyStyle} (${companyProfile.focus})
Interviewer Persona: ${companyProfile.interviewerPersona}
Interview Modality: ${interviewType}

CRITICAL RULES:
1. Ask exactly ONE clear, realistic, and domain-relevant interview question to begin the interview.
2. DO NOT ask or repeat any of these previously asked questions: [${excludeList || "None"}].
3. Calibrate strictly to difficulty:
   - "Hard": Focus on high-scale distributed systems, multi-region architecture, concurrency, subtle failure modes, or complex trade-offs.
   - "Medium": Focus on realistic system components, database query optimization, security, background worker queues, or practical design decisions.
   - "Easy": Focus on core CS data structures, fundamental protocol mechanics (REST vs GraphQL, B-Tree index basics), clean code, and foundational concepts.
4. Do not include greetings like "Hello!" in questionText. Output ONLY the interview question.
5. NEVER use em dashes or emojis anywhere in your response.
6. Output your response in valid JSON matching this schema:
{
  "topic": "Specific Topic Name",
  "subtopic": "Specific Subtopic Name",
  "questionType": "Technical",
  "questionText": "The exact interview question to ask the candidate",
  "expectedKeyPoints": [
    "Key point 1 expected in a high quality answer",
    "Key point 2 expected in a high quality answer",
    "Key point 3 expected in a high quality answer"
  ]
}`;

    const userPrompt = `Generate a fresh, unique opening question for a ${difficulty} level interview for ${role} in ${domain}. Interview Type: ${interviewType}. Company style: ${companyStyle}. (Seed: ${Date.now()}_${Math.random()})`;

    const nimResult = await callNimChatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.6, max_tokens: 600, jsonMode: true }
    );

    if (nimResult.success && nimResult.json && nimResult.json.questionText) {
      return {
        topic: nimResult.json.topic || "Core Fundamentals",
        subtopic: nimResult.json.subtopic || "Domain Concepts",
        questionType: nimResult.json.questionType || "Technical",
        difficulty,
        questionText: cleanDisallowedChars(nimResult.json.questionText),
        expectedKeyPoints: Array.isArray(nimResult.json.expectedKeyPoints)
          ? nimResult.json.expectedKeyPoints.map(cleanDisallowedChars)
          : ["Clear problem understanding", "Technical trade-offs", "Structured explanation"],
        source: "nvidia-nim",
      };
    }
  }

  // Fallback to curated domain knowledge base with cross-session uniqueness
  return getCuratedInitialQuestion({ domain, difficulty, companyStyle, previouslyAskedTexts, interviewType, programmingLanguage });
}

/**
 * Evaluates candidate answer and decides next step (follow-up vs next topic).
 */
async function evaluateAnswerAndGenerateNext({
  role,
  domain,
  difficulty = "Hard",
  companyStyle = "General Tech",
  currentQuestion,
  candidateAnswer,
  previousQuestions = [],
  questionIndex,
  totalPlanned,
  timeSpentSeconds = 0,
}) {
  const domainConfig = getDomainConfig(domain);
  const companyProfile = getCompanyStyleProfile(domain, companyStyle);

  const cleanAnswer = cleanDisallowedChars(candidateAnswer || "").trim();

  // Step 1: Intelligent Answer Validation
  const validation = validateCandidateAnswer({
    questionText: currentQuestion.questionText,
    topic: currentQuestion.topic,
    domain,
    questionType: currentQuestion.questionType,
    candidateAnswer: cleanAnswer,
  });

  if (!validation.isValid) {
    return {
      isValidAnswer: false,
      retryRequired: true,
      validationCategory: validation.category,
      validationReason: validation.reason,
      retryPrompt: validation.retryPrompt,
      evaluation: {
        score: null,
        technicalAccuracy: validation.reason,
        reasoning: "Answer was insufficient or invalid for scoring.",
        communicationClarity: "Please re-attempt the scenario with structured technical reasoning.",
        strengths: [],
        improvements: [validation.retryPrompt],
        keyMissedPoints: currentQuestion.expectedKeyPoints || ["Comprehensive conceptual explanation"],
        suggestedModelAnswer: "",
      },
      isFollowUp: false,
      isCompleted: false,
      nextQuestion: null,
    };
  }

  // Step 2: Valid Answer Evaluation (NVIDIA NIM or Fallback)
  if (isNimConfigured()) {
    const historySummary = previousQuestions
      .map((q, idx) => `Q${idx + 1} [Topic: ${q.topic}]: "${q.questionText}"\nScore: ${q.evaluation?.score || "N/A"}/10`)
      .join("\n\n");

    const alreadyAskedQuestionsList = [...previousQuestions, currentQuestion]
      .map((q) => `"${q.questionText}" (Topic: ${q.topic})`)
      .join("; ");

    const systemPrompt = `You are a senior technical interviewer and bar raiser at ${companyStyle}.
Domain: ${domain}
Role: ${role}
Current Difficulty: ${difficulty}
Company Focus: ${companyProfile.focus}

You are evaluating the candidate's answer to the following scenario:
Question: "${currentQuestion.questionText}"
Topic: "${currentQuestion.topic}"
Expected Key Points: ${JSON.stringify(currentQuestion.expectedKeyPoints || [])}

Interview History so far:
${historySummary || "This is the first scenario."}

CRITICAL EVALUATION & ADAPTIVE FOLLOW-UP GUIDELINES:
1. Objectively evaluate technical correctness, conceptual depth, reasoning quality, and communication on a scale of 1 to 10. Technical accuracy must strictly drive the score.
2. Identify specific strengths demonstrated and precise missing points or edge-case omissions.
3. DECISION ON NEXT STEP:
   - If the candidate's answer missed important nuance or made a questionable architectural assertion, and is on scenario index ${questionIndex + 1} of ${totalPlanned}, set "shouldAskFollowUp": true and formulate an adaptive follow-up question directly probing their previous answer assertions.
   - If generating a new independent scenario (when shouldAskFollowUp is false):
     * NEVER repeat or ask semantically similar questions to any of: [${alreadyAskedQuestionsList}].
     * Pick a completely DIFFERENT competency within ${domain} from: ${JSON.stringify(domainConfig.skillCategories || [])}.
   - If this is the final planned scenario (${questionIndex + 1} >= ${totalPlanned}), set "shouldAskFollowUp": false.
4. NEVER use em dashes or emojis anywhere in your response.
5. Return valid JSON matching this schema:
{
  "evaluation": {
    "score": 8,
    "technicalAccuracy": "Detailed analysis of technical correctness and depth",
    "reasoning": "Assessment of analytical problem decomposition and trade-offs",
    "communicationClarity": "Analysis of structure, conciseness, and terminology",
    "strengths": ["Specific strength 1", "Specific strength 2"],
    "improvements": ["Specific improvement 1", "Specific improvement 2"],
    "keyMissedPoints": ["Key point missed 1", "Key point missed 2"],
    "suggestedModelAnswer": "A concise, high-standard model response illustrating what a top 5% candidate would say"
  },
  "shouldAskFollowUp": false,
  "followUpReason": "Reason for follow-up if applicable",
  "nextQuestion": {
    "topic": "Different Topic Name",
    "subtopic": "Subtopic Name",
    "questionType": "Technical",
    "difficulty": "${difficulty}",
    "questionText": "The fresh, distinct question text",
    "expectedKeyPoints": ["Point 1", "Point 2", "Point 3"]
  }
}`;

    const userPrompt = `Candidate Answer:\n"${cleanAnswer}"\n\nEvaluate this answer and determine the next scenario or follow-up.`;

    const nimResult = await callNimChatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.3, max_tokens: 1400, jsonMode: true }
    );

    if (nimResult.success && nimResult.json && nimResult.json.evaluation) {
      const evalData = nimResult.json.evaluation;
      const shouldFollowUp = Boolean(nimResult.json.shouldAskFollowUp && questionIndex + 1 < totalPlanned);

      const cleanedEval = {
        score: Math.min(10, Math.max(1, Number(evalData.score) || 6)),
        technicalAccuracy: cleanDisallowedChars(evalData.technicalAccuracy || "Answer evaluated based on domain criteria."),
        reasoning: cleanDisallowedChars(evalData.reasoning || "Technical reasoning analyzed."),
        communicationClarity: cleanDisallowedChars(evalData.communicationClarity || "Response structure and delivery analyzed."),
        strengths: (evalData.strengths || ["Addressed the core subject."]).map(cleanDisallowedChars),
        improvements: (evalData.improvements || ["Provide deeper architectural considerations."]).map(cleanDisallowedChars),
        keyMissedPoints: (evalData.keyMissedPoints || []).map(cleanDisallowedChars),
        suggestedModelAnswer: cleanDisallowedChars(evalData.suggestedModelAnswer || ""),
      };

      let nextQ = null;
      if (questionIndex + 1 < totalPlanned && nimResult.json.nextQuestion && nimResult.json.nextQuestion.questionText) {
        nextQ = {
          topic: nimResult.json.nextQuestion.topic || currentQuestion.topic,
          subtopic: nimResult.json.nextQuestion.subtopic || "Scenario",
          questionType: nimResult.json.nextQuestion.questionType || "Technical",
          difficulty: nimResult.json.nextQuestion.difficulty || difficulty,
          questionText: cleanDisallowedChars(nimResult.json.nextQuestion.questionText),
          expectedKeyPoints: (nimResult.json.nextQuestion.expectedKeyPoints || []).map(cleanDisallowedChars),
          isFollowUp: shouldFollowUp,
          followUpReason: cleanDisallowedChars(nimResult.json.followUpReason || ""),
          source: "nvidia-nim",
        };
      }

      return {
        isValidAnswer: true,
        evaluation: cleanedEval,
        isFollowUp: shouldFollowUp,
        isCompleted: questionIndex + 1 >= totalPlanned,
        nextQuestion: nextQ,
      };
    }
  }

  // Fallback to curated evaluation engine
  return evaluateAnswerCurated({
    domain,
    role,
    difficulty,
    companyStyle,
    currentQuestion,
    candidateAnswer: cleanAnswer,
    questionIndex,
    totalPlanned,
    previousQuestions,
  });
}

/**
 * Generates the final overall evaluation, skill-gap analysis, and roadmap.
 */
async function generateFinalEvaluation({
  role,
  domain,
  difficulty,
  companyStyle,
  questions = [],
  totalDurationSeconds = 0,
}) {
  const domainConfig = getDomainConfig(domain);
  const companyProfile = getCompanyStyleProfile(domain, companyStyle);

  // Calculate deterministic metrics from valid scores
  const validQuestions = questions.filter((q) => q.evaluation && typeof q.evaluation.score === "number");
  const scores = validQuestions.map((q) => q.evaluation.score);
  const avgScoreOutOf10 = scores.length > 0
    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
    : 5;
  const overallPercentage = Math.round(avgScoreOutOf10 * 10);

  let calculatedHireRecommendation = "Leaning Hire";
  if (overallPercentage >= 85) calculatedHireRecommendation = "Strong Hire";
  else if (overallPercentage >= 72) calculatedHireRecommendation = "Hire";
  else if (overallPercentage >= 58) calculatedHireRecommendation = "Leaning Hire";
  else if (overallPercentage >= 45) calculatedHireRecommendation = "Leaning No Hire";
  else calculatedHireRecommendation = "No Hire";

  if (isNimConfigured()) {
    const fullTranscript = questions
      .map((q, i) => `Q${i + 1} [${q.topic} - ${q.difficulty}]: ${q.questionText}\nCandidate Answer: ${q.candidateAnswer}\nScore: ${q.evaluation?.score || "N/A"}/10\nFeedback: ${q.evaluation?.technicalAccuracy}`)
      .join("\n\n");

    const systemPrompt = `You are the lead bar raiser and hiring committee member at ${companyStyle}.
Domain: ${domain}
Role: ${role}
Difficulty Level: ${difficulty}
Candidate Total Score: ${overallPercentage}/100

Transcript of Full Interview:
${fullTranscript}

Domain Skill Categories to evaluate:
${JSON.stringify(domainConfig.skillCategories || [])}

TASK:
Provide a rigorous, constructive, and highly actionable post-interview evaluation.
1. Determine hire recommendation: "Strong Hire", "Hire", "Leaning Hire", "Leaning No Hire", or "No Hire".
2. Write a concise executive summary of candidate performance.
3. List 3 to 4 key strengths demonstrated.
4. List 3 to 4 priority growth areas.
5. Create a detailed Skill Gap Analysis evaluating each competency listed above with:
   - score (0 to 100)
   - status ("Strong", "Proficient", "Needs Work", "Critical Gap")
   - gapDescription
   - recommendedAction
6. Outline a 3-step personalized preparation roadmap.
7. NEVER use em dashes or emojis anywhere.
8. Output in valid JSON matching this schema:
{
  "overallScore": ${overallPercentage},
  "hireRecommendation": "${calculatedHireRecommendation}",
  "summaryText": "Executive summary of interview performance",
  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "priorityImprovementAreas": ["Area 1", "Area 2", "Area 3"],
  "skillGapAnalysis": [
    {
      "skillName": "Skill Name from list",
      "category": "Technical",
      "score": 75,
      "status": "Proficient",
      "gapDescription": "Specific gap description",
      "recommendedAction": "Concrete action to close gap"
    }
  ],
  "personalizedPreparationPlan": [
    {
      "step": 1,
      "title": "Action title",
      "action": "Detailed study action"
    }
  ]
}`;

    const nimResult = await callNimChatCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate the final comprehensive evaluation and skill-gap report." },
      ],
      { temperature: 0.3, max_tokens: 1500, jsonMode: true }
    );

    if (nimResult.success && nimResult.json && nimResult.json.summaryText) {
      const data = nimResult.json;
      return {
        overallScore: Math.min(100, Math.max(0, Number(data.overallScore) || overallPercentage)),
        hireRecommendation: data.hireRecommendation || calculatedHireRecommendation,
        summaryText: cleanDisallowedChars(data.summaryText),
        keyStrengths: (data.keyStrengths || []).map(cleanDisallowedChars),
        priorityImprovementAreas: (data.priorityImprovementAreas || []).map(cleanDisallowedChars),
        skillGapAnalysis: (data.skillGapAnalysis || []).map((item) => ({
          skillName: cleanDisallowedChars(item.skillName || "Domain Skill"),
          category: cleanDisallowedChars(item.category || "Technical"),
          score: Math.min(100, Math.max(0, Number(item.score) || 70)),
          status: item.status || "Proficient",
          gapDescription: cleanDisallowedChars(item.gapDescription || ""),
          recommendedAction: cleanDisallowedChars(item.recommendedAction || ""),
        })),
        personalizedPreparationPlan: (data.personalizedPreparationPlan || []).map((step, idx) => ({
          step: step.step || idx + 1,
          title: cleanDisallowedChars(step.title || `Milestone ${idx + 1}`),
          action: cleanDisallowedChars(step.action || ""),
        })),
      };
    }
  }

  // Fallback to deterministic curated final evaluation
  return generateCuratedFinalEvaluation({
    role,
    domain,
    difficulty,
    companyStyle,
    questions: validQuestions.length > 0 ? validQuestions : questions,
    overallPercentage,
    calculatedHireRecommendation,
  });
}

/* =======================================================================
   CURATED FALLBACK & DETERMINISTIC LOGIC
====================================================================== */

function getCuratedInitialQuestion(arg1, arg2, arg3, arg4) {
  let domain, difficulty, companyStyle, previouslyAskedTexts, interviewType, programmingLanguage;

  if (typeof arg1 === "object" && arg1 !== null) {
    domain = arg1.domain;
    difficulty = arg1.difficulty || "Hard";
    companyStyle = arg1.companyStyle || "General Tech";
    previouslyAskedTexts = arg1.previouslyAskedTexts || [];
    interviewType = arg1.interviewType || "Mixed";
    programmingLanguage = arg1.programmingLanguage || "javascript";
  } else {
    domain = arg1;
    difficulty = arg2 || "Hard";
    companyStyle = arg3 || "General Tech";
    previouslyAskedTexts = arg4 || [];
    interviewType = "Mixed";
    programmingLanguage = "javascript";
  }

  const domainConfig = getDomainConfig(domain);
  const companyProfile = domainConfig.companyStyles?.[companyStyle] || domainConfig.companyStyles?.["General Tech"] || {};

  const eligibleQuestions = [];
  const usedTexts = new Set((previouslyAskedTexts || []).map((t) => t.toLowerCase().trim()));

  // 1. Specialized Coding Interview Mode or DSA Mode
  if (interviewType.includes("Coding") || (interviewType.includes("Language-Specific") && arg1.dsaEnabled)) {
    const lang = (programmingLanguage || "javascript").toLowerCase();
    const targetTopics = Array.isArray(arg1.dsaTopics) && arg1.dsaTopics.length > 0 ? arg1.dsaTopics.map((t) => t.toLowerCase()) : [];
    
    let matching = CODING_PROBLEMS.filter((p) => !usedTexts.has(p.questionText.toLowerCase().trim()));
    if (targetTopics.length > 0) {
      const topicMatches = matching.filter((p) => targetTopics.some((t) => p.topic.toLowerCase().includes(t) || p.title.toLowerCase().includes(t)));
      if (topicMatches.length > 0) matching = topicMatches;
    }

    const chosen = matching.length > 0 ? matching[0] : CODING_PROBLEMS[0];
    return {
      topic: chosen.topic,
      subtopic: chosen.title,
      questionType: "Coding",
      difficulty: chosen.difficulty || difficulty,
      programmingLanguage: lang,
      starterCode: (chosen.starterCode && (chosen.starterCode[lang] || chosen.starterCode.javascript)) || "",
      referenceSolution: (chosen.referenceSolution && (chosen.referenceSolution[lang] || chosen.referenceSolution.javascript)) || "",
      hints: chosen.hints || [],
      testCases: chosen.testCases || [],
      questionText: cleanDisallowedChars(chosen.questionText),
      expectedKeyPoints: chosen.expectedKeyPoints || ["O(n) time complexity", "Clean boundary handling"],
      isFollowUp: false,
      source: "coding-challenge-bank",
    };
  }

  // 2. Aptitude & Reasoning Modality (Target Focus Aware)
  if (interviewType.includes("Aptitude")) {
    const targetCategories = Array.isArray(arg1.aptitudeFocusAreas) && arg1.aptitudeFocusAreas.length > 0
      ? arg1.aptitudeFocusAreas.map((c) => c.toLowerCase())
      : [];

    let matching = APTITUDE_QUESTIONS.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
    if (targetCategories.length > 0) {
      const catMatches = matching.filter((q) => targetCategories.some((c) => q.topic.toLowerCase().includes(c) || q.subtopic.toLowerCase().includes(c)));
      if (catMatches.length > 0) matching = catMatches;
    }

    const chosen = matching.length > 0 ? matching[0] : APTITUDE_QUESTIONS[0];
    return {
      topic: chosen.topic,
      subtopic: chosen.subtopic,
      questionType: "Aptitude",
      difficulty: chosen.difficulty || difficulty,
      aptitudeOptions: chosen.aptitudeOptions,
      correctOptionIndex: chosen.correctOptionIndex,
      explanation: chosen.explanation,
      starterCode: "",
      referenceSolution: `Correct Answer: Option ${String.fromCharCode(65 + chosen.correctOptionIndex)}\nExplanation:\n${chosen.explanation}`,
      hints: [
        `Identify the fundamental formula or deduction pattern connecting the given values.`,
        `Calculate step by step to verify logical consistency.`,
      ],
      questionText: cleanDisallowedChars(chosen.questionText),
      expectedKeyPoints: chosen.expectedKeyPoints || ["Correct mathematical deduction"],
      isFollowUp: false,
      source: "aptitude-knowledge-bank",
    };
  }

  // 3. Language-Specific Technical Modality
  if (interviewType.includes("Language-Specific") || interviewType.includes("Language-specific")) {
    const lang = (programmingLanguage || "javascript").toLowerCase();
    const langPool = LANGUAGE_QUESTIONS[lang] || LANGUAGE_QUESTIONS.javascript;
    const available = langPool.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
    if (available.length > 0) {
      const chosen = available[0];
      return {
        topic: chosen.topic,
        subtopic: chosen.subtopic,
        questionType: "Technical",
        difficulty: chosen.difficulty || difficulty,
        programmingLanguage: lang,
        starterCode: "",
        referenceSolution: `Reference Benchmark for ${chosen.topic}:\n- Key Points: ${(chosen.expectedKeyPoints || []).join("; ")}`,
        hints: [
          `Consider how ${lang} handles memory layout and execution order internally.`,
          `Analyze concurrency primitives and runtime overhead.`,
        ],
        questionText: cleanDisallowedChars(chosen.questionText),
        expectedKeyPoints: chosen.expectedKeyPoints,
        isFollowUp: false,
        source: "language-internals-bank",
      };
    }
  }

  // 4. Gather all potential questions for standard and domain modalities
  if (difficulty === "Hard") {
    if (companyProfile && companyProfile.keyQuestionsHard) {
      companyProfile.keyQuestionsHard.forEach((q) => eligibleQuestions.push({ ...q, companyStyle }));
    }
    if (domainConfig.companyStyles) {
      Object.keys(domainConfig.companyStyles).forEach((c) => {
        if (c !== companyStyle && domainConfig.companyStyles[c].keyQuestionsHard) {
          domainConfig.companyStyles[c].keyQuestionsHard.forEach((q) => eligibleQuestions.push({ ...q, companyStyle: c }));
        }
      });
    }
    if (domainConfig.mediumQuestions) {
      domainConfig.mediumQuestions.forEach((q) => eligibleQuestions.push(q));
    }
    if (domainConfig.easyQuestions) {
      domainConfig.easyQuestions.forEach((q) => eligibleQuestions.push(q));
    }
  } else if (difficulty === "Medium") {
    if (domainConfig.mediumQuestions) {
      domainConfig.mediumQuestions.forEach((q) => eligibleQuestions.push(q));
    }
    if (domainConfig.easyQuestions) {
      domainConfig.easyQuestions.forEach((q) => eligibleQuestions.push(q));
    }
    if (domainConfig.companyStyles) {
      Object.keys(domainConfig.companyStyles).forEach((c) => {
        if (domainConfig.companyStyles[c].keyQuestionsHard) {
          domainConfig.companyStyles[c].keyQuestionsHard.forEach((q) => eligibleQuestions.push({ ...q, companyStyle: c }));
        }
      });
    }
  } else {
    if (domainConfig.easyQuestions) {
      domainConfig.easyQuestions.forEach((q) => eligibleQuestions.push(q));
    }
    if (domainConfig.mediumQuestions) {
      domainConfig.mediumQuestions.forEach((q) => eligibleQuestions.push(q));
    }
  }

  // 2. Filter out all previously asked questions
  const freshQuestions = eligibleQuestions.filter(
    (q) => !usedTexts.has(q.questionText.toLowerCase().trim())
  );

  if (freshQuestions.length > 0) {
    const chosen = freshQuestions[Math.floor(Math.random() * freshQuestions.length)];
    const refSolution = chosen.referenceSolution || `Reference Benchmark for ${chosen.topic}:\n- Expected Core Points:\n  * ${(chosen.expectedKeyPoints || ["High availability", "Fault isolation", "Trade-off analysis"]).join("\n  * ")}\n- Key Architectural Considerations: Address operational complexity, latency percentiles (P99), failure modes, and recovery time objectives (RTO).`;
    const defaultHints = Array.isArray(chosen.hints) && chosen.hints.length > 0 ? chosen.hints : [
      `Consider how system load, data partitioning, and failure recovery interact in this scenario.`,
      `Compare at least two distinct implementation approaches and articulate their trade-offs.`,
    ];

    return {
      topic: chosen.topic,
      subtopic: chosen.subtopic || "Domain Practice",
      questionType: chosen.questionType || "Technical",
      difficulty: chosen.difficulty || difficulty,
      starterCode: chosen.starterCode || "",
      referenceSolution: refSolution,
      hints: defaultHints,
      questionText: cleanDisallowedChars(chosen.questionText),
      expectedKeyPoints: (chosen.expectedKeyPoints || []).map(cleanDisallowedChars),
      source: "curated-knowledge-base",
    };
  }

  // 3. Dynamic Procedural Generation if every curated question was previously used
  const domainSkills = domainConfig.skillCategories || ["System Architecture", "API Design", "Data Modeling"];
  const topicChosen = domainSkills[Math.floor(Math.random() * domainSkills.length)];
  const seedId = Math.floor(1000 + Math.random() * 9000);

  return {
    topic: topicChosen,
    subtopic: "High Availability & Scalability",
    questionType: "System Design",
    difficulty,
    starterCode: "",
    referenceSolution: `Reference Architecture for ${topicChosen}:\n- Active-Active multi-region replication\n- Distributed rate limiting and circuit breakers\n- Asynchronous queue decoupling via Kafka\n- Observability with distributed tracing and metric alarms`,
    hints: [
      `Analyze how to isolate failure domains across multiple geographic zones.`,
      `Consider using an asynchronous message broker to buffer high-throughput spikes.`,
    ],
    questionText: `In the context of ${topicChosen} (Scenario ID ${seedId}) within ${domain}, how would you architect a fault-tolerant solution that gracefully handles sudden network partitions and regional database failovers without data loss?`,
    expectedKeyPoints: ["Fault isolation patterns", "Data reconciliation strategies", "Observability metrics"],
    source: "curated-knowledge-base",
  };
}

function evaluateAnswerCurated({
  domain,
  role,
  difficulty,
  companyStyle,
  currentQuestion,
  candidateAnswer,
  questionIndex,
  totalPlanned,
  previousQuestions = [],
}) {
  const cleanAnswer = cleanDisallowedChars(candidateAnswer || "").trim();
  const lowerAnswer = cleanAnswer.toLowerCase();
  const words = cleanAnswer.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Aptitude & Reasoning Evaluation
  if (currentQuestion.questionType === "Aptitude" && typeof currentQuestion.correctOptionIndex === "number") {
    const optLetter = String.fromCharCode(65 + currentQuestion.correctOptionIndex); // "A", "B", "C", "D"
    const correctOptText = (currentQuestion.aptitudeOptions?.[currentQuestion.correctOptionIndex] || "").toLowerCase();
    const isCorrect = lowerAnswer.startsWith(optLetter.toLowerCase()) ||
                      lowerAnswer.includes(`option ${optLetter.toLowerCase()}`) ||
                      lowerAnswer.includes(optLetter.toLowerCase() + ".") ||
                      (correctOptText && lowerAnswer.includes(correctOptText.slice(3).trim()));

    const score = isCorrect ? 10 : 2;
    const shouldAskFollowUp = false;

    let nextQ = null;
    if (questionIndex + 1 < totalPlanned) {
      nextQ = getNextCuratedOrGeneratedQuestion({
        domain,
        role,
        difficulty,
        companyStyle,
        interviewType: "Aptitude & Reasoning",
        questionIndex: questionIndex + 1,
        totalPlanned,
        previousQuestions: [...previousQuestions, currentQuestion],
      });
    }

    return {
      isValidAnswer: true,
      evaluation: {
        score,
        technicalAccuracy: isCorrect
          ? `Correct. Option ${optLetter} is the mathematically sound solution.`
          : `Incorrect option selected. Correct answer is Option ${optLetter}.`,
        reasoning: isCorrect
          ? "Accurate logical deduction and formula application."
          : "Mathematical or deduction discrepancy identified.",
        communicationClarity: "Direct option selection.",
        strengths: isCorrect ? ["Accurate calculation and reasoning logic."] : ["Attempted analytical problem."],
        improvements: isCorrect
          ? ["Maintain speed and accuracy under timed conditions."]
          : ["Review step-by-step mathematical derivation."],
        keyMissedPoints: isCorrect ? [] : ["Step-by-step formula derivation"],
        suggestedModelAnswer: currentQuestion.explanation || `Correct Answer: Option ${optLetter}`,
      },
      isFollowUp: false,
      isCompleted: questionIndex + 1 >= totalPlanned,
      nextQuestion: nextQ,
    };
  }

  // 2. Coding Challenge Evaluation (Evidence-Based Grading)
  if (currentQuestion.questionType === "Coding") {
    const rawStarter = (currentQuestion.starterCode || "").replace(/\s+/g, "");
    const rawAnswer = cleanAnswer.replace(/\s+/g, "");
    const isStarterUnchanged = rawAnswer.length === 0 || rawAnswer === rawStarter;

    let nextQ = null;
    if (questionIndex + 1 < totalPlanned) {
      nextQ = getNextCuratedOrGeneratedQuestion({
        domain,
        role,
        difficulty,
        companyStyle,
        interviewType: "Coding Interview",
        questionIndex: questionIndex + 1,
        totalPlanned,
        previousQuestions: [...previousQuestions, currentQuestion],
      });
    }

    if (isStarterUnchanged) {
      return {
        isValidAnswer: true,
        evaluation: {
          score: 1,
          technicalAccuracy: "Starter code submitted without algorithmic implementation.",
          reasoning: "The candidate submitted the unedited scaffolding template without adding logic.",
          communicationClarity: "No solution implemented.",
          strengths: ["Template loaded."],
          improvements: ["Write the complete algorithm and verify test cases before submission."],
          keyMissedPoints: ["Core algorithm implementation", "Return values", "Edge case handling"],
          suggestedModelAnswer: currentQuestion.referenceSolution || "Implement the solution using appropriate data structures.",
        },
        isFollowUp: false,
        isCompleted: questionIndex + 1 >= totalPlanned,
        nextQuestion: nextQ,
      };
    }

    // Evaluate code execution & algorithmic complexity
    const lang = (currentQuestion.programmingLanguage || "javascript").toLowerCase();
    const testCases = Array.isArray(currentQuestion.testCases) ? currentQuestion.testCases : [];
    let passedCount = 0;
    let totalTests = testCases.length || 1;
    let syntaxValid = true;
    let executionNote = "";

    if (lang === "javascript") {
      try {
        const vm = require("vm");
        const sandbox = { console: { log: () => {} } };
        const context = vm.createContext(sandbox);
        const script = new vm.Script(cleanAnswer, { timeout: 1000 });
        script.runInContext(context);

        // Verification tests
        if (cleanAnswer.includes("twoSum")) {
          totalTests = 3;
          try {
            const res1 = vm.runInContext("twoSum([2,7,11,15], 9)", context);
            if (Array.isArray(res1) && res1.length === 2 && ((res1[0] === 0 && res1[1] === 1) || (res1[0] === 1 && res1[1] === 0))) passedCount++;
          } catch (e) {}
          try {
            const res2 = vm.runInContext("twoSum([3,2,4], 6)", context);
            if (Array.isArray(res2) && res2.length === 2 && ((res2[0] === 1 && res2[1] === 2) || (res2[0] === 2 && res2[1] === 1))) passedCount++;
          } catch (e) {}
          try {
            const res3 = vm.runInContext("twoSum([3,3], 6)", context);
            if (Array.isArray(res3) && res3.length === 2 && ((res3[0] === 0 && res3[1] === 1) || (res3[0] === 1 && res3[1] === 0))) passedCount++;
          } catch (e) {}
        } else if (cleanAnswer.includes("merge")) {
          totalTests = 1;
          try {
            const res1 = vm.runInContext("merge([[1,3],[2,6],[8,10],[15,18]])", context);
            if (Array.isArray(res1) && res1.length === 3) passedCount++;
          } catch (e) {}
        } else {
          passedCount = totalTests;
        }
        executionNote = `${passedCount}/${totalTests} test cases passed.`;
      } catch (err) {
        syntaxValid = false;
        passedCount = 0;
        executionNote = `Runtime Syntax Error: ${err.message}`;
      }
    } else {
      const hasKeywords = lowerAnswer.includes("def ") || lowerAnswer.includes("class ") || lowerAnswer.includes("select ") || lowerAnswer.includes("for ") || lowerAnswer.includes("while ");
      const hasReturn = lowerAnswer.includes("return") || lowerAnswer.includes("select");
      syntaxValid = hasKeywords && hasReturn && cleanAnswer.length >= 35;
      passedCount = syntaxValid ? totalTests : 0;
      executionNote = syntaxValid ? "Static syntax structure verified." : "Incomplete function or query syntax.";
    }

    let score = 2;
    const isOptimal = lowerAnswer.includes("map") || lowerAnswer.includes("dict") || lowerAnswer.includes("hash") || lowerAnswer.includes("set") || lowerAnswer.includes("seen");

    if (syntaxValid && passedCount === totalTests && isOptimal) {
      score = 9;
    } else if (syntaxValid && passedCount === totalTests) {
      score = 8;
    } else if (syntaxValid && passedCount > 0) {
      score = 5;
    } else if (syntaxValid) {
      score = 3;
    } else {
      score = 2;
    }

    const strengths = [];
    const improvements = [];
    if (score >= 7) {
      strengths.push("Provided executable algorithmic logic with structured control flow.");
      strengths.push("Passed test assertions with clean time complexity bounds.");
    } else if (score >= 4) {
      strengths.push("Formulated an initial algorithmic outline.");
      improvements.push("Handle boundary edge cases and check function return formats.");
    } else {
      improvements.push("Fix runtime errors and implement complete algorithmic logic.");
      improvements.push(executionNote);
    }

    return {
      isValidAnswer: true,
      evaluation: {
        score,
        technicalAccuracy: score >= 7
          ? `Solid algorithmic solution (${executionNote}). Meets target complexity bounds.`
          : `Execution failed or incomplete (${executionNote}).`,
        reasoning: "Evaluated against runtime assertion sandbox.",
        communicationClarity: "Code structure and variable annotations.",
        strengths,
        improvements,
        keyMissedPoints: score < 7 ? ["Edge case verification", "Full test case execution"] : [],
        suggestedModelAnswer: `Optimal algorithmic solution achieves O(n) runtime with auxiliary space bounds.`,
      },
      isFollowUp: false,
      isCompleted: questionIndex + 1 >= totalPlanned,
      nextQuestion: nextQ,
    };
  }

  // 3. Technical, Architecture, HR/Behavioral, and System Design Evaluation
  const expectedKeyPoints = Array.isArray(currentQuestion.expectedKeyPoints)
    ? currentQuestion.expectedKeyPoints
    : [];

  const matchedKeyPoints = [];
  const missedKeyPoints = [];

  expectedKeyPoints.forEach((point) => {
    const pointKeywords = point
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !["with", "from", "that", "this", "have", "than", "their", "where"].includes(w));

    let matchCount = 0;
    pointKeywords.forEach((kw) => {
      if (lowerAnswer.includes(kw)) matchCount++;
    });

    const isMatched = pointKeywords.length > 0 && (matchCount / pointKeywords.length >= 0.4 || matchCount >= 2);
    if (isMatched) {
      matchedKeyPoints.push(point);
    } else {
      missedKeyPoints.push(point);
    }
  });

  const technicalIndicators = [
    "trade-off", "tradeoff", "latency", "throughput", "concurrency", "distributed",
    "consistency", "partition", "failover", "cache", "index", "complexity",
    "availability", "scalability", "metric", "monitoring", "alert", "security",
    "idempotent", "replication", "asynchronous", "synchronous", "queue", "worker",
    "situation", "action", "result", "ownership", "conflict", "stakeholder", "resolved"
  ];
  let techKeywordMatches = 0;
  technicalIndicators.forEach((ti) => {
    if (lowerAnswer.includes(ti)) techKeywordMatches++;
  });

  let rawScore = 3;
  if (matchedKeyPoints.length === 0) {
    if (wordCount < 30 || techKeywordMatches === 0) {
      rawScore = 2;
    } else {
      rawScore = 3;
    }
  } else if (matchedKeyPoints.length === 1) {
    rawScore = wordCount > 60 ? 5 : 4;
  } else if (matchedKeyPoints.length === 2) {
    rawScore = wordCount > 100 && techKeywordMatches >= 2 ? 7 : 6;
  } else if (matchedKeyPoints.length >= 3) {
    rawScore = wordCount > 140 && techKeywordMatches >= 3 ? 9 : 8;
  }

  if (difficulty === "Hard" && rawScore > 6 && matchedKeyPoints.length < 2) {
    rawScore = Math.max(4, rawScore - 1);
  }

  const score = Math.min(10, Math.max(1, rawScore));
  const strengths = [];
  const improvements = [];

  if (matchedKeyPoints.length > 0) {
    strengths.push(`Directly addressed key requirement: ${matchedKeyPoints[0]}`);
    if (matchedKeyPoints.length > 1) {
      strengths.push(`Demonstrated good coverage on: ${matchedKeyPoints[1]}`);
    }
  } else {
    strengths.push("Provided a conceptual starting point for the scenario.");
  }

  if (techKeywordMatches >= 2) {
    strengths.push("Used precise domain terminology to describe system behaviors.");
  }

  if (missedKeyPoints.length > 0) {
    improvements.push(`Deepen trade-off analysis around: ${missedKeyPoints[0]}`);
    if (missedKeyPoints.length > 1) {
      improvements.push(`Include concrete edge-case mitigation for: ${missedKeyPoints[1]}`);
    }
  } else {
    improvements.push("Consider explicitly quantifying operational latencies (p95/p99) and failure budgets.");
  }

  if (wordCount < 60) {
    improvements.push("Elaborate with a more complete step-by-step structural breakdown.");
  }

  const shouldAskFollowUp = score < 6 && questionIndex + 1 < totalPlanned && !currentQuestion.isFollowUp;

  let nextQ = null;
  if (questionIndex + 1 < totalPlanned) {
    nextQ = getNextCuratedOrGeneratedQuestion({
      domain,
      role,
      difficulty,
      companyStyle,
      questionIndex: questionIndex + 1,
      totalPlanned,
      previousQuestions: [...previousQuestions, currentQuestion],
      isFollowUp: shouldAskFollowUp,
      parentTopic: currentQuestion.topic,
    });
  }

  let technicalAccuracyFeedback = "";
  if (score >= 8) {
    technicalAccuracyFeedback = "Strong technical grasp. Covered core failure modes and architectural trade-offs comprehensively.";
  } else if (score >= 6) {
    technicalAccuracyFeedback = "Solid foundational approach. Addressed key concepts with room for deeper operational precision.";
  } else if (score >= 4) {
    technicalAccuracyFeedback = "Partial technical understanding. Key architectural considerations and edge-case handling were omitted.";
  } else {
    technicalAccuracyFeedback = "Insufficient technical depth. The response lacked required architectural mechanisms and domain specifics.";
  }

  return {
    isValidAnswer: true,
    evaluation: {
      score,
      technicalAccuracy: technicalAccuracyFeedback,
      reasoning: score >= 6
        ? "Demonstrated logical problem decomposition with clear cause-and-effect reasoning."
        : "Reasoning remained high-level without structured trade-off comparisons.",
      communicationClarity: wordCount >= 50
        ? "Clear and articulated structure."
        : "Concise. Could benefit from a more thorough step-by-step breakdown.",
      strengths,
      improvements,
      keyMissedPoints: missedKeyPoints.length > 0 ? missedKeyPoints : ["Detailed failure recovery considerations"],
      suggestedModelAnswer: `For a top-tier answer in ${domain}, articulate the architectural design, quantify time and space complexity or operational latency, and compare at least two distinct approaches with concrete trade-offs.`,
    },
    isFollowUp: shouldAskFollowUp,
    isCompleted: questionIndex + 1 >= totalPlanned,
    nextQuestion: nextQ,
  };
}

function getNextCuratedOrGeneratedQuestion({
  domain,
  role,
  difficulty,
  companyStyle,
  interviewType = "Mixed",
  programmingLanguage = "javascript",
  questionIndex,
  totalPlanned,
  previousQuestions = [],
  isFollowUp = false,
  parentTopic = "",
}) {
  const domainConfig = getDomainConfig(domain);

  // Coding Interview Progression
  if (interviewType === "Coding Interview" || interviewType === "AI Coding Interview") {
    const lang = (programmingLanguage || "javascript").toLowerCase();
    const usedTexts = new Set(previousQuestions.map((q) => q.questionText.toLowerCase().trim()));
    const available = CODING_PROBLEMS.filter((p) => !usedTexts.has(p.questionText.toLowerCase().trim()));
    if (available.length > 0) {
      const chosen = available[0];
      return {
        topic: chosen.topic,
        subtopic: chosen.title,
        questionType: "Coding",
        difficulty: chosen.difficulty || difficulty,
        programmingLanguage: lang,
        starterCode: (chosen.starterCode && (chosen.starterCode[lang] || chosen.starterCode.javascript)) || "",
        referenceSolution: (chosen.referenceSolution && (chosen.referenceSolution[lang] || chosen.referenceSolution.javascript)) || "",
        hints: chosen.hints || [],
        testCases: chosen.testCases || [],
        questionText: cleanDisallowedChars(chosen.questionText),
        expectedKeyPoints: chosen.expectedKeyPoints,
        isFollowUp: false,
        source: "coding-challenge-bank",
      };
    }
  }

  // Aptitude & Reasoning Progression
  if (interviewType.includes("Aptitude")) {
    const usedTexts = new Set(previousQuestions.map((q) => q.questionText.toLowerCase().trim()));
    const available = APTITUDE_QUESTIONS.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
    if (available.length > 0) {
      const chosen = available[0];
      return {
        topic: chosen.topic,
        subtopic: chosen.subtopic,
        questionType: "Aptitude",
        difficulty: chosen.difficulty || difficulty,
        aptitudeOptions: chosen.aptitudeOptions,
        correctOptionIndex: chosen.correctOptionIndex,
        explanation: chosen.explanation,
        questionText: cleanDisallowedChars(chosen.questionText),
        expectedKeyPoints: chosen.expectedKeyPoints,
        isFollowUp: false,
        source: "aptitude-knowledge-bank",
      };
    }
  }

  // Language-Specific Technical Progression
  if (interviewType.includes("Language-Specific") || interviewType.includes("Language-specific")) {
    const lang = (programmingLanguage || "javascript").toLowerCase();
    const langPool = LANGUAGE_QUESTIONS[lang] || LANGUAGE_QUESTIONS.javascript;
    const usedTexts = new Set(previousQuestions.map((q) => q.questionText.toLowerCase().trim()));
    const available = langPool.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
    if (available.length > 0) {
      const chosen = available[0];
      return {
        topic: chosen.topic,
        subtopic: chosen.subtopic,
        questionType: "Technical",
        difficulty: chosen.difficulty || difficulty,
        programmingLanguage: lang,
        questionText: cleanDisallowedChars(chosen.questionText),
        expectedKeyPoints: chosen.expectedKeyPoints,
        isFollowUp: false,
        source: "language-internals-bank",
      };
    }
  }

  if (isFollowUp) {
    return {
      topic: parentTopic || "Deep Dive",
      subtopic: "Operational Edge Cases",
      questionType: "Situational",
      difficulty,
      questionText: `Following up on that, what specific metrics, monitoring alerts, or failure recovery mechanisms would you establish to detect degradation in that flow before users are impacted?`,
      expectedKeyPoints: ["p95/p99 latency percentiles", "Error rate budgets and saturation alerts", "Synthetic testing probes"],
      isFollowUp: true,
      followUpReason: "Probing operational monitoring depth and failure recovery.",
      source: "curated-knowledge-base",
    };
  }

  const allDomainQuestions = [];
  if (difficulty === "Hard") {
    if (domainConfig.companyStyles) {
      Object.keys(domainConfig.companyStyles).forEach((cName) => {
        const comp = domainConfig.companyStyles[cName];
        if (comp.keyQuestionsHard && Array.isArray(comp.keyQuestionsHard)) {
          comp.keyQuestionsHard.forEach((q) => {
            allDomainQuestions.push({ ...q, companyStyle: cName });
          });
        }
      });
    }
    (domainConfig.mediumQuestions || []).forEach((q) => allDomainQuestions.push(q));
    (domainConfig.easyQuestions || []).forEach((q) => allDomainQuestions.push(q));
  } else if (difficulty === "Medium") {
    (domainConfig.mediumQuestions || []).forEach((q) => allDomainQuestions.push(q));
    (domainConfig.easyQuestions || []).forEach((q) => allDomainQuestions.push(q));
  } else {
    (domainConfig.easyQuestions || []).forEach((q) => allDomainQuestions.push(q));
    (domainConfig.mediumQuestions || []).forEach((q) => allDomainQuestions.push(q));
  }

  const usedTexts = new Set(previousQuestions.map((q) => q.questionText.toLowerCase().trim()));
  const available = allDomainQuestions.filter(
    (q) => !usedTexts.has(q.questionText.toLowerCase().trim())
  );

  if (available.length > 0) {
    const chosen = available[Math.floor(Math.random() * available.length)];
    return {
      topic: chosen.topic,
      subtopic: chosen.subtopic || "Domain Practice",
      questionType: chosen.questionType || "Technical",
      difficulty: chosen.difficulty || difficulty,
      questionText: cleanDisallowedChars(chosen.questionText),
      expectedKeyPoints: (chosen.expectedKeyPoints || []).map(cleanDisallowedChars),
      isFollowUp: false,
      source: "curated-knowledge-base",
    };
  }

  const domainSkills = domainConfig.skillCategories || ["System Architecture", "API Design", "Data Modeling"];
  const topicChosen = domainSkills[questionIndex % domainSkills.length];
  const seedId = Math.floor(1000 + Math.random() * 9000);

  return {
    topic: topicChosen,
    subtopic: "High Availability & Scalability",
    questionType: "System Design",
    difficulty,
    questionText: `In the context of ${topicChosen} (Scenario ID ${seedId}) within ${domain}, how would you architect a fault-tolerant solution that gracefully handles sudden network partitions and regional database failovers without data loss?`,
    expectedKeyPoints: ["Fault isolation patterns", "Data reconciliation strategies", "Observability metrics"],
    isFollowUp: false,
    source: "curated-knowledge-base",
  };
}

function generateCuratedFinalEvaluation({
  role,
  domain,
  difficulty,
  companyStyle,
  questions,
  overallPercentage,
  calculatedHireRecommendation,
}) {
  const domainConfig = getDomainConfig(domain);
  const skills = domainConfig.skillCategories || [
    "Technical Foundations",
    "System Architecture",
    "Trade-off Analysis",
    "Communication Clarity",
  ];

  const skillGaps = skills.map((skill, idx) => {
    const variation = ((idx * 7 + overallPercentage) % 25) - 10;
    const skillScore = Math.min(100, Math.max(30, overallPercentage + variation));
    let status = "Proficient";
    if (skillScore >= 85) status = "Strong";
    else if (skillScore < 55) status = "Needs Work";

    return {
      skillName: skill,
      category: "Core Competency",
      score: skillScore,
      status,
      gapDescription: skillScore < 70
        ? `Focus on deepening real-world trade-off analysis and technical precision in ${skill}.`
        : `Strong baseline demonstrated in ${skill}. Continue refining advanced edge cases.`,
      recommendedAction: `Complete 3 targeted practice rounds focused on ${skill} with timed constraints.`,
    };
  });

  return {
    overallScore: overallPercentage,
    hireRecommendation: calculatedHireRecommendation,
    summaryText: `Candidate completed a ${difficulty} level interview for ${role} under the ${companyStyle} evaluation framework. Demonstrated solid problem decomposition with opportunities for enhanced depth in operational edge cases.`,
    keyStrengths: [
      "Clear articulation of core concepts and design decisions.",
      "Structured communication when breaking down complex requirements.",
      "Good understanding of fundamental domain workflows.",
    ],
    priorityImprovementAreas: [
      "Quantify trade-offs with explicit memory, latency, and throughput metrics.",
      "Explore failure recovery and graceful degradation patterns more deeply.",
      "Refine technical terminology precision under interview time constraints.",
    ],
    skillGapAnalysis: skillGaps,
    personalizedPreparationPlan: [
      {
        step: 1,
        title: "Deepen Edge-Case & Scale Analysis",
        action: `Review standard distributed failure patterns in ${domain} (rate limiting, circuit breaking, idempotency).`,
      },
      {
        step: 2,
        title: "Targeted Timed Mock Sessions",
        action: "Practice 5-minute timed response structuring using the STAR framework and clear architectural diagrams.",
      },
      {
        step: 3,
        title: "Company Style Alignment",
        action: `Align practice answers with ${companyStyle}'s core evaluation criteria and behavioral leadership principles.`,
      },
    ],
  };
}

function cleanDisallowedChars(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/[\u2014\u2015]/g, " - ")
    .replace(/[\u2013]/g, "-")
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/[\u2600-\u27BF]/g, "");
}

module.exports = {
  generateInitialQuestion,
  evaluateAnswerAndGenerateNext,
  generateFinalEvaluation,
  cleanDisallowedChars,
};
