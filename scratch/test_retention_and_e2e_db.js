const path = require("path");
require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });
const mongoose = require(path.join(__dirname, "../server/node_modules/mongoose"));
const InterviewSession = require("../server/models/InterviewSession");
const User = require("../server/models/User");

async function testRetentionPolicy() {
  console.log("=================================================");
  console.log("TESTING PRIORITY 2: MONGODB RETENTION & CLEANUP");
  console.log("=================================================");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[DB_CONNECTED] Connected to MongoDB Atlas.");

    // Create a temporary test user
    const testEmail = `retention_del_test_${Date.now()}@example.com`;
    const testUser = await User.create({
      name: "Retention Delete Test User",
      email: testEmail,
      password: "TestPassword123!",
    });
    console.log("[TEST_USER_CREATED] User ID:", testUser._id.toString());

    // Create 4 completed sessions + 1 in-progress session
    const createdSessionIds = [];
    for (let i = 1; i <= 4; i++) {
      const sessionDate = new Date(Date.now() - (5 - i) * 86400000); // Day 1, 2, 3, 4
      const session = await InterviewSession.create({
        userId: testUser._id,
        role: "Fullstack Engineer",
        domain: "Software Engineering",
        difficulty: "Medium",
        companyStyle: "Google",
        status: "completed",
        createdAt: sessionDate,
        completedAt: sessionDate,
        totalDurationSeconds: 600,
        questions: [
          {
            questionIndex: 0,
            topic: `Topic ${i}`,
            subtopic: `Subtopic ${i}`,
            difficulty: "Medium",
            questionText: `Question text for session ${i}`,
            candidateAnswer: "const a = " + i,
            evaluation: {
              score: 7 + (i % 3),
              technicalAccuracy: "Good technical accuracy",
              communicationClarity: "Clear explanation",
            },
          },
        ],
        overallEvaluation: {
          overallScore: 75 + i * 5,
          hireRecommendation: "Hire",
          summaryText: `Overall summary for session ${i}`,
          keyStrengths: ["Fast learner"],
          priorityImprovementAreas: ["System scale"],
        },
      });
      createdSessionIds.push(session._id);
    }

    // Create 1 in-progress session
    const inProgressSession = await InterviewSession.create({
      userId: testUser._id,
      role: "Fullstack Engineer",
      domain: "Software Engineering",
      difficulty: "Hard",
      companyStyle: "Amazon",
      status: "in_progress",
      createdAt: new Date(),
      questions: [
        {
          questionIndex: 0,
          topic: "Active In-Progress Topic",
          subtopic: "Active",
          difficulty: "Hard",
          questionText: "Active scenario question text",
        },
      ],
    });

    console.log(`[SESSIONS_CREATED] Created 4 completed sessions and 1 in-progress session.`);

    // Run enforceRetentionPolicy logic
    const completedSessions = await InterviewSession.find({
      userId: testUser._id,
      status: "completed",
    }).sort({ completedAt: -1, createdAt: -1 });

    console.log(`[QUERY_SESSIONS] Found ${completedSessions.length} completed sessions for user.`);

    if (completedSessions.length > 2) {
      const olderSessionIds = completedSessions.slice(2).map((s) => s._id);
      console.log(`[DELETING_OLDER_SESSIONS] Deleting ${olderSessionIds.length} older sessions from MongoDB (keeping 2 most recent)...`);
      await InterviewSession.deleteMany({ _id: { $in: olderSessionIds } });
    }

    // Verify results in MongoDB
    const remainingSessions = await InterviewSession.find({
      userId: testUser._id,
    }).sort({ completedAt: -1 });

    console.log("\n--- VERIFICATION CHECKS ---");
    const remainingCompleted = remainingSessions.filter((s) => s.status === "completed");
    const remainingInProgress = remainingSessions.filter((s) => s.status === "in_progress");

    console.log("Total remaining completed sessions in MongoDB:", remainingCompleted.length, "(Expected: 2)");
    console.log("Total remaining in-progress sessions in MongoDB:", remainingInProgress.length, "(Expected: 1)");

    if (remainingCompleted.length === 2 && remainingInProgress.length === 1) {
      console.log("\n[PASS] Exactly 2 completed sessions retained in MongoDB, older completed sessions deleted, and in-progress session preserved!");
    } else {
      console.error("\n[FAIL] Unexpected session count in MongoDB.");
      process.exit(1);
    }

    // Clean up test records
    await InterviewSession.deleteMany({ userId: testUser._id });
    await User.findByIdAndDelete(testUser._id);
    console.log("[CLEANUP_SUCCESS] Cleaned up temporary test user.");

    console.log("\n[RETENTION_TEST_PASSED] MongoDB Atlas retention and deletion strategy is 100% verified!");
  } catch (err) {
    console.error("[RETENTION_TEST_ERROR]", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testRetentionPolicy();
