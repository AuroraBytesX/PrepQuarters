/*
 * Practical Resume Improvement & Tailoring Engine
 * PrepQuarters Engineering Platform
 * Provides actionable LLM-driven suggestions (Improve, Add, Remove, JD Tailor)
 * without numerical ATS ranking or scores, conversational graph building,
 * and pre-generation confirmation before compiling LaTeX.
 */

const zlib = require("zlib");
const { cleanDisallowedChars } = require("./SanitizationHelper");
const { callAiChatCompletion } = require("./AiProviderService");

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
 * Extracts plain text from a binary PDF buffer using PDFParse v2
 * with native zlib stream extraction fallback.
 */
async function extractTextFromPdfBuffer(buffer) {
  if (!buffer || buffer.length === 0) return "";

  // 1. Try pdf-parse
  try {
    const pdfModule = require("pdf-parse");
    if (pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      await parser.load();
      const result = await parser.getText();
      const text = typeof result === "string" ? result : result?.text || "";
      try { parser.destroy(); } catch (e) {}
      if (text && text.trim().length > 20) {
        return cleanDisallowedChars(text.trim());
      }
    } else if (typeof pdfModule === "function") {
      const data = await pdfModule(buffer);
      if (data && data.text && data.text.trim().length > 20) {
        return cleanDisallowedChars(data.text.trim());
      }
    }
  } catch (e) {
    console.warn("PDFParse module extraction notice:", e.message);
  }

  // 2. Fallback to native zlib stream extraction
  try {
    const raw = buffer.toString("binary");
    let extractedText = "";

    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    while ((match = streamRegex.exec(raw)) !== null) {
      const streamData = Buffer.from(match[1], "binary");
      let decompressed = "";
      try {
        decompressed = zlib.inflateSync(streamData).toString("utf-8");
      } catch (e) {
        try {
          decompressed = zlib.inflateRawSync(streamData).toString("utf-8");
        } catch (e2) {
          decompressed = streamData.toString("utf-8");
        }
      }

      if (decompressed) {
        const textObjRegex = /BT[\s\S]*?ET/g;
        let textObjMatch;
        while ((textObjMatch = textObjRegex.exec(decompressed)) !== null) {
          const block = textObjMatch[0];
          const strRegex = /\((.*?)\)/g;
          let strMatch;
          const blockWords = [];
          while ((strMatch = strRegex.exec(block)) !== null) {
            const cleaned = strMatch[1]
              .replace(/\\([()\\])/g, "$1")
              .replace(/\\r/g, " ")
              .replace(/\\n/g, " ")
              .replace(/\\t/g, " ");
            if (cleaned.trim()) {
              blockWords.push(cleaned);
            }
          }
          const hexRegex = /<([0-9a-fA-F\s]+)>/g;
          let hexMatch;
          while ((hexMatch = hexRegex.exec(block)) !== null) {
            const hexClean = hexMatch[1].replace(/\s+/g, "");
            if (hexClean.length % 2 === 0) {
              const decoded = Buffer.from(hexClean, "hex").toString("utf-8").replace(/[\x00-\x1F]/g, " ").trim();
              if (decoded) blockWords.push(decoded);
            }
          }
          if (blockWords.length > 0) {
            extractedText += blockWords.join(" ") + "\n";
          }
        }
      }
    }

    if (extractedText && extractedText.trim().length > 20) {
      return cleanDisallowedChars(extractedText.trim());
    }
  } catch (e) {
    console.warn("Native PDF decompression notice:", e.message);
  }

  return cleanDisallowedChars(buffer.toString("utf-8", 0, Math.min(buffer.length, 50000)).trim());
}

/**
 * Multi-layer Resume Document Quality & Relevance Gate
 * Layer 1: Deterministic entropy, length, and repetition checks
 * Layer 2: Structural section signals check
 * Layer 3: Semantic LLM document classification
 */
async function validateResumeDocument({ resumeText = "", targetRole = "Software Engineer" }) {
  const cleanResume = cleanDisallowedChars(resumeText || "").trim();

  // 1. Length and word count minimums
  if (cleanResume.length < 60) {
    return {
      isValid: false,
      reason: "Document is too short to contain meaningful resume details (minimum 60 characters).",
      message: "This document does not appear to contain meaningful resume information. Please upload a resume containing relevant education, experience, projects, skills, certifications, or achievements.",
    };
  }

  const words = cleanResume.split(/\s+/).filter(Boolean);
  if (words.length < 12) {
    return {
      isValid: false,
      reason: "Document contains fewer than 12 words.",
      message: "This document does not appear to contain meaningful resume information. Please upload a resume containing relevant education, experience, projects, skills, certifications, or achievements.",
    };
  }

  // 2. Character repetition & keyboard smash checks (alphanumeric only, ignore spaces/dashes/newlines)
  const hasExtremeCharRepeat = /([a-zA-Z0-9])\1{5,}/.test(cleanResume);
  const isKeyboardMash = /^[asdfghjklqwertyuiopzxcvbnm\s\d.,!?-]+$/i.test(cleanResume) &&
    words.length > 4 &&
    words.every(w => /^[asdfghjklqwertyuiopzxcvbnm]{6,}$/i.test(w) && !["react", "python", "golang", "rust", "javascript", "docker", "developer", "engineer", "project", "university", "experience", "education"].includes(w.toLowerCase()));

  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const uniqueRatio = uniqueWords.size / words.length;

  if (hasExtremeCharRepeat || isKeyboardMash || (words.length >= 25 && uniqueRatio < 0.2)) {
    return {
      isValid: false,
      reason: "Detected repetitive characters, keyboard smash, or meaningless filler text.",
      message: "This document does not appear to contain meaningful resume information. Please upload a resume containing relevant education, experience, projects, skills, certifications, or achievements.",
    };
  }

  // 3. Structural Signal Check
  const resumeSignals = [
    "education", "university", "college", "school", "degree", "bachelor", "master", "b.tech", "b.e", "m.tech", "gpa",
    "experience", "employment", "internship", "intern", "work", "job", "company", "role",
    "projects", "project", "built", "developed", "architected", "implemented",
    "skills", "technologies", "tech stack", "tools", "languages", "programming", "database",
    "certifications", "certified", "achievements", "awards", "publications", "research",
    "leadership", "extracurricular", "summary", "profile", "objective", "about me",
    "contact", "email", "phone", "github", "linkedin", "portfolio", "resume", "curriculum vitae", "cv",
    "software", "engineer", "developer", "architect", "analyst", "administrator", "specialist"
  ];

  const lowerText = cleanResume.toLowerCase();
  const matchedSignals = resumeSignals.filter(signal => {
    const escaped = signal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(lowerText);
  });

  if (matchedSignals.length < 2) {
    return {
      isValid: false,
      reason: "Lacks core resume structural sections and professional keywords.",
      message: "This document does not appear to contain meaningful resume information. Please upload a resume containing relevant education, experience, projects, skills, certifications, or achievements.",
    };
  }

  // 4. LLM Semantic Classification Gate (when AI provider is active)
  if (isAiConfigured()) {
    try {
      const systemPrompt = `You are a strict, professional technical resume classifier.
Evaluate if the following document is an authentic, meaningful candidate resume, CV, or professional profile.
Valid resumes contain candidate background details such as education, technical skills, engineering projects, internships, work experience, certifications, or contact info.
Student and entry-level resumes are valid if they describe coursework, student projects, or coding skills.

Reject:
- Obvious gibberish or keyboard smash (e.g. "asdfgh", "qwerty")
- Meaningless repeated words (e.g. "test test test", "blah blah")
- Random unrelated articles (recipes, political essays, news stories, poems, random forum posts)
- Empty or placeholder templates (e.g. only "[Insert Name Here]")
- Unrelated source code snippets or logs without candidate context

Respond with valid JSON:
{
  "isResume": true/false,
  "isMeaningful": true/false,
  "isRelevant": true/false,
  "confidence": 0.0 to 1.0,
  "reason": "Brief 1-sentence explanation"
}`;

      const aiRes = await callAiChatCompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Document snippet:\n"${cleanResume.slice(0, 3000)}"` },
        ],
        temperature: 0.1,
        maxTokens: 250,
        jsonMode: true,
      });

      if (aiRes.success && aiRes.json) {
        const { isResume, isMeaningful, isRelevant, confidence, reason } = aiRes.json;
        if (isResume === false || isMeaningful === false || isRelevant === false) {
          return {
            isValid: false,
            confidence: confidence || 0.9,
            reason: reason || "Document does not represent a meaningful resume.",
            message: "This document does not appear to contain meaningful resume information. Please upload a resume containing relevant education, experience, projects, skills, certifications, or achievements.",
          };
        }
      }
    } catch (e) {
      console.warn("LLM Resume validation warning, falling back to deterministic signal check:", e.message);
    }
  }

  if (matchedSignals.length === 0) {
    return {
      isValid: false,
      reason: "No recognizable resume sections or engineering credentials identified.",
      message: "This document does not appear to contain meaningful resume information. Please upload a resume containing relevant education, experience, projects, skills, certifications, or achievements.",
    };
  }

  return {
    isValid: true,
    confidence: 0.95,
    matchedSignals,
  };
}

/**
 * Analyzes resume content and returns practical qualitative suggestions
 * (No numerical ATS score, ranking, or grade).
 */
async function analyzeResume({ resumeText = "", jobDescription = "", targetRole = "Software Engineer" }) {
  const cleanResume = cleanDisallowedChars(resumeText || "");
  const cleanJd = cleanDisallowedChars(jobDescription || "");

  // Run validation gate before running heavy analysis
  const validation = await validateResumeDocument({ resumeText: cleanResume, targetRole });
  if (!validation.isValid) {
    const err = new Error(validation.message);
    err.isRejected = true;
    err.reason = validation.reason;
    throw err;
  }

  // 1. LLM Qualitative Analysis when AI provider is active
  if (isAiConfigured()) {
    try {
      const systemPrompt = `You are a principal technical resume reviewer and hiring bar raiser.
Analyze the candidate's resume for the target role: "${targetRole}".
${cleanJd ? `Target Job Description:\n"${cleanJd}"\n` : "No specific job description provided. Provide general best practice technical resume advice."}

CRITICAL RULES:
1. DO NOT assign or output any numerical ATS score, percentage grade, ranking, or letter grade.
2. Focus purely on practical, actionable qualitative feedback.
3. Categorize suggestions into:
   - "improveThis": Specific bullets or sections that need quantified metrics, active verbs, or clearer technical scope.
   - "considerAdding": Technologies, architectural patterns, or competencies that would strengthen their candidacy.
   - "considerRemoving": Generic soft skills, subjective clichés ("team player", "quick learner"), or outdated tools.
   - "jobDescriptionTailoring": Concrete ways to align past experience with target job requirements.
4. Output valid JSON matching this schema with NO em dashes and NO emojis:
{
  "improveThis": [
    { "category": "Quantified Metrics", "issue": "Description of issue", "recommendation": "Concrete suggestion" }
  ],
  "considerAdding": [
    { "category": "Technical Depth", "recommendation": "Concrete suggestion" }
  ],
  "considerRemoving": [
    { "category": "Buzzwords", "issue": "Description of issue", "recommendation": "Concrete suggestion" }
  ],
  "jobDescriptionTailoring": {
    "category": "JD Alignment",
    "missingKeywords": ["keyword1", "keyword2"],
    "recommendation": "How to align experience with job requirements"
  },
  "summaryFeedback": "Concise executive overview of resume strengths and priority areas."
}`;

      const aiRes = await callAiChatCompletion({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Resume Content:\n"${cleanResume.slice(0, 8000)}"` },
        ],
        temperature: 0.2,
        maxTokens: 1200,
        jsonMode: true,
      });

      if (aiRes.success && aiRes.json && (Array.isArray(aiRes.json.improveThis) || Array.isArray(aiRes.json.considerAdding))) {
        const d = aiRes.json;
        return {
          success: true,
          targetRole,
          analyzedAt: new Date().toISOString(),
          hasJdComparison: Boolean(cleanJd.length > 20),
          improveThis: d.improveThis || [],
          improvementsToMake: d.improveThis || [],
          considerAdding: d.considerAdding || [],
          recommendedAdditions: d.considerAdding || [],
          considerRemoving: d.considerRemoving || [],
          recommendedRemovals: d.considerRemoving || [],
          jobDescriptionTailoring: d.jobDescriptionTailoring || null,
          jdTailoredSuggestions: d.jobDescriptionTailoring ? [d.jobDescriptionTailoring] : [],
          summaryFeedback: cleanDisallowedChars(d.summaryFeedback || `Analysis completed for target role: ${targetRole}. Focus on quantifiable achievements, strong ownership verbs, and targeted technical competencies without artificial scoring.`),
        };
      }
    } catch (e) {
      console.warn("AI Resume Analysis error, using heuristic fallback:", e.message);
    }
  }

  // 2. Deterministic Rule-Based Fallback
  const hasMetrics = /\b(\d+%|\$\d+|\d+\s*k|\d+\s*x|\d+\s*ms|\d+\s*sec|\d+\s*users|\d+\s*req)\b/i.test(cleanResume);
  const hasStrongVerbs = /\b(architected|designed|engineered|optimized|spearheaded|implemented|refactored|deployed|accelerated)\b/i.test(cleanResume);
  const hasUnclearSkills = /\b(hard worker|quick learner|team player|detail oriented|good communicator)\b/i.test(cleanResume);
  const hasSections = /\b(experience|education|projects|skills|technical skills)\b/i.test(cleanResume);

  const improvements = [];
  const additions = [];
  const removals = [];
  const jdSuggestions = [];

  if (!hasMetrics) {
    improvements.push({
      category: "Measurable Impact",
      issue: "Bullet points lack quantified business or performance outcomes.",
      recommendation: "Attach concrete metrics to achievements (e.g., 'reduced latency by 35%', 'scaled to 100k requests/sec', 'saved $15k in cloud compute').",
    });
  }

  if (!hasStrongVerbs) {
    improvements.push({
      category: "Action Verbs",
      issue: "Bullet points use passive phrasing rather than strong technical ownership verbs.",
      recommendation: "Begin bullet points with direct engineering action verbs: 'Architected', 'Optimized', 'Engineered', 'Refactored'.",
    });
  }

  if (!hasSections) {
    improvements.push({
      category: "Structure & Parsing",
      issue: "Standard section headings appear ambiguous or difficult to parse.",
      recommendation: "Use clear industry-standard headings: Summary, Technical Skills, Professional Experience, Projects, Education.",
    });
  }

  additions.push({
    category: "Technical Stack Clarity",
    recommendation: "Explicitly group technical skills into categorized buckets (Languages, Frameworks, Cloud & DevOps, Databases, Protocols).",
  });

  if (targetRole.toLowerCase().includes("backend") || targetRole.toLowerCase().includes("distributed")) {
    additions.push({
      category: "System Engineering Depth",
      recommendation: "Mention specific architectural patterns used in past work (e.g., event-driven streaming, caching layers, database indexing, concurrency models).",
    });
  }

  if (hasUnclearSkills) {
    removals.push({
      category: "Subjective Clichés",
      issue: "Found generic soft skill phrases like 'team player' or 'hard worker'.",
      recommendation: "Remove generic buzzwords and let your quantifiable project achievements demonstrate collaboration and initiative.",
    });
  }

  if (cleanJd.length > 30) {
    const jdKeywords = ["kubernetes", "docker", "python", "golang", "go", "java", "kafka", "redis", "postgresql", "aws", "gcp", "ci/cd", "microservices", "graphql", "rest", "distributed"];
    const missingKeywords = jdKeywords.filter((kw) => cleanJd.toLowerCase().includes(kw) && !cleanResume.toLowerCase().includes(kw));

    if (missingKeywords.length > 0) {
      jdSuggestions.push({
        category: "Job Description Alignment",
        missingKeywords: missingKeywords.slice(0, 8),
        recommendation: `The target job description emphasizes technologies missing from your resume text: ${missingKeywords.slice(0, 6).join(", ")}. If you have experience with these tools, integrate them into your relevant experience bullets.`,
      });
    }
  }

  return {
    success: true,
    targetRole,
    analyzedAt: new Date().toISOString(),
    hasJdComparison: cleanJd.length > 30,
    improvementsToMake: improvements,
    improveThis: improvements,
    recommendedAdditions: additions,
    considerAdding: additions,
    recommendedRemovals: removals,
    considerRemoving: removals,
    jdTailoredSuggestions: jdSuggestions,
    jobDescriptionTailoring: jdSuggestions.length > 0 ? jdSuggestions[0] : null,
    summaryFeedback: `Analysis completed for target role: ${targetRole}. Focus on quantifiable achievements, strong ownership verbs, and targeted technical competencies without artificial scoring.`,
  };
}

/**
 * Context-aware validation and gibberish detection for candidate responses.
 * Detects keyboard smashes, placeholders, empty responses, and verifies contextual adequacy.
 * Does NOT reject legitimate short answers like "Python developer", "Amazon", "2 years", "React".
 */
function validateCandidateInput({ step, message, currentGraph = {} }) {
  if (!message || typeof message !== "string") {
    return {
      valid: false,
      confidence: 1.0,
      usable: false,
      reason: "Empty response",
      promptAgain: "Please provide a response so we can build your resume.",
    };
  }

  const raw = message.trim();
  const clean = raw.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  // 1. Minimum length checks
  if (raw.length < 2) {
    return {
      valid: false,
      confidence: 0.95,
      usable: false,
      reason: "Response too short",
      promptAgain: "Please provide a little more detail so I can accurately capture this in your resume.",
    };
  }

  // 2. Check for obvious keyboard mash patterns & low entropy
  const words = clean.split(/\s+/).filter(Boolean);
  const validTechTerms = new Set([
    "react", "python", "golang", "rust", "java", "sql", "html", "css", "c++", "c#", "scala", "docker",
    "linux", "aws", "gcp", "azure", "node", "vue", "angular", "flask", "django", "spring", "redis", "kafka",
    "graphql", "engineer", "developer", "architect", "lead", "devops", "cloud", "backend", "frontend",
    "fullstack", "data", "ml", "ai", "sre", "security", "intern", "software", "tech", "manager", "specialist"
  ]);

  const isKeyboardMash =
    words.length > 0 &&
    words.every(
      (w) =>
        /^[asdfghjklqwertyuiopzxcvbnm]{4,}$/i.test(w) &&
        !validTechTerms.has(w.toLowerCase())
    );  // Check for questions asked by the candidate
  const isQuestion = clean.endsWith("?") || /^(what|how|why|where|can you|should i|could you|does|is it|what is|tell me)\b/i.test(clean);
  if (isQuestion) {
    let questionAnswer = "That is a great question! For a technical resume, recruiters and ATS scanners prioritize clear impact metrics, modern tech stacks, and concise bullet points.";
    if (clean.toLowerCase().includes("ats")) {
      questionAnswer = "An ATS (Applicant Tracking System) parses your resume for key technical skills and experience. Keeping a clean, single-column layout without complex graphics ensures maximum visibility.";
    } else if (clean.toLowerCase().includes("project")) {
      questionAnswer = "Projects with measurable results (e.g., latency reduction, API throughput, users served) stand out the most to senior hiring managers.";
    }
    return {
      valid: false,
      isQuestion: true,
      confidence: 0.95,
      usable: false,
      reason: "User asked a clarifying question",
      promptAgain: `${questionAnswer}\n\nNow, could you provide your details for this section?`,
    };
  }

  // Check character repetition e.g. "aaaaa", "zzzzzz"
  const hasExcessiveCharRepeat = /(.)\1{3,}/.test(clean);

  // Check for repeated nonsense words e.g. "blah blah", "hello hello", "xyz xyz", "test test"
  const isRepeatedNonsense = /^(blah|hello|hi|xyz|test|lol|asdf|qwerty)(\s+(blah|hello|hi|xyz|test|lol|asdf|qwerty))+$/i.test(clean);

  // Check generic non-informative expressions / uncertainty
  const isNonInformative = /^(nothing|none|idk|i don't know|i dont know|not sure|no idea|n\/a|na|no|whatever|pass|what should i write)$/i.test(clean);

  // Check placeholder names / dummy data
  const hasPlaceholders = /^(john doe|jane doe|acme corp|example company|lorem ipsum|your name|sample project|my company|foo bar|bar baz)$/i.test(clean);

  if (isKeyboardMash || hasExcessiveCharRepeat || isRepeatedNonsense || hasPlaceholders) {
    return {
      valid: false,
      confidence: 0.98,
      usable: false,
      reason: "Detected gibberish, keyboard mash, or placeholder text",
      promptAgain: "I need a little more meaningful information to build this section. Could you please provide your actual details?",
    };
  }

  // Step-specific context-aware validation with concrete examples for uncertainty
  switch (step) {
    case "role":
    case "targetRole":
    case "start": {
      if (isNonInformative) {
        return {
          valid: false,
          confidence: 0.95,
          usable: false,
          reason: "Role is required",
          promptAgain: "No problem! You can select an engineering specialty that matches your interest. For example: **Senior Backend Engineer**, **Full Stack Developer (React & Node.js)**, **Cloud / DevOps Engineer**, or **Machine Learning Engineer**.",
        };
      }
      const validRoleSignals = [
        "engineer", "developer", "architect", "manager", "specialist", "scientist", "lead", "analyst", "consultant", "intern",
        "backend", "frontend", "full stack", "fullstack", "devops", "sre", "cloud", "security", "data", "ml", "ai", "mobile", "ios", "android", "qa",
        "python", "java", "javascript", "golang", "go", "rust", "c++", "c#", "react", "node", "software", "tech", "programmer", "administrator"
      ];
      const hasRoleSignal = validRoleSignals.some((signal) => clean.includes(signal));
      if (!hasRoleSignal) {
        return {
          valid: false,
          confidence: 0.90,
          usable: false,
          reason: "Role not recognized",
          promptAgain: "I need a little more information to build this section. Please describe your target role (for example: Senior Backend Engineer, Full Stack Developer, DevOps Architect).",
        };
      }
      return { valid: true, confidence: 0.95, usable: true, normalizedInformation: raw };
    }

    case "name_contact": {
      if (isNonInformative || clean.length < 3) {
        return {
          valid: false,
          confidence: 0.95,
          usable: false,
          reason: "Name and contact required",
          promptAgain: "Could you please provide your full name and preferred contact info (for example: *'Alex Mercer, alex@example.com, San Francisco, CA'*)?",
        };
      }
      return { valid: true, confidence: 0.95, usable: true, normalizedInformation: raw };
    }

    case "summary": {
      if (isNonInformative) {
        return {
          valid: false,
          confidence: 0.90,
          usable: false,
          reason: "Summary clarification requested",
          promptAgain: "A strong professional summary is 1-2 lines summarizing your experience and key focus areas. For example: *'Full Stack Engineer with 3+ years of experience architecting high-scale REST APIs, microservices, and modern React interfaces.'*",
        };
      }
      if (clean.length < 5) {
        return {
          valid: false,
          confidence: 0.90,
          usable: false,
          reason: "Summary too short",
          promptAgain: "Please share a brief 1-2 sentence overview of your technical background or core engineering focus.",
        };
      }
      return { valid: true, confidence: 0.95, usable: true, normalizedInformation: raw };
    }

    case "education": {
      if (isNonInformative) {
        return { valid: true, confidence: 0.90, usable: true, normalizedInformation: "Self-Directed Practical Engineering & Continuous Technical Learning" };
      }
      return { valid: true, confidence: 0.95, usable: true, normalizedInformation: raw };
    }

    case "experience": {
      if (isNonInformative) {
        return {
          valid: false,
          confidence: 0.92,
          usable: false,
          reason: "Experience guidance requested",
          promptAgain: "That's completely fine! You can describe any job, internship, or freelance project. For example: *'Software Engineer at CloudTech: Engineered microservices in Node.js and PostgreSQL, reducing query latency by 40% for 50k daily active users.'*",
        };
      }
      if (clean.length < 4) {
        return {
          valid: false,
          confidence: 0.92,
          usable: false,
          reason: "Experience details insufficient",
          promptAgain: "Please share a bit more detail about your work experience (for example: your role, company name, or key technical achievements).",
        };
      }
      return { valid: true, confidence: 0.95, usable: true, normalizedInformation: raw };
    }

    case "skills": {
      if (isNonInformative) {
        return {
          valid: false,
          confidence: 0.92,
          usable: false,
          reason: "Skills guidance requested",
          promptAgain: "Here are some core engineering technologies you can list:\n- **Languages**: TypeScript, JavaScript, Python, Go, Java, SQL\n- **Frameworks**: React, Express, Node.js, Next.js, FastAPI\n- **Cloud & Tools**: Docker, AWS, Git, Redis, PostgreSQL",
        };
      }
      if (clean.length < 2) {
        return {
          valid: false,
          confidence: 0.92,
          usable: false,
          reason: "Skills required",
          promptAgain: "Please list your primary programming languages, frameworks, or tools (for example: Python, Docker, PostgreSQL).",
        };
      }
      return { valid: true, confidence: 0.95, usable: true, normalizedInformation: raw };
    }

    case "projects": {
      if (isNonInformative) {
        return {
          valid: false,
          confidence: 0.92,
          usable: false,
          reason: "Project guidance requested",
          promptAgain: "You can highlight any open-source tool, personal application, or capstone project. For example: *'Distributed Task Queue built with Python, Redis, and Celery, supporting rate limiting and automatic retry workers for 10k jobs/min.'*",
        };
      }
      if (clean.length < 4) {
        return {
          valid: false,
          confidence: 0.92,
          usable: false,
          reason: "Project details insufficient",
          promptAgain: "Could you share a technical project you built, the technologies used, and what problem it solved?",
        };
      }
      return { valid: true, confidence: 0.95, usable: true, normalizedInformation: raw };
    }

    default:
      return { valid: true, confidence: 0.85, usable: true, normalizedInformation: raw };
  }
}

/**
 * Interactive Conversational Resume Builder Assistant
 * Powered by LLM semantic intent classification, dynamic context validation,
 * bidirectional editing, and pre-generation confirmation.
 */
async function processResumeBuilderMessage({
  currentGraph = {},
  message = "",
  userMessage = "",
  step = "start",
  userConfirmed = false,
  conversationHistory = [],
  providerConfig = {},
}) {
  const cleanMsg = cleanDisallowedChars(message || userMessage || "").trim();
  const graph = {
    name: currentGraph.name || currentGraph.fullName || "",
    fullName: currentGraph.fullName || currentGraph.name || "",
    email: currentGraph.email || "",
    phone: currentGraph.phone || "",
    location: currentGraph.location || "",
    targetRole: currentGraph.targetRole || "",
    summary: currentGraph.summary || "",
    skills: Array.isArray(currentGraph.skills)
      ? [...currentGraph.skills]
      : (currentGraph.skills?.languages ? [...currentGraph.skills.languages] : []),
    experience: Array.isArray(currentGraph.experience) ? [...currentGraph.experience] : [],
    projects: Array.isArray(currentGraph.projects) ? [...currentGraph.projects] : [],
    education: Array.isArray(currentGraph.education) ? [...currentGraph.education] : [],
    certifications: Array.isArray(currentGraph.certifications) ? [...currentGraph.certifications] : [],
    ...currentGraph,
  };

  if (!Array.isArray(graph.skills)) {
    if (typeof graph.skills === "object") {
      graph.skills = Object.values(graph.skills).flat();
    } else {
      graph.skills = [];
    }
  }

  const lower = cleanMsg.toLowerCase();

  // Helper for consistent return format
  const makeReturn = ({ nextStep, confirmationPending, text, latex = "" }) => ({
    success: true,
    updatedGraph: graph,
    nextStep,
    confirmationPending: Boolean(confirmationPending),
    isConfirmationRequired: Boolean(confirmationPending),
    aiResponse: text,
    assistantReply: text,
    latex,
  });

  // 1. Check for explicit confirmation to generate final resume
  if (userConfirmed || lower === "generate final resume" || (step === "confirmation" && (lower === "no" || lower === "no edits" || lower === "generate" || lower === "looks good" || lower === "yes generate" || lower.includes("compile")))) {
    const latexCode = generateCleanLatexFromGraph(graph);
    return {
      success: true,
      updatedGraph: graph,
      nextStep: "completed",
      confirmationPending: false,
      isConfirmationRequired: false,
      aiResponse: "Your resume details are confirmed. I have compiled your clean, ATS-optimized LaTeX resume below. You can download the .tex file or review the structured sections.",
      assistantReply: "Your resume details are confirmed. I have compiled your clean, ATS-optimized LaTeX resume below. You can download the .tex file or review the structured sections.",
      latex: latexCode,
    };
  }

  // 0. Handle initial greeting or start command
  if (step === "start" || !cleanMsg || lower === "start" || lower === "hi" || lower === "hello") {
    return makeReturn({
      nextStep: "role",
      confirmationPending: false,
      text: "Welcome to the Conversational Resume Architect. What is your target role (e.g., Senior Backend Engineer, Full Stack Developer, DevOps Architect)?",
    });
  }

  // 2. Perform Deep Semantic LLM Analysis when AI Provider is Active
  if (isAiConfigured()) {
    try {
      const historyFormatted = Array.isArray(conversationHistory) && conversationHistory.length > 0
        ? conversationHistory.slice(-8).map(m => `${m.sender === "user" ? "Candidate" : "Architect"}: "${m.text}"`).join("\n")
        : "No prior messages in this session.";

      const aiSystemPrompt = `You are the PrepQuarters AI Resume Architect — a warm, brilliant, and highly encouraging technical career mentor (like ChatGPT meets a Principal Staff Engineer).

YOUR MISSION:
Help the candidate craft a stellar, senior-level ATS LaTeX resume through an intelligent, natural, and fluid conversation.

CURRENT RESUME GRAPH:
- Target Role: "${graph.targetRole || "Not yet specified"}"
- Full Name & Contact: "${graph.name || "Not specified"}" (${graph.email || "No email"}, ${graph.location || "No location"})
- Summary: "${graph.summary || "Not specified"}"
- Skills: ${JSON.stringify(graph.skills || [])}
- Work Experience: ${JSON.stringify(graph.experience || [])}
- Projects: ${JSON.stringify(graph.projects || [])}
- Education: ${JSON.stringify(graph.education || [])}

CURRENT RESUME SECTION BEING COVERED: "${step}"

RECENT CONVERSATION HISTORY:
${historyFormatted}

CANDIDATE'S LATEST MESSAGE: "${cleanMsg}"

CONVERSATION & ARCHITECT GUIDELINES:
1. TALK NATURALLY LIKE CHATGPT:
   - Be genuinely helpful, conversational, and encouraging. Never sound like a robotic questionnaire or repeat the exact same sentence.
   - If the candidate asks a question (about interview prep, tech trends, ATS formatting, or casual chat), answer it with insight and warmth!
   - If the candidate is stubborn, vague, or says "I don't know" / "you suggest something" / "help me write it":
     -> PROACTIVELY draft 2-3 tailored, realistic technical suggestions for them right in your response!
     -> For example, if they don't know their summary or skills, draft a great one and ask: "Here is a strong summary tailored for you: '...'. Would you like to use this, or would you like to tweak anything?"
   - If the candidate agrees ("yes use that", "sounds good", "option 1", "add those"), extract it into the resume and smoothly transition to the next section!
   - If the candidate asks to edit or change anything at any time ("Actually change my role to SRE", "add Docker"), happily update it!

2. ACCURATE RESUME DATA EXTRACTION:
   - Extract valid details (targetRole, name, email, location, summary, skills, experience, project, education) when provided or confirmed by the candidate.
   - Do not store user questions or conversational filler as resume data.

3. RESUME SECTION PROGRESSION:
   - Natural progression: Target Role -> Name & Contact -> Professional Summary -> Work Experience -> Tech Stack / Skills -> Projects -> Education -> Confirmation.
   - Once all sections are populated, present a clean structured review and ask if they are ready to compile their LaTeX resume.

Output strict JSON matching this schema:
{
  "assistantResponse": "Warm, engaging, conversational response with thoughtful answers or proactive drafts",
  "extractedData": {
    "targetRole": "Role title or null",
    "name": "Full name or null",
    "email": "Email or null",
    "location": "Location or null",
    "summary": "Summary string or null",
    "skills": ["Skill1", "Skill2"] or null,
    "experience": { "title": "...", "company": "...", "bullets": ["..."] } or null,
    "project": { "name": "...", "tech": "...", "bullets": ["..."] } or null,
    "education": { "degree": "...", "institution": "..." } or null
  },
  "nextStep": "role" | "name_contact" | "summary" | "experience" | "skills" | "projects" | "education" | "confirmation",
  "confirmationPending": true | false
}`;

      const aiResult = await callAiChatCompletion({
        messages: [
          { role: "system", content: aiSystemPrompt },
          { role: "user", content: cleanMsg },
        ],
        options: {
          temperature: 0.3,
          max_tokens: 900,
          jsonMode: true,
        },
        providerConfig,
      });

      if (aiResult.success && aiResult.json && aiResult.json.assistantResponse) {
        const payload = aiResult.json;
        if (payload.extractedData) {
          if (payload.extractedData.targetRole) {
            graph.targetRole = payload.extractedData.targetRole;
          }
          if (payload.extractedData.name) {
            graph.name = payload.extractedData.name;
            graph.fullName = graph.name;
          }
          if (payload.extractedData.email) graph.email = payload.extractedData.email;
          if (payload.extractedData.location) graph.location = payload.extractedData.location;
          if (payload.extractedData.summary) {
            graph.summary = payload.extractedData.summary;
          }
          if (Array.isArray(payload.extractedData.skills) && payload.extractedData.skills.length > 0) {
            graph.skills = Array.from(new Set([...(graph.skills || []), ...payload.extractedData.skills]));
          }
          if (payload.extractedData.experience && payload.extractedData.experience.title) {
            graph.experience.push(payload.extractedData.experience);
          }
          if (payload.extractedData.project && payload.extractedData.project.name) {
            graph.projects.push(payload.extractedData.project);
          }
          if (payload.extractedData.education && payload.extractedData.education.degree) {
            graph.education.push(payload.extractedData.education);
          }
        }

        const nextStep = payload.nextStep || step;
        const isConfirm = Boolean(payload.confirmationPending || nextStep === "confirmation");

        return makeReturn({
          nextStep,
          confirmationPending: isConfirm,
          text: payload.assistantResponse,
        });
      } else {
        console.warn("[RESUME_BUILDER_AI_RESULT_FAILED]", aiResult.error || "Missing json/assistantResponse", "Raw text:", aiResult.text?.substring(0, 100));
      }
    } catch (llmErr) {
      console.warn("[RESUME_BUILDER_LLM_FALLBACK]", llmErr.message);
    }
  }

  // 3. Deterministic Semantic Rule Engine (Offline / Instant Fallback)
  // Handle Bidirectional Editing commands
  if (lower.startsWith("change ") || lower.startsWith("remove ") || lower.startsWith("edit ") || lower.startsWith("rewrite ") || lower.startsWith("update ") || lower.includes("actually, change") || lower.includes("change my") || lower.includes("update my")) {
    if (lower.includes("role") || lower.includes("target")) {
      const newRoleMatch = cleanMsg.match(/(?:to|role\s+to|target\s+role\s+to)\s+([A-Za-z\s]+(?:Engineer|Developer|Architect|Specialist|Manager|Scientist))/i);
      const newRole = newRoleMatch ? newRoleMatch[1].trim() : cleanMsg.replace(/^(actually,?\s*)?(change|edit|update|rewrite)\s+(my\s+)?(target\s+)?(role\s+to\s+|role\s+)?/i, "").split(/and/i)[0].trim();
      if (newRole) graph.targetRole = newRole;
    } else if (lower.includes("skill") || lower.includes("tech") || lower.includes("add ")) {
      const skillsToAdd = cleanMsg.split(/,|and/i).map((s) => s.replace(/^(actually,?\s*)?(add|include|skills?|technolog(y|ies)|to\s+my\s+skills)\s+/i, "").trim()).filter((s) => s.length > 1 && !s.toLowerCase().includes("change") && !s.toLowerCase().includes("role"));
      if (skillsToAdd.length > 0) {
        graph.skills = Array.from(new Set([...graph.skills, ...skillsToAdd]));
      }
    } else if (lower.includes("summary")) {
      const summaryText = cleanMsg.replace(/^(actually,?\s*)?(change|edit|update|rewrite)\s+(my\s+)?(summary\s+to\s+|summary\s+)?/i, "").trim();
      if (summaryText) graph.summary = summaryText;
    }

    return makeReturn({
      nextStep: "confirmation",
      confirmationPending: true,
      text: `I have updated your resume details:\n- Role: ${graph.targetRole || "Software Engineer"}\n- Skills: ${(graph.skills || []).join(", ") || "Standard Stack"}\n\nWould you like to change anything else before I generate your LaTeX resume?`,
    });
  }

  // Validate input for current step
  const validation = validateCandidateInput({ step, message: cleanMsg, currentGraph: graph });
  if (!validation.valid) {
    return makeReturn({
      nextStep: step,
      confirmationPending: false,
      text: validation.promptAgain,
    });
  }

  // State Machine Step Progression
  if (!graph.targetRole || step === "role" || step === "targetRole") {
    graph.targetRole = validation.normalizedInformation || cleanMsg;
    return makeReturn({
      nextStep: "name_contact",
      confirmationPending: false,
      text: `Great, target role set to ${graph.targetRole}. What is your full name and preferred contact details (e.g. Email, Phone, Location)?`,
    });
  }

  if (!graph.name) {
    const parts = cleanMsg.split(/,|\n|\|/);
    graph.name = parts[0]?.trim() || cleanMsg;
    graph.fullName = graph.name;
    if (parts[1]) graph.email = parts[1].trim();
    if (parts[2]) graph.location = parts[2].trim();

    return makeReturn({
      nextStep: "summary",
      confirmationPending: false,
      text: `Thank you, ${graph.name}. Please share a brief 1-2 sentence professional summary highlighting your core engineering focus.`,
    });
  }

  if (!graph.summary) {
    graph.summary = cleanMsg.length > 5 ? cleanMsg : `${graph.targetRole} specializing in building resilient software systems.`;
    return makeReturn({
      nextStep: "experience",
      confirmationPending: false,
      text: `Captured your summary. Tell me about your most recent work experience: What was your title, company, and key technical achievements?`,
    });
  }

  if (graph.experience.length === 0) {
    graph.experience.push({
      title: graph.targetRole,
      company: cleanMsg.length > 5 && cleanMsg.length < 35 ? cleanMsg : "Technology Team",
      bullets: [cleanMsg],
    });

    return makeReturn({
      nextStep: "skills",
      confirmationPending: false,
      text: `Recorded your experience details. What primary programming languages, frameworks, and databases do you work with daily?`,
    });
  }

  if (!graph.skills || graph.skills.length === 0) {
    const list = cleanMsg.split(/,|;/).map((s) => s.trim()).filter(Boolean);
    graph.skills = list.length > 0 ? list : ["JavaScript", "Python", "SQL"];

    return makeReturn({
      nextStep: "projects",
      confirmationPending: false,
      text: `Recorded your technical stack. Tell me about your most significant technical project: What problem did it solve, and what was the quantifiable outcome?`,
    });
  }

  if (graph.projects.length === 0) {
    graph.projects.push({
      name: "Core Engineering Project",
      tech: graph.skills?.slice(0, 3).join(", ") || "Full Stack",
      bullets: [cleanMsg],
    });

    return makeReturn({
      nextStep: "education",
      confirmationPending: false,
      text: `Captured your project details. What is your educational background or highest degree?`,
    });
  }

  if (graph.education.length === 0) {
    graph.education.push({
      degree: cleanMsg,
      institution: "Higher Education / Technical Training",
    });

    const summaryReview = `Here is a summary of your structured resume details:\n` +
      `- Target Role: ${graph.targetRole}\n` +
      `- Name: ${graph.name}${graph.email ? ` (${graph.email})` : ""}\n` +
      `- Summary: ${graph.summary}\n` +
      `- Experience: ${graph.experience[0]?.title} at ${graph.experience[0]?.company}\n` +
      `- Skills: ${graph.skills.join(", ")}\n` +
      `- Project: ${graph.projects[0]?.name}\n\n` +
      `Would you like to change anything before I generate the resume?`;

    return makeReturn({
      nextStep: "confirmation",
      confirmationPending: true,
      text: summaryReview,
    });
  }

  return makeReturn({
    nextStep: "confirmation",
    confirmationPending: true,
    text: "Would you like to change anything before I generate the resume?",
  });
}

/**
 * Generates compile-ready LaTeX from the candidate's structured graph state
 * without any dummy/placeholder candidate names.
 */
function generateCleanLatexFromGraph(graph = {}) {
  const name = cleanDisallowedChars(graph.fullName || graph.name || "Engineering Candidate");
  const email = cleanDisallowedChars(graph.email || "");
  const phone = cleanDisallowedChars(graph.phone || "");
  const location = cleanDisallowedChars(graph.location || "");
  const targetRole = cleanDisallowedChars(graph.targetRole || "Software Engineer");
  const summary = cleanDisallowedChars(graph.summary || `${targetRole} with proven engineering experience building scalable, high-performance software systems.`);

  let rawSkills = graph.skills;
  let skillsList = [];
  if (Array.isArray(rawSkills)) {
    skillsList = rawSkills;
  } else if (rawSkills && typeof rawSkills === "object") {
    skillsList = Object.values(rawSkills).flat();
  }

  let expLatex = "";
  if (Array.isArray(graph.experience) && graph.experience.length > 0) {
    expLatex = graph.experience.map((e) => `
\\textbf{${cleanDisallowedChars(e.title || targetRole)}} $|$ \\textit{${cleanDisallowedChars(e.company || "Engineering Experience")}} \\hfill ${cleanDisallowedChars(e.dateRange || "Recent")}
\\begin{itemize}[leftmargin=*,noitemsep,topsep=2pt]
${(e.bullets || []).map((b) => `  \\item ${cleanDisallowedChars(b)}`).join("\n")}
\\end{itemize}
    `).join("\n");
  }

  let projLatex = "";
  if (Array.isArray(graph.projects) && graph.projects.length > 0) {
    projLatex = graph.projects.map((p) => `
\\textbf{${cleanDisallowedChars(p.name || "Engineering Project")}} $|$ \\textit{${cleanDisallowedChars(p.tech || "Tech Stack")}}
\\begin{itemize}[leftmargin=*,noitemsep,topsep=2pt]
${(p.bullets || []).map((b) => `  \\item ${cleanDisallowedChars(b)}`).join("\n")}
\\end{itemize}
    `).join("\n");
  }

  let eduLatex = "";
  if (Array.isArray(graph.education) && graph.education.length > 0) {
    eduLatex = graph.education.map((ed) => `
\\textbf{${cleanDisallowedChars(ed.degree || "Degree in Computing / Engineering")}} \\hfill ${cleanDisallowedChars(ed.institution || "Higher Education")}
    `).join("\n");
  }

  return `% PrepQuarters Clean ATS-Optimized Professional Resume
\\documentclass[10pt,letterpaper]{article}
\\usepackage[margin=0.65in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{charter}

\\hypersetup{colorlinks=true, linkcolor=blue, urlcolor=blue}
\\titleformat{\\section}{\\large\\bfseries\\scshape\\raggedright}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{8pt}{4pt}
\\pagestyle{empty}

\\begin{document}

\\begin{center}
    {\\LARGE \\textbf{${name}}} \\\\[3pt]
    {\\large \\textbf{${targetRole}}} \\\\[3pt]
    \\small ${phone ? `${phone} $|$ ` : ""}${email ? `\\href{mailto:${email}}{${email}} $|$ ` : ""}${location}
\\end{center}

\\section*{Professional Summary}
${summary}

\\section*{Technical Skills}
\\begin{itemize}[leftmargin=*,noitemsep,topsep=2pt]
  \\item \\textbf{Core Competencies:} ${skillsList.map(cleanDisallowedChars).join(", ")}
\\end{itemize}

${expLatex ? `\\section*{Work Experience}\n${expLatex}` : ""}

${projLatex ? `\\section*{Key Projects}\n${projLatex}` : ""}

${eduLatex ? `\\section*{Education}\n${eduLatex}` : ""}

\\end{document}
  `.trim();
}

module.exports = {
  extractTextFromPdfBuffer,
  validateResumeDocument,
  analyzeResume,
  processResumeBuilderMessage,
  generateCleanLatexFromGraph,
  validateCandidateInput,
};
