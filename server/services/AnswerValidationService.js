/*
 * Answer Validation Service
 * PrepQuarters Core Intelligence Engine
 * Validates candidate responses for basic sanity, coherence, and relevance
 * before initiating deep neural evaluation.
 */

const { cleanDisallowedChars } = require("./SanitizationHelper");

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
  if (!cleanAnswer || cleanAnswer.length < 8) {
    return {
      isValid: false,
      category: "too_short",
      reason: "Your answer was too brief. An interview response requires structured technical reasoning.",
      retryPrompt: "Please explain your technical approach, core trade-offs, and design choices in greater detail.",
    };
  }

  const words = cleanAnswer.split(/\s+/).filter(Boolean);
  if (words.length < 3) {
    return {
      isValid: false,
      category: "insufficient_words",
      reason: "Your answer provided fewer than 3 words, which is insufficient to evaluate technical reasoning.",
      retryPrompt: "Please provide a complete explanation outlining how you would solve this scenario.",
    };
  }

  // 2. Check for "I don't know", "skip", "no idea", etc.
  const lowerAnswer = cleanAnswer.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
  if (SURRENDER_PHRASES.includes(lowerAnswer) || isSurrenderResponse(lowerAnswer)) {
    return {
      isValid: false,
      category: "surrender_or_pass",
      reason: "You indicated 'I don't know' or requested to pass. In an interview, walk through your problem-solving decomposition or state your assumptions.",
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

  // Check repeated single character runs like 'aaaaaa' or 'ssssss'
  if (/([^\s])\1{4,}/.test(text)) {
    return true;
  }

  // Check repeated word/token patterns like 'test test test test test'
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    const uniqueWords = new Set(words);
    if (uniqueWords.size === 1) {
      return true;
    }
  }

  // Check keyboard smash tokens (e.g. 'asldkfj', 'zxcvbnm', 'qwerty', vowelless words)
  const smashWords = words.filter((w) => {
    if (w.length >= 6 && !/[aeiouy]/i.test(w)) return true;
    if (/(asdf|ghjk|zxcv|qwerty|lkjh|poiu)/i.test(w)) return true;
    return false;
  });

  if (smashWords.length >= 2 || (words.length > 0 && smashWords.length / words.length >= 0.3)) {
    return true;
  }

  // Check character variety vs length
  const lettersOnly = text.replace(/[^a-zA-Z]/g, "");
  if (lettersOnly.length > 15) {
    const uniqueChars = new Set(lettersOnly.toLowerCase());
    if (uniqueChars.size <= 3) {
      return true;
    }
  }

  return false;
}

module.exports = {
  validateCandidateAnswer,
  isGibberishOrRepetitive,
  isSurrenderResponse,
};
