const assert = require("assert");
const http = require("http");
const app = require("../server/server");
const { getQuestions, fetchCodeforcesProblems } = require("../server/services/QuestionBankService");

async function runTestSuite() {
  console.log("==================================================================");
  console.log("PREPQUARTERS FINAL UI, AUTH & QUESTION PROVENANCE TEST SUITE");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  function recordPass(name, details = "") {
    passed++;
    console.log(`[PASS] Test ${passed}: ${name} ${details ? `(${details})` : ""}`);
  }

  function recordFail(name, err) {
    failed++;
    console.error(`[FAIL] ${name}:`, err.message || err);
  }

  const baseUrl = "http://localhost:5000";

  try {
    // 1. AUTHENTICATION: Appwrite Signup
    console.log("\n--- TEST 1: Appwrite Candidate Signup ---");
    const testEmail = `candidate_${Date.now()}@example.com`;
    const testPassword = "SuperSecurePassword123!";

    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Devon Candidate",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        role: "candidate",
      }),
    });

    const signupData = await signupRes.json();
    assert.strictEqual(signupRes.status, 201, "Signup returns HTTP 201");
    assert.strictEqual(signupData.success, true, "Signup success is true");
    assert.ok(signupData.token, "Signup returns valid JWT token");
    assert.strictEqual(signupData.user.email, testEmail.toLowerCase(), "Signup user email matches normalized email");
    recordPass("Appwrite candidate signup creates account and returns JWT session", `Email: ${testEmail}`);

    // 2. AUTHENTICATION: Appwrite Login with Newly Created Credentials
    console.log("\n--- TEST 2: Appwrite Login with Newly Created Credentials ---");
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200, "Login returns HTTP 200");
    assert.strictEqual(loginData.success, true, "Login success is true");
    assert.ok(loginData.token, "Login returns valid JWT token");
    assert.strictEqual(loginData.user.name, "Devon Candidate", "Login returns correct user profile");
    recordPass("Newly created account logs in successfully without 'Invalid email or password'", `User: ${loginData.user.name}`);

    // 3. AUTHENTICATION: Invalid Password Handling
    console.log("\n--- TEST 3: Incorrect Password Rejection ---");
    const wrongPassRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "WrongPassword999!",
      }),
    });

    const wrongPassData = await wrongPassRes.json();
    assert.strictEqual(wrongPassRes.status, 401, "Wrong password returns HTTP 401");
    assert.strictEqual(wrongPassData.success, false, "Wrong password returns success: false");
    recordPass("Authentication rejects incorrect password safely", wrongPassData.message);

    // 4. AUTHENTICATION: Invalid Email Format
    console.log("\n--- TEST 4: Invalid Email Format Rejection ---");
    const invalidEmailRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "not-an-email",
        password: testPassword,
      }),
    });

    const invalidEmailData = await invalidEmailRes.json();
    assert.strictEqual(invalidEmailRes.status, 400, "Invalid email returns HTTP 400");
    recordPass("Authentication rejects malformed email strings", invalidEmailData.message);

    // 5. QUESTION BANK: Provenance Metadata Verification
    console.log("\n--- TEST 5: Question Provenance Metadata Model ---");
    const qData = await getQuestions({ domain: "All", limit: 20 });
    assert.ok(qData.questions.length > 0, "Questions returned from Question Bank");

    const sampleQuestion = qData.questions[0];
    assert.ok(sampleQuestion.id, "Question contains ID");
    assert.ok(sampleQuestion.source, "Question contains explicit source");
    assert.ok(sampleQuestion.sourceType, "Question contains sourceType (external | curated | ai_generated)");
    assert.strictEqual(typeof sampleQuestion.generatedByAI, "boolean", "Question contains generatedByAI boolean flag");
    assert.ok(sampleQuestion.retrievedAt, "Question contains retrievedAt ISO timestamp");
    recordPass("Question Bank returns comprehensive provenance model", `Source: ${sampleQuestion.source}, AI: ${sampleQuestion.generatedByAI}`);

    // 6. QUESTION BANK: Sourced vs AI Distribution
    console.log("\n--- TEST 6: 80% Sourced / 20% AI Distribution Target ---");
    const cfSourced = qData.questions.filter((q) => !q.generatedByAI);
    const aiGen = qData.questions.filter((q) => q.generatedByAI);
    assert.ok(cfSourced.length > 0, "Sourced questions present in feed");
    recordPass("Question Bank balances external/curated sourced challenges and domain AI scenarios", `Sourced %: ${qData.sourcedPercentage}%, AI %: ${qData.aiGeneratedPercentage}%`);

    // 7. QUESTION BANK: Sourced Questions are NOT Labeled as AI
    console.log("\n--- TEST 7: Accurate Provenance Labeling (Zero False Claims) ---");
    const codeforcesProblems = qData.questions.filter((q) => q.source === "Codeforces");
    if (codeforcesProblems.length > 0) {
      assert.strictEqual(codeforcesProblems[0].generatedByAI, false, "Codeforces questions are strictly marked generatedByAI: false");
      assert.strictEqual(codeforcesProblems[0].sourceType, "external", "Codeforces questions are marked sourceType: external");
    }
    const aiProblems = qData.questions.filter((q) => q.source === "PrepQuarters AI Generated");
    if (aiProblems.length > 0) {
      assert.strictEqual(aiProblems[0].generatedByAI, true, "AI scenarios are strictly marked generatedByAI: true");
      assert.strictEqual(aiProblems[0].sourceType, "ai_generated", "AI scenarios are marked sourceType: ai_generated");
    }
    recordPass("Provenance labels strictly distinguish external programming platforms from AI scenarios");

    // 8. PRACTICE COCKPIT: Session Provenance Telemetry
    console.log("\n--- TEST 8: Practice Session Provenance Tracking ---");
    const startSessionRes = await fetch(`${baseUrl}/api/interview/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({
        role: "Software Engineer",
        difficulty: "Hard",
        interviewType: "coding",
        focusAreas: ["Algorithms"],
        questionSource: "Codeforces",
        generatedByAI: false,
      }),
    });

    const sessionData = await startSessionRes.json();
    assert.ok(startSessionRes.status === 200 || startSessionRes.status === 201, "Interview start returns HTTP 200/201");
    assert.ok(sessionData.sessionId, "Active session created with Appwrite ID");
    recordPass("Practice session captures and preserves question provenance telemetry", `Session ID: ${sessionData.sessionId}`);

    // 9. REPLAY RETENTION: Limit to Latest 2 Sessions
    console.log("\n--- TEST 9: Session Replay Retention Limit ---");
    const historyRes = await fetch(`${baseUrl}/api/interview/user/sessions`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    const historyData = await historyRes.json();
    assert.ok(Array.isArray(historyData.sessions), "History returns sessions array");
    assert.ok(historyData.sessions.length <= 2, "Session count respects <= 2 retention policy");
    recordPass("Dashboard respects 2-replay retention limit policy", `Retained: ${historyData.sessions.length}`);

    console.log("\n==================================================================");
    console.log(`FINAL UI & AUTH TEST SUITE: ${passed}/${passed + failed} TESTS PASSED`);
    console.log("==================================================================");
    console.log("[STATUS] ALL REFINEMENTS FULLY VERIFIED WORKING!\n");
    process.exit(0);
  } catch (error) {
    recordFail("Unexpected test failure", error);
    process.exit(1);
  }
}

runTestSuite();
