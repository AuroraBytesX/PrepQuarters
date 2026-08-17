/*
 * Answer Validation Service
 * PrepQuarters Core Intelligence Engine
 * Validates candidate responses for relevance, coherence, and depth
 * before initiating neural evaluation.
 */

const AUDIO_NOISE_PHRASES = [
  "you",
  "thank you",
  "thanks for watching",
  "subtitles by",
  "bye",
  "hello",
  "um",
  "uh",
  "test",
  "testing",
  "one two three",
];

const SURRENDER_PHRASES = [
  "i dont know",
  "i don't know",
  "dont know",
  "don't know",
  "no idea",
  "have no idea",
  "i have no idea",
  "idk",
  "dunno",
  "skip",
  "pass",
  "skip this",
  "pass this question",
  "i am not sure",
  "not sure",
  "no clue",
  "i have no clue",
  "cannot answer",
  "can't answer",
];

/**
 * Validates whether a candidate's answer is substantive, coherent, and relevant.
 * 
 * @param {Object} options
 * @param {string} options.questionText The question asked
 * @param {string} options.topic The topic / competency
 * @param {string} options.domain The domain name
 * @param {string} options.candidateAnswer The raw or transcribed answer text
 * @returns {{ isValid: boolean, reason?: string, retryPrompt?: string, category?: string }}
 */
function validateCandidateAnswer({ questionText = "", topic = "", domain = "", questionType = "", candidateAnswer = "" }) {
  const cleanAnswer = cleanDisallowedChars(candidateAnswer || "").trim();

  // If Aptitude MCQ or direct option choice (e.g. "Option A", "A. 6 days", "B")
  if (
    questionType === "Aptitude" ||
    /^option\s+[a-d]/i.test(cleanAnswer) ||
    /^[a-d](\.|\s|$)/i.test(cleanAnswer)
  ) {
    if (cleanAnswer.length >= 1) {
      return { isValid: true };
    }
  }

  // 1. Check for empty or extremely short answers
  if (!cleanAnswer || cleanAnswer.length < 12) {
    return {
      isValid: false,
      category: "too_short",
      reason: "Your answer was too brief (under 12 characters). An interview response requires a structured explanation.",
      retryPrompt: "Please explain your technical approach, core trade-offs, and design choices in greater detail.",
    };
  }

  const words = cleanAnswer.split(/\s+/).filter(Boolean);
  if (words.length < 4) {
    return {
      isValid: false,
      category: "insufficient_words",
      reason: "Your answer provided fewer than 4 words, which is insufficient to evaluate technical competence.",
      retryPrompt: "Please provide a complete explanation outlining how you would solve this scenario.",
    };
  }

  // 2. Check for "I don't know", "skip", "no idea", etc.
  const lowerAnswer = cleanAnswer.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  if (SURRENDER_PHRASES.includes(lowerAnswer) || isSurrenderResponse(lowerAnswer)) {
    return {
      isValid: false,
      category: "surrender_or_pass",
      reason: "You indicated 'I don't know' or requested to pass. In an interview, walk through your problem-solving decomposition or state your assumptions even if you are uncertain of the final solution.",
      retryPrompt: "Please outline what foundational concepts or initial hypotheses you would explore for this question.",
    };
  }

  // 3. Check for microphone noise or common transcription artifacts
  if (AUDIO_NOISE_PHRASES.includes(lowerAnswer) && words.length <= 4) {
    return {
      isValid: false,
      category: "audio_noise",
      reason: "The audio input appeared to capture ambient microphone noise rather than a spoken technical response.",
      retryPrompt: "Please speak your answer clearly or type your response into the terminal.",
    };
  }

  // 4. Check for keyboard smash or gibberish (e.g. 'asdfasdfasdf', 'zzzzzzzz')
  if (isGibberishOrRepetitive(cleanAnswer)) {
    return {
      isValid: false,
      category: "gibberish",
      reason: "The input contains repetitive or random character sequences that do not form coherent technical reasoning.",
      retryPrompt: "Please articulate a coherent technical solution to the question.",
    };
  }

  // 5. Check for basic relevance to the question / topic / domain
  const relevanceCheck = checkRelevance(cleanAnswer, questionText, topic, domain);
  if (!relevanceCheck.isRelevant) {
    return {
      isValid: false,
      category: "unrelated",
      reason: relevanceCheck.reason || "The answer appears unrelated to the technical scenario presented.",
      retryPrompt: `Please focus your answer specifically on addressing: "${questionText}"`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Detects surrender or refusal phrases within short answers.
 */
function isSurrenderResponse(text) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > 10) return false;

  return (
    text.includes("dont know") ||
    text.includes("dont have any idea") ||
    text.includes("no idea about this") ||
    text.includes("skip this question") ||
    text.includes("i have no clue") ||
    text.includes("i am not sure how to answer")
  );
}

/**
 * Detects keyboard mashing, repeated characters, or non-word entropy.
 */
function isGibberishOrRepetitive(text) {
  // Recognize valid code patterns (functions, variables, loops, classes)
  const lower = text.toLowerCase();
  if (
    lower.includes("function") ||
    lower.includes("def ") ||
    lower.includes("class ") ||
    lower.includes("const ") ||
    lower.includes("let ") ||
    lower.includes("return ") ||
    lower.includes("select ")
  ) {
    return false;
  }

  // Check repeated single character runs like 'aaaaaa' or 'ssssss' (excluding spaces/tabs/newlines)
  if (/([^\s])\1{5,}/.test(text)) {
    return true;
  }

  // Check repeated word/token patterns like 'test test test test test'
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length >= 4) {
    const uniqueWords = new Set(words);
    if (uniqueWords.size === 1) {
      return true;
    }
  }

  // Check character variety vs length
  const lettersOnly = text.replace(/[^a-zA-Z]/g, "");
  if (lettersOnly.length > 20) {
    const uniqueChars = new Set(lettersOnly.toLowerCase());
    if (uniqueChars.size <= 3) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether the answer contains sufficient domain or general problem-solving vocabulary.
 */
function checkRelevance(answer, questionText, topic, domain) {
  const answerLower = answer.toLowerCase();
  const qLower = (questionText + " " + topic + " " + domain).toLowerCase();

  // Extract key terms from question and topic (words with length >= 4)
  const qTerms = qLower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !COMMON_STOP_WORDS.has(w));

  // Common technical and analytical terms acceptable in any technical answer
  const GENERAL_TECH_TERMS = [
    "design", "system", "architecture", "data", "database", "cache", "caching", "server", "service",
    "client", "api", "latency", "throughput", "scale", "scaling", "scalable", "storage", "query",
    "table", "index", "load", "balancer", "traffic", "request", "response", "code", "algorithm",
    "function", "component", "state", "user", "process", "memory", "cpu", "network", "async",
    "sync", "model", "pipeline", "test", "testing", "metric", "deploy", "deployment", "monitor",
    "monitoring", "error", "failure", "failover", "queue", "kafka", "redis", "sql", "nosql",
    "cluster", "node", "partition", "shard", "lock", "thread", "concurrency", "rate", "limit",
    "approach", "solution", "trade", "tradeoff", "implement", "structure", "framework", "lead",
    "team", "stakeholder", "customer", "product", "feature", "ux", "ui", "interface", "cloud"
  ];

  let matches = 0;
  qTerms.forEach((term) => {
    if (answerLower.includes(term)) matches++;
  });

  let techTermMatches = 0;
  GENERAL_TECH_TERMS.forEach((term) => {
    if (answerLower.includes(term)) techTermMatches++;
  });

  // If answer has at least 1 term from the question or at least 1 standard technical/domain term, it is relevant
  if (matches > 0 || techTermMatches > 0 || answer.split(/\s+/).length >= 15) {
    return { isRelevant: true };
  }

  // If answer has zero technical terms and zero question terms in a short sentence, flag as potentially unrelated
  return {
    isRelevant: false,
    reason: "Your response did not address the specific technical concepts or architecture referenced in the scenario.",
  };
}

const COMMON_STOP_WORDS = new Set([
  "what", "when", "where", "which", "while", "with", "about", "above", "after", "again", "against",
  "all", "and", "any", "are", "because", "been", "before", "being", "below", "between", "both",
  "but", "cannot", "could", "did", "does", "doing", "down", "during", "each", "few", "for",
  "from", "further", "had", "has", "have", "having", "her", "here", "hers", "herself", "him",
  "himself", "his", "how", "into", "its", "itself", "more", "most", "myself", "nor", "not",
  "off", "once", "only", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
  "same", "she", "should", "some", "such", "than", "that", "the", "their", "theirs", "them",
  "themselves", "then", "there", "these", "they", "this", "those", "through", "too", "under",
  "until", "very", "was", "were", "what", "when", "where", "which", "while", "who", "whom",
  "why", "will", "would", "you", "your", "yours", "yourself", "yourselves"
]);

function cleanDisallowedChars(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/[\u2014\u2015]/g, " - ")
    .replace(/[\u2013]/g, "-")
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/[\u2600-\u27BF]/g, "");
}

module.exports = {
  validateCandidateAnswer,
};
