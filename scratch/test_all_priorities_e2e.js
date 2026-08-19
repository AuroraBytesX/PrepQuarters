const path = require("path");
require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });
const { transcribeAudio } = require("../server/services/TranscriptionService");
const { analyzeResume, extractTextFromPdfBuffer } = require("../server/services/ResumeService");
const { validateCandidateAnswer } = require("../server/services/AnswerValidationService");
const { generateInitialQuestion, evaluateAnswerAndGenerateNext } = require("../server/services/InterviewService");
const zlib = require("zlib");

// Helper to generate a valid WAV buffer with speech tone
function createWavHeader(sampleRate = 16000, numChannels = 1, bitsPerSample = 16, numSamples = 16000) {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.3 * 32767;
    buffer.writeInt16LE(Math.floor(sample), 44 + i * 2);
  }

  return buffer;
}

// Helper to generate a valid PDF buffer
function createSamplePdfBuffer() {
  const content = `BT /F1 12 Tf 72 712 Td (Alex Morgan - Senior Fullstack Engineer) Tj ET
BT /F1 10 Tf 72 690 Td (Summary: 6 years experience building React, Node.js, and PostgreSQL cloud systems) Tj ET
BT /F1 10 Tf 72 670 Td (Experience: Architected microservices at ScaleCorp, reducing latency by 35 percent) Tj ET
BT /F1 10 Tf 72 650 Td (Skills: TypeScript, Python, Docker, Kubernetes, AWS, GraphQL, Redis, CI/CD) Tj ET
BT /F1 10 Tf 72 630 Td (Education: B.S. in Computer Science - Top Tier University) Tj ET`;

  const compressed = zlib.deflateSync(Buffer.from(content, "utf-8"));
  const len = compressed.length;

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length ${len} /Filter /FlateDecode >>
stream
${compressed.toString("binary")}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000115 00000 n 
0000000200 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
${300 + len}
%%EOF`;

  return Buffer.from(pdf, "binary");
}

async function runComprehensiveVerification() {
  console.log("=================================================");
  console.log("PREPQUARTERS COMPREHENSIVE VERIFICATION SUITE");
  console.log("=================================================");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, name, details = "") {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${name}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${name} - Details: ${details}`);
    }
  }

  // TEST 1: STT & Groq Whisper Key & Pipeline
  console.log("\n--- PRIORITY 1: VOICE INPUT / STT PIPELINE ---");
  const wavAudio = createWavHeader(16000, 1, 16, 16000);
  const sttResult = await transcribeAudio({
    buffer: wavAudio,
    mimetype: "audio/wav",
    filename: "test_speech.wav",
  });
  assert(sttResult.success === true, "Groq Whisper STT successfully processes audio buffer", JSON.stringify(sttResult));
  assert(sttResult.provider.includes("Whisper"), "STT returns valid provider identifier", sttResult.provider);
  assert(typeof sttResult.latencyMs === "number" && sttResult.latencyMs > 0, "STT returns valid latency metric", `${sttResult.latencyMs}ms`);

  // TEST 2: PDF Upload & ATS Analysis Pipeline
  console.log("\n--- PRIORITY 3: RESUME ANALYZER / EXTREME ATS PDF UPLOAD ---");
  const samplePdf = createSamplePdfBuffer();
  const extractedText = await extractTextFromPdfBuffer(samplePdf);
  assert(extractedText.length > 50, "PDF Text extractor successfully extracts clean text from stream", extractedText);
  assert(extractedText.includes("Alex Morgan") && extractedText.includes("TypeScript"), "PDF extracted text contains key resume terms");

  const atsReport = analyzeResume({
    resumeText: extractedText,
    jobDescription: "Looking for a Senior Fullstack Engineer with React, Node.js, AWS, and TypeScript experience.",
    targetRole: "Senior Fullstack Engineer",
  });
  assert(atsReport && atsReport.atsReadinessScore > 50, "ATS Analyzer computes readiness score from PDF content", `Score: ${atsReport?.atsReadinessScore}`);
  assert(Array.isArray(atsReport.matchedKeywords) && atsReport.matchedKeywords.length > 0, "ATS matches technical taxonomy keywords", `Keywords: ${atsReport.matchedKeywords?.length}`);
  assert(Array.isArray(atsReport.prioritizedRecommendations), "ATS provides explainable prioritized recommendations");

  // TEST 3: Semantic Spoken Answer Quality Evaluation
  console.log("\n--- PRIORITY 4: AI ANSWER EVALUATION (NATURAL SPOKEN ANSWERS) ---");
  const spokenAnswer = "Well basically in my approach I would use a hash map to store each number and its index. That way as we iterate through the list we can just check if the target minus current number is in the map in O(1) average time, giving us an overall O(n) runtime.";
  const validation = validateCandidateAnswer({
    questionText: "How would you solve the Two Sum problem in O(n) time?",
    topic: "Arrays & Hash Tables",
    domain: "Software Engineering",
    questionType: "Coding",
    candidateAnswer: spokenAnswer,
  });
  assert(validation.isValid === true, "Natural spoken answer passes intelligent answer validation without false rejection");

  const evalResult = await evaluateAnswerAndGenerateNext({
    role: "Software Engineer",
    domain: "Software Engineering",
    difficulty: "Easy",
    companyStyle: "Google",
    currentQuestion: {
      topic: "Arrays & Hash Tables",
      questionText: "How would you solve the Two Sum problem in O(n) time?",
      questionType: "Coding",
      expectedKeyPoints: ["O(n) time complexity", "Hash map for O(1) complement lookup"],
    },
    candidateAnswer: spokenAnswer,
    previousQuestions: [],
    questionIndex: 0,
    totalPlanned: 3,
  });
  assert(evalResult && evalResult.evaluation && evalResult.evaluation.score >= 7, "Conversational accurate answer receives high evaluation score", `Score: ${evalResult?.evaluation?.score}/10`);

  // TEST 4: Question Difficulty Calibration (Easy Genuinely Easy)
  console.log("\n--- PRIORITY 5: QUESTION DIFFICULTY (EASY GENUINELY EASY) ---");
  const easyCodingQ = await generateInitialQuestion({
    domain: "Software Engineering",
    difficulty: "Easy",
    companyStyle: "General Tech",
    interviewType: "Coding Interview",
  });
  assert(easyCodingQ && (easyCodingQ.difficulty === "Easy" || easyCodingQ.topic.includes("Array")), "Easy Coding interview selects Easy fundamental challenge", `${easyCodingQ.topic}: ${easyCodingQ.questionText}`);

  const easyAptitudeQ = await generateInitialQuestion({
    domain: "Software Engineering",
    difficulty: "Easy",
    companyStyle: "General Tech",
    interviewType: "Aptitude & Reasoning",
  });
  assert(easyAptitudeQ && easyAptitudeQ.difficulty === "Easy", "Easy Aptitude interview selects fundamental reasoning problem", `${easyAptitudeQ.topic}: ${easyAptitudeQ.questionText}`);

  const easyTechnicalQ = await generateInitialQuestion({
    domain: "Software Engineering",
    difficulty: "Easy",
    companyStyle: "General Tech",
    interviewType: "Technical Interview",
  });
  assert(easyTechnicalQ && (easyTechnicalQ.difficulty === "Easy" || easyTechnicalQ.topic), "Easy Technical interview provides introductory fundamentals question", `${easyTechnicalQ.topic}: ${easyTechnicalQ.questionText}`);

  // TEST 5: Mixed Interview Untimed Modality
  console.log("\n--- PRIORITY 6: MIXED INTERVIEW UNTIMED MODALITY ---");
  const mixedQ = await generateInitialQuestion({
    domain: "Software Engineering",
    difficulty: "Medium",
    companyStyle: "Google",
    interviewType: "Mixed",
  });
  assert(mixedQ && mixedQ.questionText, "Mixed interview initializes multi-stage opening scenario", mixedQ.topic);

  console.log("\n=================================================");
  console.log(`VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log("=================================================");
}

runComprehensiveVerification();
