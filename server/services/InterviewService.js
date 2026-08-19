/*
 * AI Interview Service
 * PrepQuarters Core Orchestration Engine
 * Integrates AI reasoning models with adaptive questioning,
 * domain intelligence, intelligent follow-ups, and skill-gap analysis.
 */

const {
  DOMAINS,
  CODING_PROBLEMS,
  APTITUDE_QUESTIONS,
  LANGUAGE_QUESTIONS,
  HR_BEHAVIORAL_QUESTIONS,
  SYSTEM_DESIGN_SCENARIOS,
  getDomainConfig,
  getCompanyStyleProfile,
} = require("./DomainKnowledge");

const {
  callAiChatCompletion,
} = require("./AiProviderService");

const {
  executeCodeSandbox,
} = require("./CodingSandboxService");

const {
  validateCandidateAnswer,
} = require("./AnswerValidationService");

const { cleanDisallowedChars } = require("./SanitizationHelper");

function isAiConfigured() {
  return Boolean(
    (process.env.NVIDIA_NIM_API_KEY && process.env.NVIDIA_NIM_API_KEY.trim()) ||
    (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) ||
    (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY.trim()) ||
    (process.env.XAI_API_KEY && process.env.XAI_API_KEY.trim()) ||
    (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim())
  );
}

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
  const usedTexts = new Set((previouslyAskedTexts || []).map((t) => t.toLowerCase().trim()));

  // 1. Specialized Coding Interview Mode or Language-Specific with DSA
  if (interviewType.includes("Coding") || (interviewType.includes("Language-Specific") && dsaEnabled)) {
    const lang = (programmingLanguage || "javascript").toLowerCase();
    const targetTopics = Array.isArray(dsaTopics) && dsaTopics.length > 0 ? dsaTopics.map((t) => t.toLowerCase()) : [];
    
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
    
    let matching = APTITUDE_QUESTIONS.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
    if (difficulty === "Easy") {
      const easyMatches = matching.filter((q) => q.difficulty === "Easy");
      if (easyMatches.length > 0) matching = easyMatches;
    } else if (difficulty === "Medium") {
      const medMatches = matching.filter((q) => q.difficulty === "Medium");
      if (medMatches.length > 0) matching = medMatches;
    }

    if (targetCategories.length > 0) {
      const catMatches = matching.filter((q) => targetCategories.some((c) => q.subtopic.toLowerCase().includes(c) || q.topic.toLowerCase().includes(c)));
      if (catMatches.length > 0) matching = catMatches;
    }

    const selected = matching.length > 0 ? matching[0] : APTITUDE_QUESTIONS[0];

    return {
      topic: selected.topic,
      subtopic: selected.subtopic,
      questionType: "Aptitude",
      difficulty: selected.difficulty || difficulty,
      aptitudeOptions: selected.aptitudeOptions || [],
      correctOptionIndex: selected.correctOptionIndex,
      explanation: selected.explanation,
      questionText: cleanDisallowedChars(selected.questionText),
      expectedKeyPoints: [`Correct analytical deduction: Option ${String.fromCharCode(65 + (selected.correctOptionIndex || 0))}`],
      source: "aptitude-knowledge-bank",
    };
  }

  // 3. HR & Behavioral Mode (Strictly Non-Technical)
  if (interviewType.includes("HR") || interviewType.includes("Behavioral")) {
    if (isAiConfigured()) {
      const systemPrompt = `You are a senior HR director and executive behavioral interviewer at ${companyStyle}.
Target Role: ${role}
Difficulty Level: ${difficulty}
Interview Modality: HR / Behavioral (Situational & Leadership)

CRITICAL RULES:
1. Ask exactly ONE realistic workplace situational or behavioral scenario.
2. STRICTLY FORBIDDEN: DO NOT ask coding, programming, algorithms, data structures, system implementation, or technical architecture questions.
3. Focus strictly on: teamwork, handling conflict, leadership, taking ownership of mistakes, handling pressure, communication with stakeholders, adaptability under shifting requirements, or workplace ethics.
4. Output strict JSON with NO em dashes and NO emojis:
{
  "topic": "Conflict Resolution",
  "subtopic": "Handling Disagreement",
  "questionType": "Behavioral",
  "questionText": "The behavioral question text",
  "expectedKeyPoints": [
    "Context and Situation framing (STAR method)",
    "Direct personal Action and ownership taken",
    "Constructive outcome, reflection, or learning"
  ]
}`;

      const userPrompt = `Generate a fresh, realistic behavioral interview scenario for a candidate targeting ${role}. Focus on workplace collaboration, conflict resolution, leadership, or handling project pressure. (Seed: ${Date.now()}_${Math.random()})`;

      const nimResult = await callAiChatCompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        maxTokens: 600,
        jsonMode: true,
      });

      if (nimResult.success && nimResult.json && nimResult.json.questionText) {
        return {
          topic: nimResult.json.topic || "Behavioral Competency",
          subtopic: nimResult.json.subtopic || "Workplace Scenario",
          questionType: "Behavioral",
          difficulty,
          questionText: cleanDisallowedChars(nimResult.json.questionText),
          expectedKeyPoints: Array.isArray(nimResult.json.expectedKeyPoints)
            ? nimResult.json.expectedKeyPoints.map(cleanDisallowedChars)
            : ["Situation framing", "Personal ownership and action", "Measurable outcome"],
          isFollowUp: false,
          source: "ai-provider",
        };
      }
    }

    // Curated HR fallback
    const freshHr = HR_BEHAVIORAL_QUESTIONS.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
    const chosenHr = freshHr.length > 0 ? freshHr[0] : HR_BEHAVIORAL_QUESTIONS[0];
    return {
      topic: chosenHr.topic,
      subtopic: chosenHr.subtopic,
      questionType: "Behavioral",
      difficulty: chosenHr.difficulty || difficulty,
      questionText: cleanDisallowedChars(chosenHr.questionText),
      expectedKeyPoints: (chosenHr.expectedKeyPoints || []).map(cleanDisallowedChars),
      source: "curated-hr-bank",
    };
  }

  // 4. System Design Mode (Strictly Architectural Design Thinking - NO CODING)
  if (interviewType.includes("System Design")) {
    if (isAiConfigured()) {
      const systemPrompt = `You are a Principal Enterprise Architect conducting a System Design Interview for domain: ${domain}, role: ${role}.
Difficulty Level: ${difficulty}
Company Focus: ${companyProfile.focus}

CRITICAL RULES:
1. Ask exactly ONE high-level system architecture and design scenario tailored specifically to ${domain} and ${role}.
2. STRICTLY FORBIDDEN: DO NOT ask the candidate to write code, implement algorithms, solve DSA problems, or write syntax functions.
3. Focus strictly on design thinking: requirements clarification, system component boundaries, data flow, scale (throughput/latency), storage choices, caching, message queues, consistency, partition failure handling, and observability.
4. Output strict JSON with NO em dashes and NO emojis:
{
  "topic": "System Architecture",
  "subtopic": "Distributed System Design",
  "questionType": "System Design",
  "questionText": "The architectural scenario question text",
  "expectedKeyPoints": [
    "Component boundaries and data flow decomposition",
    "Scalability, caching, and storage trade-offs",
    "Failure isolation, partition handling, and consistency guarantees"
  ]
}`;

      const userPrompt = `Generate a fresh, domain-adapted system design scenario for ${role} in ${domain}. Focus on high-scale architecture, trade-offs, and failure handling. (Seed: ${Date.now()}_${Math.random()})`;

      const nimResult = await callAiChatCompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        maxTokens: 600,
        jsonMode: true,
      });

      if (nimResult.success && nimResult.json && nimResult.json.questionText) {
        return {
          topic: nimResult.json.topic || "System Architecture",
          subtopic: nimResult.json.subtopic || "High Availability & Scale",
          questionType: "System Design",
          difficulty,
          questionText: cleanDisallowedChars(nimResult.json.questionText),
          expectedKeyPoints: Array.isArray(nimResult.json.expectedKeyPoints)
            ? nimResult.json.expectedKeyPoints.map(cleanDisallowedChars)
            : ["Component boundaries", "Scalability trade-offs", "Failure domain isolation"],
          isFollowUp: false,
          source: "ai-provider",
        };
      }
    }

    // Curated System Design fallback
    const domainScenarios = SYSTEM_DESIGN_SCENARIOS[domain] || SYSTEM_DESIGN_SCENARIOS["Software Engineering"] || [];
    const freshSd = domainScenarios.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
    const chosenSd = freshSd.length > 0 ? freshSd[0] : (domainScenarios[0] || SYSTEM_DESIGN_SCENARIOS["Software Engineering"][0]);
    return {
      topic: chosenSd.topic,
      subtopic: chosenSd.subtopic,
      questionType: "System Design",
      difficulty: chosenSd.difficulty || difficulty,
      questionText: cleanDisallowedChars(chosenSd.questionText),
      expectedKeyPoints: (chosenSd.expectedKeyPoints || []).map(cleanDisallowedChars),
      source: "curated-system-design-bank",
    };
  }

  // 5. Language-Specific Technical Mode
  if (interviewType.includes("Language-Specific") && !dsaEnabled) {
    const lang = (programmingLanguage || "javascript").toLowerCase();
    const langQuestions = LANGUAGE_QUESTIONS[lang] || LANGUAGE_QUESTIONS.javascript || [];
    let matching = langQuestions.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
    
    if (difficulty === "Hard") {
      const hardMatches = matching.filter((q) => q.difficulty === "Hard");
      if (hardMatches.length > 0) matching = hardMatches;
    } else if (difficulty === "Easy") {
      const easyMatches = matching.filter((q) => q.difficulty === "Easy");
      if (easyMatches.length > 0) matching = easyMatches;
    }

    if (matching.length > 0) {
      const selected = matching[0];
      return {
        topic: selected.topic,
        subtopic: `${selected.language} Internals`,
        questionType: "Technical",
        difficulty: selected.difficulty || difficulty,
        programmingLanguage: lang,
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

  // 6. General / Technical / Voice Mock Mode
  if (isAiConfigured()) {
    const excludeList = (previouslyAskedTexts || [])
      .slice(0, 15)
      .map((t) => `"${t}"`)
      .join("; ");

    const systemPrompt = `You are a senior hiring manager and principal interviewer at ${companyStyle}.
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
   - "Medium": Focus on practical system design, service boundaries, database design, caching, or failure handling.
   - "Easy": Focus on foundational concepts, fundamental definitions, and core architectural components.
4. Output strict JSON with NO em dashes and NO emojis:
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

    const nimResult = await callAiChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      maxTokens: 600,
      jsonMode: true,
    });

    if (nimResult.success && nimResult.json && nimResult.json.questionText) {
      return {
        topic: nimResult.json.topic || "Core Fundamentals",
        subtopic: nimResult.json.subtopic || "Domain Concepts",
        questionType: nimResult.json.questionType || "Technical",
        difficulty,
        questionText: cleanDisallowedChars(nimResult.json.questionText),
        expectedKeyPoints: Array.isArray(nimResult.json.expectedKeyPoints)
          ? nimResult.json.expectedKeyPoints.map(cleanDisallowedChars)
          : ["Comprehensive conceptual explanation", "Trade-off analysis"],
        isFollowUp: false,
        source: "ai-provider",
      };
    }
  }

  // Curated Fallback
  return getCuratedInitialQuestion({
    domain,
    role,
    difficulty,
    companyStyle,
    previouslyAskedTexts,
    interviewType,
    programmingLanguage,
  });
}

/**
 * Evaluates candidate answer with strict relevance gate and ZERO-score rule.
 */
async function evaluateAnswerAndGenerateNext({
  session,
  currentQuestion,
  candidateAnswer,
  timeSpentSeconds = 0,
}) {
  const {
    role = "Software Engineer",
    domain = "Software Engineering",
    difficulty = "Hard",
    companyStyle = "General Tech",
    interviewType = "Mixed",
    totalQuestionsPlanned = 5,
    currentQuestionIndex = 0,
    questions = [],
  } = session || {};

  const totalPlanned = totalQuestionsPlanned || 5;
  const questionIndex = currentQuestionIndex || 0;
  const previousQuestions = questions.slice(0, questionIndex);
  const domainConfig = getDomainConfig(domain);
  const companyProfile = getCompanyStyleProfile(domain, companyStyle);

  const cleanAnswer = cleanDisallowedChars(candidateAnswer || "").trim();

  // Step 1: Sanity & basic validation
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
        score: 0,
        relevant: false,
        technicallyMeaningful: false,
        technicalAccuracy: validation.reason,
        reasoning: "Answer lacked substantive content.",
        communicationClarity: "Please re-attempt the scenario with structured reasoning.",
        strengths: [],
        improvements: [validation.retryPrompt],
        keyMissedPoints: currentQuestion.expectedKeyPoints || ["Structured problem-solving explanation"],
        suggestedModelAnswer: "",
      },
      isFollowUp: false,
      isCompleted: false,
      nextQuestion: null,
    };
  }

  // Step 2: LLM Evaluation with Relevance Classification Gate & Zero Score Rule
  if (isAiConfigured()) {
    const isBehavioral = currentQuestion.questionType === "Behavioral" || (interviewType && (interviewType.includes("HR") || interviewType.includes("Behavioral")));
    const isSystemDesign = currentQuestion.questionType === "System Design" || (interviewType && interviewType.includes("System Design"));

    const historySummary = previousQuestions
      .map((q, idx) => `Q${idx + 1} [Topic: ${q.topic}]: "${q.questionText}"\nScore: ${q.evaluation?.score || "N/A"}/10`)
      .join("\n\n");

    const alreadyAskedQuestionsList = [...previousQuestions, currentQuestion]
      .map((q) => `"${q.questionText}" (Topic: ${q.topic})`)
      .join("; ");

    let systemPrompt = "";

    if (isBehavioral) {
      systemPrompt = `You are a Senior HR Director and Executive Bar Raiser at ${companyStyle}.
Target Role: ${role}
Interview Modality: HR & Behavioral (Situational & Leadership)

You are evaluating the candidate's answer to this behavioral scenario:
Question: "${currentQuestion.questionText}"
Topic: "${currentQuestion.topic}"
Expected Evaluation Points: ${JSON.stringify(currentQuestion.expectedKeyPoints || [])}

Interview History so far:
${historySummary || "This is the first scenario."}

CRITICAL BEHAVIORAL EVALUATION RULES:
1. Focus strictly on behavioral traits: STAR framework (Situation, Task, Action, Result), personal accountability, constructive conflict resolution, empathy, leadership, and communication clarity.
2. DO NOT evaluate or penalize for missing programming code or technical concepts.
3. ZERO SCORE RULE: Gibberish, unrelated text, or empty answers receive Score = 0.
4. PARTIAL CREDIT (3-5): For responses that describe a situation but miss clear personal action or measurable results.
5. HIGH MARKS (7-10): For structured, mature responses demonstrating ownership, collaborative resolution, and clear learning outcomes.

Output valid JSON matching this schema (NO em dashes, NO emojis):
{
  "relevant": true,
  "technicallyMeaningful": true,
  "evaluation": {
    "score": 8,
    "technicalAccuracy": "Analysis of behavioral structure, ownership, and STAR approach",
    "reasoning": "Assessment of interpersonal conflict resolution and professional maturity",
    "communicationClarity": "Analysis of delivery, conciseness, and professional tone",
    "strengths": ["Specific behavioral strength 1", "Specific behavioral strength 2"],
    "improvements": ["Specific behavioral improvement 1", "Specific behavioral improvement 2"],
    "keyMissedPoints": ["Key point missed 1"],
    "suggestedModelAnswer": "A concise STAR-structured model answer"
  },
  "shouldAskFollowUp": false,
  "followUpReason": "",
  "nextQuestion": {
    "topic": "Teamwork & Collaboration",
    "subtopic": "Cross-Functional Alignment",
    "questionType": "Behavioral",
    "difficulty": "${difficulty}",
    "questionText": "The next behavioral question text",
    "expectedKeyPoints": ["Point 1", "Point 2", "Point 3"]
  }
}`;
    } else if (isSystemDesign) {
      systemPrompt = `You are a Principal Enterprise Architect conducting a System Design Interview at ${companyStyle}.
Domain: ${domain}
Target Role: ${role}
Difficulty Level: ${difficulty}

You are evaluating the candidate's architecture design for this scenario:
Question: "${currentQuestion.questionText}"
Topic: "${currentQuestion.topic}"
Expected Architecture Points: ${JSON.stringify(currentQuestion.expectedKeyPoints || [])}

CRITICAL SYSTEM DESIGN EVALUATION RULES:
1. QUESTION ECHO / REPETITION CHECK (MANDATORY): If the candidate's answer merely repeats, echoes, or paraphrases the question (or states 'I will design this system' without proposing component boundaries, data stores, queues, or trade-offs), set "relevant": false, "technicallyMeaningful": false, and "score": 0. Repeating the question earns ZERO points.
2. TECHNICAL CORRECTNESS OVER WORD COUNT: Never award points simply because an answer contains many words or buzzwords. If the architecture is fundamentally wrong, off-topic, or an empty keyword dump, score must be 0 or 1/10.
3. ZERO SCORE RULE (Score = 0): Gibberish, unrelated text, copied questions, or buzzword dumps receive Score = 0.
4. PARTIAL CREDIT (3-5): For naming basic components without analyzing scaling trade-offs, partitions, latency bounds, or failure modes.
5. HIGH MARKS (7-10): Reserved strictly for comprehensive architectures addressing scale (QPS/RPS), storage partitioning, caching layers, message queues, and failure recovery trade-offs.

Output valid JSON matching this schema (NO em dashes, NO emojis):
{
  "relevant": true,
  "technicallyMeaningful": true,
  "evaluation": {
    "score": 8,
    "technicalAccuracy": "Analysis of architecture design, component choices, and trade-offs",
    "reasoning": "Assessment of scaling, caching, and failure isolation decomposition",
    "communicationClarity": "Analysis of architectural terminology and clarity",
    "strengths": ["Specific strength 1", "Specific strength 2"],
    "improvements": ["Specific improvement 1", "Specific improvement 2"],
    "keyMissedPoints": ["Key point missed 1", "Key point missed 2"],
    "suggestedModelAnswer": "A concise, high-standard architecture design breakdown"
  },
  "shouldAskFollowUp": false,
  "followUpReason": "",
  "nextQuestion": {
    "topic": "System Architecture",
    "subtopic": "High Scale Service",
    "questionType": "System Design",
    "difficulty": "${difficulty}",
    "questionText": "The next system design question text",
    "expectedKeyPoints": ["Point 1", "Point 2", "Point 3"]
  }
}`;
    } else {
      systemPrompt = `You are a principal technical interviewer and bar raiser at ${companyStyle}.
Domain: ${domain}
Role: ${role}
Current Difficulty: ${difficulty}
Company Focus: ${companyProfile.focus}

You are evaluating the candidate's answer to this specific question:
Question: "${currentQuestion.questionText}"
Topic: "${currentQuestion.topic}"
Expected Key Points: ${JSON.stringify(currentQuestion.expectedKeyPoints || [])}

CRITICAL ZERO-SCORE & RIGOROUS TECHNICAL EVALUATION RULES (MANDATORY):
TIER 1: RELEVANCE, REPETITION & TAUTOLOGY GATE:
- QUESTION REPETITION / ECHO: If the candidate merely repeats, paraphrases, or echoes the question (e.g. saying "a hash map works by hashing keys and avoiding collisions"), or gives vague tautological statements without explaining CONCRETE MECHANISMS, you MUST set:
  * "relevant": false
  * "technicallyMeaningful": false
  * "score": 0
- AMBIGUOUS FLUFF / BUZZWORD DUMP: If the candidate uses confident-sounding words without explaining HOW things work internally or why they chose them, score MUST be 0 or 1.
- If the answer is unrelated, fundamentally wrong, nonsensical, or generic filler:
  * set "relevant": false
  * "technicallyMeaningful": false
  * "score": 0

TIER 2: ACCURATE MERIT-BASED SCORING:
- Score 0: Question repetition, paraphrase, gibberish, surrender, or ambiguous non-technical fluff.
- Score 1-3: Superficial answer naming a concept but completely lacking depth, internal mechanics, or clarity.
- Score 4-6: Basic correct explanation covering standard definitions, but missing edge cases, trade-offs, or complexity analysis.
- Score 7-8: Strong, technically accurate explanation with concrete mechanics (e.g. bucket arrays, hash calculation, chaining/probing, load factor, O(1) avg / O(n) worst case).
- Score 9-10: Flawless, staff-level answer with deep internal mechanics, memory layout, trade-offs, and edge case mitigation. NEVER give 9 or 10 to short or ambiguous answers!
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
  "followUpReason": "",
  "nextQuestion": {
    "topic": "Different Topic Name",
    "subtopic": "Subtopic Name",
    "questionType": "Technical",
    "difficulty": "${difficulty}",
    "questionText": "The fresh, distinct question text",
    "expectedKeyPoints": ["Point 1", "Point 2", "Point 3"]
  }
}`;
    }

    const userPrompt = `Candidate Answer:\n"${cleanAnswer}"\n\nEvaluate this answer and determine the next scenario or follow-up.`;

    const nimResult = await callAiChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      maxTokens: 1400,
      jsonMode: true,
    });

    if (nimResult.success && nimResult.json && nimResult.json.evaluation) {
      const evalData = nimResult.json.evaluation;
      const isRelevant = nimResult.json.relevant !== false;
      const isMeaningful = nimResult.json.technicallyMeaningful !== false;
      let rawScore = Number(evalData.score) || 0;

      // Programmatic Keyword Dump & Disconnected Token Detector
      const words = cleanAnswer.split(/\s+/).filter(Boolean);
      const predicateVerbs = [
        "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
        "can", "could", "should", "would", "will", "may", "might", "must",
        "use", "uses", "using", "used", "implement", "implements", "implementing", "design", "designs",
        "handles", "handled", "handling", "fails", "failing", "failed", "store", "stores", "storing",
        "replicate", "replicating", "replicated", "process", "processes", "processing", "send", "sends",
        "receive", "receives", "synchronize", "synchronizing", "ensure", "ensuring", "mitigate",
        "track", "tracking", "reject", "rejecting", "mix", "bake", "make", "makes", "hit", "hits",
        "drop", "drops", "block", "blocked", "run", "runs", "set", "sets", "get", "gets", "put",
        "keep", "keeps", "take", "takes", "write", "read", "call", "check", "need", "work",
        "talked", "discussed", "decided", "aligned", "collaborated", "managed", "resolved", "learned"
      ];
      const connectingWords = ["with", "to", "for", "by", "in", "when", "if", "because", "that", "and", "so", "as", "from", "on", "across", "between", "of", "into", "it", "so", "i", "my", "we", "our"];
      const lowerClean = cleanAnswer.toLowerCase();
      const predicateMatches = predicateVerbs.filter((v) => new RegExp(`\\b${v}\\b`, "i").test(lowerClean)).length;
      const connectorMatches = connectingWords.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(lowerClean)).length;
      const isKeywordDump = words.length >= 8 && (predicateMatches === 0 || connectorMatches === 0);

      if (isKeywordDump || !isRelevant || !isMeaningful || rawScore === 0) {
        rawScore = 0;
      }

      // If answer is very brief (< 25 words) for technical scenarios, cap score at partial credit (max 5)
      if (!isBehavioral && rawScore > 5 && words.length < 25 && (currentQuestion.expectedKeyPoints || []).length >= 3) {
        rawScore = 5;
      }

      const finalScore = Math.min(10, Math.max(0, rawScore));
      const shouldFollowUp = Boolean(nimResult.json.shouldAskFollowUp && questionIndex + 1 < totalPlanned);

      const cleanedEval = {
        score: finalScore,
        relevant: isRelevant && finalScore > 0,
        technicallyMeaningful: isMeaningful && finalScore > 0,
        technicalAccuracy: cleanDisallowedChars(evalData.technicalAccuracy || (finalScore === 0 ? "The answer did not address the specific requirements of the scenario." : "Answer evaluated.")),
        reasoning: cleanDisallowedChars(evalData.reasoning || (finalScore === 0 ? "No valid reasoning demonstrated for this scenario." : "Reasoning analyzed.")),
        communicationClarity: cleanDisallowedChars(evalData.communicationClarity || "Response analyzed."),
        strengths: finalScore > 0 ? (evalData.strengths || ["Addressed the core subject."]).map(cleanDisallowedChars) : [],
        improvements: (evalData.improvements || ["Address the exact scenario requirements."]).map(cleanDisallowedChars),
        keyMissedPoints: (evalData.keyMissedPoints || []).map(cleanDisallowedChars),
        suggestedModelAnswer: cleanDisallowedChars(evalData.suggestedModelAnswer || ""),
      };

      let nextQ = null;
      if (questionIndex + 1 < totalPlanned && nimResult.json.nextQuestion && nimResult.json.nextQuestion.questionText) {
        nextQ = {
          topic: nimResult.json.nextQuestion.topic || currentQuestion.topic,
          subtopic: nimResult.json.nextQuestion.subtopic || "Scenario",
          questionType: isBehavioral ? "Behavioral" : (isSystemDesign ? "System Design" : (nimResult.json.nextQuestion.questionType || "Technical")),
          difficulty: nimResult.json.nextQuestion.difficulty || difficulty,
          questionText: cleanDisallowedChars(nimResult.json.nextQuestion.questionText),
          expectedKeyPoints: (nimResult.json.nextQuestion.expectedKeyPoints || []).map(cleanDisallowedChars),
          isFollowUp: shouldFollowUp,
          followUpReason: cleanDisallowedChars(nimResult.json.followUpReason || ""),
          source: "ai-provider",
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

  // Fallback to deterministic rubric evaluation
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
 * Deterministic rubric evaluator enforcing ZERO-score rule on empty/irrelevant/wrong answers.
 */
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

  // 1. Aptitude & Reasoning Evaluation
  if (currentQuestion.questionType === "Aptitude" && typeof currentQuestion.correctOptionIndex === "number") {
    const optLetter = String.fromCharCode(65 + currentQuestion.correctOptionIndex);
    const correctOptText = (currentQuestion.aptitudeOptions?.[currentQuestion.correctOptionIndex] || "").toLowerCase();
    const isCorrect = lowerAnswer.startsWith(optLetter.toLowerCase()) ||
                      lowerAnswer.includes(`option ${optLetter.toLowerCase()}`) ||
                      lowerAnswer.includes(optLetter.toLowerCase() + ".") ||
                      (correctOptText && lowerAnswer.includes(correctOptText.slice(3).trim()));

    const score = isCorrect ? 10 : 0; // ZERO score on incorrect choice

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
        relevant: true,
        technicallyMeaningful: true,
        technicalAccuracy: isCorrect
          ? `Correct. Option ${optLetter} is the mathematically sound solution.`
          : `Incorrect option selected. Correct answer is Option ${optLetter}.`,
        reasoning: isCorrect
          ? "Accurate logical deduction and formula application."
          : "Mathematical or deduction discrepancy identified.",
        communicationClarity: "Direct option selection.",
        strengths: isCorrect ? ["Accurate calculation and reasoning logic."] : [],
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

  // 2. Coding Challenge Evaluation
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
          score: 0,
          relevant: false,
          technicallyMeaningful: false,
          technicalAccuracy: "Starter code submitted without algorithmic implementation.",
          reasoning: "The candidate submitted the unedited scaffolding template without adding logic.",
          communicationClarity: "No solution implemented.",
          strengths: [],
          improvements: ["Write the complete algorithm and verify test cases before submission."],
          keyMissedPoints: ["Core algorithm implementation", "Return values", "Edge case handling"],
          suggestedModelAnswer: currentQuestion.referenceSolution || "Implement the solution using appropriate data structures.",
        },
        isFollowUp: false,
        isCompleted: questionIndex + 1 >= totalPlanned,
        nextQuestion: nextQ,
      };
    }

    const isOptimal = lowerAnswer.includes("map") || lowerAnswer.includes("dict") || lowerAnswer.includes("hash") || lowerAnswer.includes("set") || lowerAnswer.includes("seen");
    const hasComplexity = lowerAnswer.includes("o(n)") || lowerAnswer.includes("o(1)") || lowerAnswer.includes("linear");
    const isSpokenExplanation = words.length >= 8 && (lowerAnswer.includes("approach") || lowerAnswer.includes("iterate") || lowerAnswer.includes("loop") || isOptimal);

    let score = 0;
    if (isSpokenExplanation && isOptimal && hasComplexity) {
      score = 9;
    } else if (isSpokenExplanation && isOptimal) {
      score = 8;
    } else if (isSpokenExplanation && (lowerAnswer.includes("two pointer") || lowerAnswer.includes("sort"))) {
      score = 6;
    } else if (isSpokenExplanation) {
      score = 4;
    } else {
      score = 0;
    }

    return {
      isValidAnswer: true,
      evaluation: {
        score,
        relevant: score > 0,
        technicallyMeaningful: score > 0,
        technicalAccuracy: score >= 7
          ? "Solid algorithmic solution meeting target complexity bounds."
          : (score > 0 ? "Partial algorithmic reasoning articulated." : "Code did not solve the algorithmic problem."),
        reasoning: "Evaluated against algorithmic complexity and data structure criteria.",
        communicationClarity: "Algorithmic logic structure.",
        strengths: score >= 7 ? ["Articulated sound algorithmic approach and data structure selection."] : [],
        improvements: score < 7 ? ["Formulate optimal O(n) algorithmic approach using Hash Maps or two pointers."] : [],
        keyMissedPoints: score < 7 ? ["Optimal time complexity", "Auxiliary space bounds"] : [],
        suggestedModelAnswer: currentQuestion.referenceSolution || "Optimal algorithm achieves O(n) time complexity.",
      },
      isFollowUp: false,
      isCompleted: questionIndex + 1 >= totalPlanned,
      nextQuestion: nextQ,
    };
  }

  // 3. Behavioral & Situational HR Evaluation (STAR Methodology, Non-Technical)
  if (currentQuestion.questionType === "Behavioral") {
    const behavioralStrengths = [];
    const behavioralImprovements = [];

    const hasOwnership = lowerAnswer.includes("i ") || lowerAnswer.includes("my ") || lowerAnswer.includes("decided") || lowerAnswer.includes("resolved") || lowerAnswer.includes("organized") || lowerAnswer.includes("facilitated") || lowerAnswer.includes("took ownership");
    const hasCollaboration = lowerAnswer.includes("team") || lowerAnswer.includes("colleague") || lowerAnswer.includes("stakeholder") || lowerAnswer.includes("partner") || lowerAnswer.includes("discussed") || lowerAnswer.includes("aligned") || lowerAnswer.includes("listened");
    const hasOutcome = lowerAnswer.includes("result") || lowerAnswer.includes("outcome") || lowerAnswer.includes("learned") || lowerAnswer.includes("prevent") || lowerAnswer.includes("improved") || lowerAnswer.includes("delivered") || lowerAnswer.includes("completed");

    let bScore = 0;
    if (words.length < 15) {
      bScore = 0;
      behavioralImprovements.push("Use the STAR format (Situation, Task, Action, Result) to provide a complete response.");
    } else if (hasOwnership && hasCollaboration && hasOutcome && words.length >= 35) {
      bScore = 9;
      behavioralStrengths.push("Excellent STAR decomposition with clear personal ownership, collaboration, and measurable outcomes.");
    } else if (hasOwnership && (hasCollaboration || hasOutcome) && words.length >= 25) {
      bScore = 7;
      behavioralStrengths.push("Good situational ownership and constructive resolution.");
      behavioralImprovements.push("Elaborate on the long-term post-resolution outcome and retrospective takeaways.");
    } else if (hasOwnership || hasCollaboration) {
      bScore = 5;
      behavioralImprovements.push("Structure your answer to explicitly describe the Action you personally took and the final Result achieved.");
    } else {
      bScore = 0;
      behavioralImprovements.push("Focus on describing a specific workplace scenario and your direct personal actions.");
    }

    let nextQ = null;
    if (questionIndex + 1 < totalPlanned) {
      nextQ = getNextCuratedOrGeneratedQuestion({
        domain,
        role,
        difficulty,
        companyStyle,
        interviewType: "HR & Behavioral",
        questionIndex: questionIndex + 1,
        totalPlanned,
        previousQuestions: [...previousQuestions, currentQuestion],
      });
    }

    return {
      isValidAnswer: true,
      evaluation: {
        score: bScore,
        relevant: bScore > 0,
        technicallyMeaningful: true,
        technicalAccuracy: bScore >= 7
          ? "Strong behavioral response with sound professional judgment and structured communication."
          : (bScore > 0 ? "Addressed the scenario with partial STAR structure." : "Response lacked concrete situational ownership."),
        reasoning: "Evaluated against situational ownership, collaboration, and STAR framework criteria.",
        communicationClarity: "Evaluated on empathetic phrasing and executive clarity.",
        strengths: behavioralStrengths,
        improvements: behavioralImprovements,
        keyMissedPoints: bScore < 7 ? ["Explicit STAR result/outcome", "Specific personal action taken"] : [],
        suggestedModelAnswer: "High standard response frames the Situation concisely, describes personal Action clearly, and quantifies the Result and key learning.",
      },
      isFollowUp: bScore < 5,
      isCompleted: questionIndex + 1 >= totalPlanned,
      nextQuestion: nextQ,
    };
  }

  // 4. Technical, Architecture, and System Design Evaluation
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

    const isMatched = pointKeywords.length > 0 && (matchCount / pointKeywords.length >= 0.35 || matchCount >= 2);
    if (isMatched) {
      matchedKeyPoints.push(point);
    } else {
      missedKeyPoints.push(point);
    }
  });

  // Relevance Check against Question Context
  const qKeywords = (currentQuestion.questionText + " " + currentQuestion.topic)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !["what", "which", "where", "how", "would", "explain", "describe"].includes(w));

  let qKeywordMatches = 0;
  qKeywords.forEach((kw) => {
    if (lowerAnswer.includes(kw)) qKeywordMatches++;
  });

  // Programmatic Keyword Dump & Disconnected Token Detector
  const predicateVerbs = [
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "can", "could", "should", "would", "will", "may", "might", "must",
    "use", "uses", "using", "used", "implement", "implements", "implementing", "design", "designs",
    "handles", "handled", "handling", "fails", "failing", "failed", "store", "stores", "storing",
    "replicate", "replicating", "replicated", "process", "processes", "processing", "send", "sends",
    "receive", "receives", "synchronize", "synchronizing", "ensure", "ensuring", "mitigate",
    "track", "tracking", "reject", "rejecting", "mix", "bake", "make", "makes", "hit", "hits",
    "drop", "drops", "block", "blocked", "run", "runs", "set", "sets", "get", "gets", "put",
    "keep", "keeps", "take", "takes", "write", "read", "call", "check", "need", "work"
  ];
  const connectingWords = ["with", "to", "for", "by", "in", "when", "if", "because", "that", "and", "so", "as", "from", "on", "across", "between", "of", "into", "it"];
  const lowerClean = cleanAnswer.toLowerCase();
  const predicateMatches = predicateVerbs.filter((v) => new RegExp(`\\b${v}\\b`, "i").test(lowerClean)).length;
  const connectorMatches = connectingWords.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(lowerClean)).length;
  const isKeywordDump = words.length >= 8 && (predicateMatches === 0 || connectorMatches === 0);

  // Strict Zero-Score Gate in Fallback
  let score = 0;
  if (isKeywordDump || (matchedKeyPoints.length === 0 && qKeywordMatches === 0)) {
    score = 0; // Zero marks for completely unrelated, empty, or keyword dump text
  } else if (matchedKeyPoints.length === 0) {
    score = 0; // Keyword mentions alone without matching expected concepts receive ZERO
  } else if (matchedKeyPoints.length === 1) {
    score = 4; // Partial credit for genuine partial understanding
  } else if (matchedKeyPoints.length === 2) {
    // If brief incomplete answer, cap at partial credit (5)
    score = words.length < 30 ? 5 : 7;
  } else if (matchedKeyPoints.length >= 3) {
    score = words.length < 35 ? 6 : 9;
  }

  const strengths = [];
  const improvements = [];

  if (score >= 4 && matchedKeyPoints.length > 0) {
    strengths.push(`Directly addressed key requirement: ${matchedKeyPoints[0]}`);
    if (matchedKeyPoints.length > 1) {
      strengths.push(`Demonstrated coverage on: ${matchedKeyPoints[1]}`);
    }
  }

  if (missedKeyPoints.length > 0) {
    improvements.push(`Deepen technical analysis around: ${missedKeyPoints[0]}`);
    if (missedKeyPoints.length > 1) {
      improvements.push(`Include concrete implementation details for: ${missedKeyPoints[1]}`);
    }
  } else if (score === 0) {
    improvements.push(`Focus your answer directly on addressing the scenario: "${currentQuestion.questionText}"`);
  }

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
      isFollowUp: score < 5,
      parentTopic: currentQuestion.topic,
    });
  }

  let technicalAccuracy = "";
  if (score >= 8) {
    technicalAccuracy = "Strong technical grasp. Covered core failure modes and architectural trade-offs comprehensively.";
  } else if (score >= 6) {
    technicalAccuracy = "Solid foundational approach. Addressed key concepts with room for deeper operational precision.";
  } else if (score >= 4) {
    technicalAccuracy = "Partial technical understanding. Key architectural considerations and edge-case handling were omitted.";
  } else {
    technicalAccuracy = "The response did not demonstrate valid technical reasoning for this scenario.";
  }

  return {
    isValidAnswer: true,
    evaluation: {
      score,
      relevant: score > 0,
      technicallyMeaningful: score > 0,
      technicalAccuracy,
      reasoning: score > 0 ? "Technical reasoning analyzed." : "No valid technical reasoning demonstrated.",
      communicationClarity: "Analyzed based on clarity of concepts.",
      strengths,
      improvements,
      keyMissedPoints: missedKeyPoints.slice(0, 3),
      suggestedModelAnswer: currentQuestion.referenceSolution || "Address the core architectural trade-offs and operational failure modes.",
    },
    isFollowUp: score < 5,
    isCompleted: questionIndex + 1 >= totalPlanned,
    nextQuestion: nextQ,
  };
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

  const validQuestions = questions.filter((q) => q.evaluation && typeof q.evaluation.score === "number");
  const scores = validQuestions.map((q) => q.evaluation.score);
  const avgScoreOutOf10 = scores.length > 0
    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
    : 0;
  const overallPercentage = Math.round(avgScoreOutOf10 * 10);

  let calculatedHireRecommendation = "No Hire";
  if (overallPercentage >= 85) calculatedHireRecommendation = "Strong Hire";
  else if (overallPercentage >= 70) calculatedHireRecommendation = "Hire";
  else if (overallPercentage >= 50) calculatedHireRecommendation = "Leaning Hire";
  else calculatedHireRecommendation = "No Hire";

  if (isAiConfigured()) {
    const fullTranscript = questions
      .map((q, i) => `Q${i + 1} [${q.topic} - ${q.difficulty}]: ${q.questionText}\nCandidate Answer: ${q.candidateAnswer}\nScore: ${q.evaluation?.score || 0}/10\nFeedback: ${q.evaluation?.technicalAccuracy}`)
      .join("\n\n");

    const systemPrompt = `You are the lead bar raiser and hiring committee member at ${companyStyle}.
Domain: ${domain}
Role: ${role}
Difficulty Level: ${difficulty}
Candidate Total Score: ${overallPercentage}/100

Transcript of Full Interview:
${fullTranscript}

TASK:
Provide a rigorous post-interview evaluation report.
1. Determine hire recommendation: "Strong Hire", "Hire", "Leaning Hire", or "No Hire".
2. Write a concise executive summary of candidate performance.
3. List 3 to 4 key strengths demonstrated.
4. List 3 priority improvement areas.

Output valid JSON matching this schema (NO em dashes, NO emojis):
{
  "overallScore": ${overallPercentage},
  "hireRecommendation": "${calculatedHireRecommendation}",
  "summaryText": "Executive summary of performance",
  "keyStrengths": ["Strength 1", "Strength 2"],
  "priorityImprovementAreas": ["Area 1", "Area 2"],
  "skillGapAnalysis": [
    {
      "skillName": "System Architecture",
      "category": "Technical",
      "score": ${overallPercentage},
      "status": "Proficient",
      "gapDescription": "Description of gap"
    }
  ],
  "learningRoadmap": [
    {
      "phase": "Phase 1",
      "title": "Action title",
      "action": "Detailed study action"
    }
  ]
}`;

    const nimResult = await callAiChatCompletion({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Generate the final comprehensive evaluation and skill-gap report." },
      ],
      temperature: 0.3,
      maxTokens: 1500,
      jsonMode: true,
    });

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
          score: Math.min(100, Math.max(0, Number(item.score) || overallPercentage)),
          status: cleanDisallowedChars(item.status || "Assessed"),
          gapDescription: cleanDisallowedChars(item.gapDescription || ""),
        })),
        learningRoadmap: (data.learningRoadmap || []).map((item) => ({
          phase: cleanDisallowedChars(item.phase || "Phase 1"),
          title: cleanDisallowedChars(item.title || "Target Area"),
          action: cleanDisallowedChars(item.action || "Study core concepts"),
        })),
      };
    }
  }

  // Fallback to curated final evaluation
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
  const strengths = [];
  const weaknesses = [];

  questions.forEach((q) => {
    if (q.evaluation?.strengths) {
      q.evaluation.strengths.forEach((s) => strengths.push(s));
    }
    if (q.evaluation?.improvements) {
      q.evaluation.improvements.forEach((w) => weaknesses.push(w));
    }
  });

  const uniqueStrengths = Array.from(new Set(strengths)).slice(0, 4);
  const uniqueWeaknesses = Array.from(new Set(weaknesses)).slice(0, 4);

  return {
    overallScore: overallPercentage,
    hireRecommendation: calculatedHireRecommendation,
    summaryText: `Candidate completed mock interview for ${role} in ${domain}. Technical reasoning evaluated with an overall score of ${overallPercentage}/100.`,
    keyStrengths: uniqueStrengths.length > 0 ? uniqueStrengths : ["Demonstrated technical problem-solving initiative."],
    priorityImprovementAreas: uniqueWeaknesses.length > 0 ? uniqueWeaknesses : ["Deepen edge-case mitigation and operational latency trade-offs."],
    skillGapAnalysis: (domainConfig.skillCategories || ["System Design", "Coding", "Problem Solving"]).map((skill) => ({
      skillName: skill,
      category: "Technical",
      score: overallPercentage,
      status: overallPercentage >= 70 ? "Proficient" : "Developing",
      gapDescription: overallPercentage >= 70 ? "Meets domain expectations." : "Review core patterns and performance trade-offs.",
    })),
    learningRoadmap: [
      {
        phase: "Phase 1: Foundations",
        title: `${domain} Core Principles`,
        action: "Review data modeling, latency benchmarks, and concurrency primitives.",
      },
      {
        phase: "Phase 2: Scale & Reliability",
        title: "High-Throughput Systems",
        action: "Practice distributed partitioning, rate limiting, and failure domain isolation.",
      },
    ],
  };
}

function getCuratedInitialQuestion({
  domain,
  difficulty = "Hard",
  companyStyle = "General Tech",
  previouslyAskedTexts = [],
  interviewType = "Mixed",
  programmingLanguage = "javascript",
}) {
  const domainConfig = getDomainConfig(domain);
  const eligibleQuestions = [];
  const usedTexts = new Set((previouslyAskedTexts || []).map((t) => t.toLowerCase().trim()));

  if (interviewType.includes("HR") || interviewType.includes("Behavioral")) {
    const freshHr = HR_BEHAVIORAL_QUESTIONS.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
    const chosen = freshHr.length > 0 ? freshHr[0] : HR_BEHAVIORAL_QUESTIONS[0];
    return {
      topic: chosen.topic,
      subtopic: chosen.subtopic,
      questionType: "Behavioral",
      difficulty: chosen.difficulty || difficulty,
      questionText: cleanDisallowedChars(chosen.questionText),
      expectedKeyPoints: (chosen.expectedKeyPoints || []).map(cleanDisallowedChars),
      source: "curated-hr-bank",
    };
  }

  if (interviewType.includes("System Design")) {
    const domainScenarios = SYSTEM_DESIGN_SCENARIOS[domain] || SYSTEM_DESIGN_SCENARIOS["Software Engineering"] || [];
    const freshSd = domainScenarios.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
    const chosen = freshSd.length > 0 ? freshSd[0] : (domainScenarios[0] || SYSTEM_DESIGN_SCENARIOS["Software Engineering"][0]);
    return {
      topic: chosen.topic,
      subtopic: chosen.subtopic,
      questionType: "System Design",
      difficulty: chosen.difficulty || difficulty,
      questionText: cleanDisallowedChars(chosen.questionText),
      expectedKeyPoints: (chosen.expectedKeyPoints || []).map(cleanDisallowedChars),
      source: "curated-system-design-bank",
    };
  }

  if (difficulty === "Hard" && domainConfig.hardQuestions) {
    domainConfig.hardQuestions.forEach((q) => eligibleQuestions.push(q));
  } else if (difficulty === "Medium" && domainConfig.mediumQuestions) {
    domainConfig.mediumQuestions.forEach((q) => eligibleQuestions.push(q));
  } else if (domainConfig.easyQuestions) {
    domainConfig.easyQuestions.forEach((q) => eligibleQuestions.push(q));
  }

  const freshQuestions = eligibleQuestions.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
  const chosen = freshQuestions.length > 0 ? freshQuestions[0] : (eligibleQuestions[0] || {
    topic: "System Design",
    questionText: `Explain how you would design a scalable, fault-tolerant rate limiting service for high-traffic APIs.`,
    expectedKeyPoints: ["Token bucket or sliding window algorithm", "Distributed Redis cluster", "Handling network partitions"],
  });

  return {
    topic: chosen.topic || "Technical Reasoning",
    subtopic: chosen.subtopic || "Core Principles",
    questionType: chosen.questionType || "Technical",
    difficulty,
    questionText: cleanDisallowedChars(chosen.questionText),
    expectedKeyPoints: (chosen.expectedKeyPoints || []).map(cleanDisallowedChars),
    source: "curated-knowledge-base",
  };
}

function getNextCuratedOrGeneratedQuestion({
  domain,
  difficulty = "Hard",
  interviewType = "Technical",
  questionIndex = 1,
  totalPlanned = 5,
  previousQuestions = [],
  isFollowUp = false,
  parentTopic = "",
}) {
  const domainConfig = getDomainConfig(domain);
  const usedTexts = new Set(previousQuestions.map((q) => q.questionText.toLowerCase().trim()));

  if (isFollowUp) {
    if (interviewType.includes("HR") || interviewType.includes("Behavioral")) {
      return {
        topic: parentTopic || "Behavioral Deep Dive",
        subtopic: "Reflective Follow-Up",
        questionType: "Behavioral",
        difficulty,
        questionText: `Looking back on that situation: If you encountered the exact same dilemma today with greater experience, what would you do differently?`,
        expectedKeyPoints: ["Continuous personal growth", "Refined communication approach", "Systemic conflict mitigation"],
        isFollowUp: true,
        source: "adaptive-followup",
      };
    }

    return {
      topic: parentTopic || "Deep Dive",
      subtopic: "Adaptive Follow-Up",
      questionType: "Technical",
      difficulty,
      questionText: `Following up on your previous answer: What are the primary failure modes of this approach, and how would you mitigate them under 10x traffic?`,
      expectedKeyPoints: ["Graceful degradation", "Backpressure and queuing", "Observability metrics"],
      isFollowUp: true,
      source: "adaptive-followup",
    };
  }

  if (interviewType.includes("HR") || interviewType.includes("Behavioral")) {
    const freshHr = HR_BEHAVIORAL_QUESTIONS.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
    const chosen = freshHr.length > 0 ? freshHr[0] : HR_BEHAVIORAL_QUESTIONS[0];
    return {
      topic: chosen.topic,
      subtopic: chosen.subtopic,
      questionType: "Behavioral",
      difficulty: chosen.difficulty || difficulty,
      questionText: cleanDisallowedChars(chosen.questionText),
      expectedKeyPoints: (chosen.expectedKeyPoints || []).map(cleanDisallowedChars),
      isFollowUp: false,
      source: "curated-hr-bank",
    };
  }

  if (interviewType.includes("System Design")) {
    const domainScenarios = SYSTEM_DESIGN_SCENARIOS[domain] || SYSTEM_DESIGN_SCENARIOS["Software Engineering"] || [];
    const freshSd = domainScenarios.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
    const chosen = freshSd.length > 0 ? freshSd[0] : (domainScenarios[0] || SYSTEM_DESIGN_SCENARIOS["Software Engineering"][0]);
    return {
      topic: chosen.topic,
      subtopic: chosen.subtopic,
      questionType: "System Design",
      difficulty: chosen.difficulty || difficulty,
      questionText: cleanDisallowedChars(chosen.questionText),
      expectedKeyPoints: (chosen.expectedKeyPoints || []).map(cleanDisallowedChars),
      isFollowUp: false,
      source: "curated-system-design-bank",
    };
  }

  const eligible = [];
  if (difficulty === "Hard" && domainConfig.hardQuestions) {
    domainConfig.hardQuestions.forEach((q) => eligible.push(q));
  } else if (domainConfig.mediumQuestions) {
    domainConfig.mediumQuestions.forEach((q) => eligible.push(q));
  } else if (domainConfig.easyQuestions) {
    domainConfig.easyQuestions.forEach((q) => eligible.push(q));
  }

  const fresh = eligible.filter((q) => !usedTexts.has(q.questionText.toLowerCase().trim()));
  const chosen = fresh.length > 0 ? fresh[0] : {
    topic: "Architecture & Scale",
    subtopic: "Distributed Systems",
    questionType: "Technical",
    difficulty,
    questionText: `How would you guarantee data consistency across distributed database shards during a network partition?`,
    expectedKeyPoints: ["Two-phase commit or Sagas", "CRDTs or quorum replication", "Conflict resolution"],
    source: "curated-knowledge-base",
  };

  return {
    topic: chosen.topic || "Core Concepts",
    subtopic: chosen.subtopic || "Practice",
    questionType: chosen.questionType || "Technical",
    difficulty,
    questionText: cleanDisallowedChars(chosen.questionText),
    expectedKeyPoints: (chosen.expectedKeyPoints || []).map(cleanDisallowedChars),
    isFollowUp: false,
    source: "curated-knowledge-base",
  };
}

module.exports = {
  generateInitialQuestion,
  evaluateAnswerAndGenerateNext,
  generateFinalEvaluation,
};
