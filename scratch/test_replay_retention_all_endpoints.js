const path = require("path");
const http = require("http");
require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });
const mongoose = require(path.join(__dirname, "../server/node_modules/mongoose"));
const express = require(path.join(__dirname, "../server/node_modules/express"));
const cors = require(path.join(__dirname, "../server/node_modules/cors"));
const jwt = require(path.join(__dirname, "../server/node_modules/jsonwebtoken"));

const User = require("../server/models/User");
const InterviewSession = require("../server/models/InterviewSession");
const interviewRouter = require("../server/routes/interview");

async function testAllHistoryReplayEndpoints() {
  console.log("=================================================");
  console.log("TESTING ALL REPLAY & RETENTION ENDPOINTS VIA HTTP");
  console.log("=================================================");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("[DB_CONNECTED] Connected to MongoDB Atlas.");

  const testUser = await User.create({
    name: "Replay Test User",
    email: `replay_e2e_${Date.now()}@example.com`,
    password: "TestPassword123!",
  });
  console.log("[USER_CREATED] User ID:", testUser._id.toString());

  const token = jwt.sign(
    { userId: testUser._id.toString(), email: testUser.email },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "1h" }
  );

  // Create 5 completed sessions (Dates: T-5 days, T-4 days, T-3 days, T-2 days, T-1 day)
  const createdCompletedIds = [];
  for (let i = 1; i <= 5; i++) {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const session = await InterviewSession.create({
      userId: testUser._id,
      role: "Software Engineer",
      domain: "Software Engineering",
      difficulty: "Medium",
      companyStyle: "Google",
      status: "completed",
      createdAt: d,
      completedAt: d,
      totalDurationSeconds: 400 + i * 50,
      questions: [
        {
          questionIndex: 0,
          topic: `System Scaling Phase ${i}`,
          subtopic: "Architecture",
          difficulty: "Medium",
          questionText: `Question text for completed session ${i}`,
          candidateAnswer: `Detailed answer for session ${i} covering microservices and caching.`,
          evaluation: {
            score: 6 + (i % 4),
            technicalAccuracy: `Solid technical depth for session ${i}`,
            communicationClarity: "Clear explanation",
            strengths: ["Clean modularity"],
            improvements: ["Scale horizontally"],
            keyMissedPoints: ["Cache invalidation"],
          },
        },
      ],
      overallEvaluation: {
        overallScore: 70 + i * 4,
        hireRecommendation: "Hire",
        summaryText: `Summary scorecard for session ${i}`,
        keyStrengths: ["Strong engineering fundamentals"],
        priorityImprovementAreas: ["Distributed caching"],
        skillGapAnalysis: [],
      },
    });
    createdCompletedIds.push(session._id);
  }

  // Create 1 active in-progress session
  const inProgressSession = await InterviewSession.create({
    userId: testUser._id,
    role: "Software Engineer",
    domain: "Software Engineering",
    difficulty: "Hard",
    companyStyle: "Meta",
    status: "in_progress",
    createdAt: new Date(),
    questions: [
      {
        questionIndex: 0,
        topic: "Active In-Progress Challenge",
        subtopic: "Concurrency",
        difficulty: "Hard",
        questionText: "In-progress active question text",
      },
    ],
  });

  console.log(`[SEEDED_DATA] Seeded 5 completed sessions and 1 in-progress session in MongoDB.`);

  // Verify raw DB count before API call
  const initialDbSessions = await InterviewSession.find({ userId: testUser._id });
  console.log(`[RAW_DB_COUNT_BEFORE_API] Total sessions in MongoDB: ${initialDbSessions.length} (5 completed, 1 in-progress)`);

  // Start Express test server
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/interview", interviewRouter);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5098, resolve));
  console.log("[SERVER_RUNNING] API test server listening on port 5098");

  // Step 1: Call GET /api/interview/history/all
  console.log("\n--- STEP 1: CALLING GET /api/interview/history/all ---");
  const historyRes = await fetch("http://127.0.0.1:5098/api/interview/history/all", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const historyJson = await historyRes.json();
  console.log("[HISTORY_STATUS]:", historyRes.status);
  console.log("[HISTORY_SESSIONS_RETURNED]:", historyJson.sessions?.length);

  // Step 2: Verify MongoDB state after history call
  const dbAfterHistory = await InterviewSession.find({ userId: testUser._id });
  const completedInDb = dbAfterHistory.filter((s) => s.status === "completed");
  const inProgressInDb = dbAfterHistory.filter((s) => s.status === "in_progress");

  console.log(`[MONGODB_AUDIT_AFTER_HISTORY]`);
  console.log("- Total Completed Sessions in MongoDB:", completedInDb.length, "(Expected: 2)");
  console.log("- Total In-Progress Sessions in MongoDB:", inProgressInDb.length, "(Expected: 1)");

  // Step 3: Call GET /api/interview/stats/summary
  console.log("\n--- STEP 2: CALLING GET /api/interview/stats/summary ---");
  const statsRes = await fetch("http://127.0.0.1:5098/api/interview/stats/summary", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const statsJson = await statsRes.json();
  console.log("[STATS_STATUS]:", statsRes.status);
  console.log("[STATS_AVERAGE_SCORE]:", statsJson.averageScore);
  console.log("[STATS_PERFORMANCE_TRENDS_COUNT]:", statsJson.performanceTrends?.length);

  // Step 4: Call GET /api/interview/:sessionId/replay on the retained completed session
  const latestSessionId = completedInDb[0]._id.toString();
  console.log(`\n--- STEP 3: CALLING GET /api/interview/${latestSessionId}/replay ---`);
  const replayRes = await fetch(`http://127.0.0.1:5098/api/interview/${latestSessionId}/replay`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const replayJson = await replayRes.json();
  console.log("[REPLAY_STATUS]:", replayRes.status);
  console.log("[REPLAY_QUESTIONS_COUNT]:", replayJson.session?.questions?.length);
  console.log("[REPLAY_OVERALL_EVAL_SCORE]:", replayJson.session?.overallEvaluation?.overallScore);

  server.close();

  // Cleanup test user and sessions
  await InterviewSession.deleteMany({ userId: testUser._id });
  await User.findByIdAndDelete(testUser._id);
  await mongoose.disconnect();
  console.log("\n[CLEANUP] Test user and test sessions cleaned up.");

  // Assertions
  const historyCountPass = historyJson.sessions?.length === 2;
  const dbCompletedCountPass = completedInDb.length === 2;
  const inProgressPreserved = inProgressInDb.length === 1;
  const replayPass = replayRes.status === 200 && replayJson.session?.questions?.length === 1;

  if (historyCountPass && dbCompletedCountPass && inProgressPreserved && replayPass) {
    console.log("\n=================================================");
    console.log("[TEST_PASSED] MONGODB RETENTION & REPLAY ENDPOINTS 100% VERIFIED!");
    console.log("=================================================");
  } else {
    console.error("\n=================================================");
    console.error("[TEST_FAILED] Retention or replay assertion failed.");
    console.error("=================================================");
    process.exit(1);
  }
}

testAllHistoryReplayEndpoints();
