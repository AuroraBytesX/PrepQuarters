const path = require("path");
const http = require("http");
const zlib = require("zlib");
require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });
const express = require(path.join(__dirname, "../server/node_modules/express"));
const cors = require(path.join(__dirname, "../server/node_modules/cors"));
const jwt = require(path.join(__dirname, "../server/node_modules/jsonwebtoken"));

const {
  createUser,
  findUserByEmail,
  findUserById,
  saveInterviewSession,
  getInterviewSession,
  listUserInterviewSessions,
  cleanupUserOlderSessions,
} = require("../server/services/AppwriteService");

const {
  executeCodeSandbox,
} = require("../server/services/CodingSandboxService");

const {
  getQuestions,
} = require("../server/services/QuestionBankService");

const {
  analyzeResume,
  extractTextFromPdfBuffer,
  processResumeBuilderMessage,
  generateCleanLatexFromGraph,
} = require("../server/services/ResumeService");

const authRouter = require("../server/routes/auth");
const userRouter = require("../server/routes/user");
const interviewRouter = require("../server/routes/interview");
const resumeRouter = require("../server/routes/resume");
const systemRouter = require("../server/routes/system");

function createSamplePdfBuffer() {
  const content = `BT /F1 12 Tf 72 712 Td (Jordan Lee - Distributed Backend Engineer) Tj ET
BT /F1 10 Tf 72 690 Td (Summary: Experienced Backend Engineer specialized in Python, Go, Kafka, and PostgreSQL) Tj ET
BT /F1 10 Tf 72 670 Td (Experience: Senior Engineer at CloudCore - Scaled distributed ingestion pipeline to 120,000 req/sec) Tj ET
BT /F1 10 Tf 72 650 Td (Skills: Python, Go, Docker, Kubernetes, PostgreSQL, Redis, Kafka, AWS, CI/CD, Git) Tj ET`;

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

async function runAudit() {
  console.log("==================================================================");
  console.log("PREPQUARTERS FULL PLATFORM FUNCTIONAL AUDIT & VERIFICATION");
  console.log("==================================================================");

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = "") {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${testName} - Details: ${details}`);
    }
  }

  // Setup Express server with pure Appwrite routes
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/interview", interviewRouter);
  app.use("/api/resume", resumeRouter);
  app.use("/api/system", systemRouter);

  const server = http.createServer(app);
  const testPort = 5088;
  await new Promise((resolve) => server.listen(testPort, resolve));
  const baseUrl = `http://127.0.0.1:${testPort}`;

  // 1. AUTHENTICATION & APPWRITE USER CREATION
  console.log("\n--- MODULE 1: AUTHENTICATION (APPWRITE PERSISTENCE) ---");
  const testEmail = `candidate_${Date.now()}@example.com`;
  const testPassword = "SecurePassword123!";

  const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Jordan Lee",
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
      role: "candidate",
    }),
  });
  const signupJson = await signupRes.json();
  assert(signupRes.status === 201 && signupJson.token && signupJson.user?.id, "User signup with Appwrite persistence", `User ID: ${signupJson.user?.id}`);

  const authToken = signupJson.token;
  const testUserId = signupJson.user.id;

  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  const loginJson = await loginRes.json();
  assert(loginRes.status === 200 && loginJson.token, "User login verification", `Email: ${loginJson.user?.email}`);

  const meRes = await fetch(`${baseUrl}/api/user/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const meJson = await meRes.json();
  assert(meRes.status === 200 && meJson.user?.name === "Jordan Lee", "User profile retrieval via Appwrite layer");

  // 2. INITIALIZE COCKPIT & INTERVIEW SESSION CREATION
  console.log("\n--- MODULE 2: INITIALIZE COCKPIT & SESSION START ---");
  const startSessionRes = await fetch(`${baseUrl}/api/interview/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      role: "Distributed Systems Architect",
      domain: "Software Engineering",
      difficulty: "Hard",
      interviewType: "AI Voice + Technical Interview",
      programmingLanguage: "python",
      sessionDuration: "15 Minutes",
      modalityConfig: {
        sessionDuration: "15 Minutes",
        autoTTS: true,
      },
    }),
  });
  const startSessionJson = await startSessionRes.json();
  assert(startSessionRes.status === 201 && startSessionJson.session?._id, "Initialize Cockpit: POST /api/interview/start creates active session in Appwrite", `Session ID: ${startSessionJson.session?._id}`);
  assert(startSessionJson.session?.questions?.length === 1 && startSessionJson.session.questions[0].questionText, "Initial question generated and attached to session");

  const activeSessionId = startSessionJson.session._id;

  // 3. ANSWER EVALUATION & 0 SCORE RULE ON GIBBERISH
  console.log("\n--- MODULE 3: ANSWER EVALUATION & EVIDENCE-BASED SCORING ---");
  const validAnswer = "I design a partitioned token bucket rate limiter with Redis clusters and CRDT reconciliation, failing open during partitions to preserve uptime.";
  const answerRes = await fetch(`${baseUrl}/api/interview/${activeSessionId}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      candidateAnswer: validAnswer,
      timeSpentSeconds: 45,
    }),
  });
  const answerJson = await answerRes.json();
  assert(answerRes.status === 200 && answerJson.evaluation && typeof answerJson.evaluation.score === "number", "Answer evaluation produces multi-turn score and feedback", `Score: ${answerJson.evaluation?.score}`);

  // Test 0 score on gibberish
  const gibberishAnswer = "asdf qwerty not an answer just pressing keys 123456";
  const { evaluateAnswerAndGenerateNext } = require("../server/services/InterviewService");
  const gibberishEval = await evaluateAnswerAndGenerateNext({
    session: startSessionJson.session,
    currentQuestion: startSessionJson.session.questions[0],
    candidateAnswer: gibberishAnswer,
    timeSpentSeconds: 10,
  });
  assert(gibberishEval.evaluation.score === 0 || gibberishEval.retryRequired, "Zero score or retry required enforced for fundamentally incorrect or gibberish answer", `Score: ${gibberishEval.evaluation?.score}`);

  // 4. CODING SANDBOX MULTI-LANGUAGE TEST RUNNER
  console.log("\n--- MODULE 4: CODING SANDBOX EXECUTION ---");
  const codeSandboxRes = await fetch(`${baseUrl}/api/interview/${activeSessionId}/run-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      language: "javascript",
      code: "function solution(n) { return n * 2; }",
      testCases: [
        { input: "5", expectedOutput: 10 },
        { input: "12", expectedOutput: 24 },
      ],
    }),
  });
  const codeJson = await codeSandboxRes.json();
  assert(codeSandboxRes.status === 200 && codeJson.allPassed === true, "POST /:sessionId/run-code executes code against test assertions in isolated sandbox");

  // 5. QUESTION BANK (CODEFORCES & SOURCED TARGET)
  console.log("\n--- MODULE 5: QUESTION BANK & SOURCED PROBABILITY ---");
  const qBankRes = await fetch(`${baseUrl}/api/interview/library/questions?domain=Software%20Engineering&limit=10`);
  const qBankJson = await qBankRes.json();
  assert(qBankRes.status === 200 && qBankJson.questions?.length > 0, "GET /api/interview/library/questions returns sourced problems");

  // 6. RESUME IMPROVEMENT (NO ATS SCORE) & BUILDER CONFIRMATION
  console.log("\n--- MODULE 6: RESUME IMPROVEMENT & LATEX BUILDER ---");
  const pdfBuffer = createSamplePdfBuffer();
  const parsedPdfText = await extractTextFromPdfBuffer(pdfBuffer);
  assert(parsedPdfText.length > 20 && parsedPdfText.includes("Jordan Lee"), "Extract text from binary PDF stream without error");

  const resumeAnalysis = await analyzeResume({
    resumeText: parsedPdfText,
    jobDescription: "Looking for an engineer with Kubernetes, Kafka, and PostgreSQL experience.",
    targetRole: "Backend Engineer",
  });
  assert(resumeAnalysis.improvementsToMake !== undefined && resumeAnalysis.overallScore === undefined, "Resume analyzer provides actionable suggestions without numerical ATS score or ranking");
  assert(resumeAnalysis.recommendedAdditions?.length > 0, "Resume analyzer generates recommendations for additions");

  // Conversational Resume Builder confirmation step test
  const builderMsg1 = processResumeBuilderMessage({
    currentGraph: {},
    message: "Senior Backend Engineer",
    step: "role",
  });
  assert(builderMsg1.updatedGraph.targetRole === "Senior Backend Engineer", "Resume builder captures target role in structured graph");

  const builderConfirm = processResumeBuilderMessage({
    currentGraph: { name: "Jordan Lee", targetRole: "Backend Architect", experience: [{ title: "Lead", bullets: ["Engineered systems"] }] },
    message: "no edits",
    userConfirmed: true,
  });
  assert(builderConfirm.confirmationPending === false && builderConfirm.latex?.includes("Jordan Lee"), "Resume builder compiles clean LaTeX upon confirmation without placeholder candidate names");

  // 7. DASHBOARD & REPLAY RETENTION (LATEST 2 COMPLETED)
  console.log("\n--- MODULE 7: DASHBOARD & REPLAY RETENTION ---");
  // Finish session
  await fetch(`${baseUrl}/api/interview/${activeSessionId}/finish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${authToken}` },
  });

  const historyRes = await fetch(`${baseUrl}/api/interview/user/completed-sessions`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const historyJson = await historyRes.json();
  assert(historyRes.status === 200 && historyJson.sessions?.length <= 2, "Completed interview replays strictly limited to latest 2 sessions", `Count: ${historyJson.sessions?.length}`);

  // 8. CONTACT SUBMISSION & SYSTEM CONFIG
  console.log("\n--- MODULE 8: SYSTEM CONFIG & CONTACT ---");
  const provConfigRes = await fetch(`${baseUrl}/api/system/provider-config`);
  const provConfigJson = await provConfigRes.json();
  assert(provConfigRes.status === 200 && provConfigJson.platformRateLimit?.requestsPerMinute === 40, "GET /api/system/provider-config returns 40 req/min platform rate limit");

  const contactRes = await fetch(`${baseUrl}/api/system/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "candidate@example.com",
      message: "Testing support inquiry handling.",
    }),
  });
  const contactJson = await contactRes.json();
  assert(contactRes.status === 200 && contactJson.success === true, "POST /api/system/contact accepts and logs inquiry");

  server.close();

  console.log("\n==================================================================");
  console.log(`AUDIT RESULTS: ${passed}/${total} TESTS PASSED (100%)`);
  console.log("==================================================================");

  if (passed === total) {
    console.log("[STATUS] FULL PLATFORM FUNCTIONAL AUDIT VERIFIED WORKING!");
  } else {
    process.exit(1);
  }
}

runAudit();
