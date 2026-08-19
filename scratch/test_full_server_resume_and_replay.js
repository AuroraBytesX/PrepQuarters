const path = require("path");
const http = require("http");
const zlib = require("zlib");
require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });
const mongoose = require(path.join(__dirname, "../server/node_modules/mongoose"));
const express = require(path.join(__dirname, "../server/node_modules/express"));
const cors = require(path.join(__dirname, "../server/node_modules/cors"));
const jwt = require(path.join(__dirname, "../server/node_modules/jsonwebtoken"));

const User = require("../server/models/User");
const InterviewSession = require("../server/models/InterviewSession");
const resumeRouter = require("../server/routes/resume");
const interviewRouter = require("../server/routes/interview");
const { transcribeAudio } = require("../server/services/TranscriptionService");

// Helper to generate sample PDF buffer
function createRealPdfBuffer() {
  const content = `BT /F1 12 Tf 72 712 Td (David Miller - Lead Cloud Architect) Tj ET
BT /F1 10 Tf 72 690 Td (Summary: 10 years designing multi-region cloud infrastructure with AWS, Kubernetes, and Terraform) Tj ET
BT /F1 10 Tf 72 670 Td (Experience: Principal SRE at Enterprise Corp - Led cloud migration saving 2.5 million annually) Tj ET
BT /F1 10 Tf 72 650 Td (Skills: AWS, Go, Python, Docker, Kubernetes, Terraform, PostgreSQL, Redis, CI/CD, Kafka) Tj ET
BT /F1 10 Tf 72 630 Td (Education: M.S. in Computer Science - Tech University) Tj ET`;

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

async function runFullVerification() {
  console.log("==================================================================");
  console.log("FULL LOCAL END-TO-END VERIFICATION: RESUME UPLOAD & REPLAY RETENTION");
  console.log("==================================================================");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("[DB_CONNECTED] Connected to MongoDB Atlas successfully.");

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/resume", resumeRouter);
  app.use("/api/interview", interviewRouter);

  const server = http.createServer(app);
  const testPort = 5088;
  await new Promise((resolve) => server.listen(testPort, resolve));
  console.log(`[TEST_SERVER_RUNNING] Express server running on port ${testPort}`);

  let passed = 0;
  let total = 0;
  function assert(cond, name, details = "") {
    total++;
    if (cond) {
      console.log(`[PASS] Test ${total}: ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${name} - Details: ${details}`);
    }
  }

  // --- 1. RESUME UPLOAD VERIFICATION ---
  console.log("\n--- TEST 1: RESUME PDF MULTIPART UPLOAD (NO JD) ---");
  const pdfBuffer = createRealPdfBuffer();
  const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
  const bodyParts = [];
  bodyParts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="resumeFile"; filename="david_miller_resume.pdf"\r\nContent-Type: application/pdf\r\n\r\n`));
  bodyParts.push(pdfBuffer);
  bodyParts.push(Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="targetRole"\r\n\r\nLead Cloud Architect\r\n`));
  bodyParts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="jobDescription"\r\n\r\n\r\n`));
  bodyParts.push(Buffer.from(`--${boundary}--\r\n`));
  const multipartBody = Buffer.concat(bodyParts);

  const resumeRes = await fetch(`http://127.0.0.1:${testPort}/api/resume/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": String(multipartBody.length),
    },
    body: multipartBody,
  });

  const resumeJson = await resumeRes.json();
  assert(resumeRes.status === 200, "POST /api/resume/analyze returns HTTP 200", `Status: ${resumeRes.status}`);
  assert(resumeJson.success === true, "Resume response reports success=true", JSON.stringify(resumeJson));
  assert(resumeJson.report && resumeJson.report.overallScore >= 50, "Resume report computes valid ATS readiness score", `Score: ${resumeJson.report?.overallScore}`);
  assert(Array.isArray(resumeJson.report.foundKeywords) && resumeJson.report.foundKeywords.length >= 5, "Resume parser extracted tech keywords from PDF stream", `Keywords: ${resumeJson.report?.foundKeywords?.join(", ")}`);

  // --- 2. MONGODB REPLAY RETENTION VERIFICATION ---
  console.log("\n--- TEST 2: MONGODB REPLAY RETENTION (MAX 2 COMPLETED SESSIONS) ---");
  const testUser = await User.create({
    name: "Verification User",
    email: `verify_user_${Date.now()}@example.com`,
    password: "Password123!",
  });
  const token = jwt.sign(
    { userId: testUser._id.toString(), email: testUser.email },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "1h" }
  );

  // Seed 4 completed sessions + 1 in-progress session
  for (let i = 1; i <= 4; i++) {
    const d = new Date(Date.now() - (5 - i) * 86400000);
    await InterviewSession.create({
      userId: testUser._id,
      role: "Cloud Architect",
      domain: "Cloud & DevOps",
      difficulty: "Medium",
      companyStyle: "AWS",
      status: "completed",
      createdAt: d,
      completedAt: d,
      totalDurationSeconds: 500,
      questions: [
        {
          questionIndex: 0,
          topic: `Cloud Topic ${i}`,
          subtopic: "Infra",
          difficulty: "Medium",
          questionText: `Question text for cloud session ${i}`,
          candidateAnswer: `Detailed answer for cloud session ${i}`,
          evaluation: {
            score: 8,
            technicalAccuracy: "Good cloud architecture",
            communicationClarity: "Clear explanation",
          },
        },
      ],
      overallEvaluation: {
        overallScore: 80 + i,
        hireRecommendation: "Hire",
        summaryText: `Summary for session ${i}`,
        keyStrengths: ["AWS infrastructure"],
        priorityImprovementAreas: ["Cost optimization"],
      },
    });
  }

  // Active in-progress session
  await InterviewSession.create({
    userId: testUser._id,
    role: "Cloud Architect",
    domain: "Cloud & DevOps",
    difficulty: "Hard",
    companyStyle: "Google",
    status: "in_progress",
    createdAt: new Date(),
    questions: [{ questionIndex: 0, topic: "Active Topic", questionText: "Active in-progress Q" }],
  });

  // Call GET /api/interview/history/all
  const histRes = await fetch(`http://127.0.0.1:${testPort}/api/interview/history/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const histJson = await histRes.json();
  assert(histRes.status === 200, "GET /api/interview/history/all returns HTTP 200", `Status: ${histRes.status}`);
  assert(histJson.sessions && histJson.sessions.length === 2, "History endpoint returns exactly 2 completed replay sessions", `Count: ${histJson.sessions?.length}`);

  // Query MongoDB directly to assert older completed sessions were deleted
  const directDbSessions = await InterviewSession.find({ userId: testUser._id });
  const completedDb = directDbSessions.filter((s) => s.status === "completed");
  const inProgressDb = directDbSessions.filter((s) => s.status === "in_progress");

  assert(completedDb.length === 2, "MongoDB directly contains exactly 2 completed sessions (older sessions deleted)", `Found: ${completedDb.length}`);
  assert(inProgressDb.length === 1, "MongoDB directly preserves active in-progress session (never deleted)", `Found: ${inProgressDb.length}`);

  // Call GET /api/interview/stats/summary
  const statsRes = await fetch(`http://127.0.0.1:${testPort}/api/interview/stats/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const statsJson = await statsRes.json();
  assert(statsRes.status === 200 && statsJson.success === true, "GET /api/interview/stats/summary returns HTTP 200 with valid stats payload");

  // Call GET /api/interview/:sessionId/replay on retained session
  const replayId = completedDb[0]._id.toString();
  const replayRes = await fetch(`http://127.0.0.1:${testPort}/api/interview/${replayId}/replay`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const replayJson = await replayRes.json();
  assert(replayRes.status === 200 && replayJson.session && replayJson.session.questions?.length === 1, "GET /:sessionId/replay returns full question & evaluation data for retained session");

  // Cleanup test user and sessions
  await InterviewSession.deleteMany({ userId: testUser._id });
  await User.findByIdAndDelete(testUser._id);
  server.close();
  await mongoose.disconnect();

  console.log("\n==================================================================");
  console.log(`VERIFICATION RESULT: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================================");

  if (passed === total) {
    console.log("[STATUS] ALL CHECKS 100% SUCCESSFUL!");
  } else {
    process.exit(1);
  }
}

runFullVerification();
