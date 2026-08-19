const path = require("path");
require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });

const { evaluateAnswerAndGenerateNext } = require("../server/services/InterviewService");

async function runEvaluationTests() {
  console.log("==================================================================");
  console.log("PREPQUARTERS AI EVALUATION TEST SUITE (SECTION 43)");
  console.log("==================================================================");

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = "") {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${testName} (Details: ${details})`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${testName} - Details: ${details}`);
    }
  }

  const mockSession = {
    role: "Backend Distributed Engineer",
    domain: "Software Engineering",
    difficulty: "Hard",
    companyStyle: "Google",
    totalQuestionsPlanned: 3,
    currentQuestionIndex: 0,
    questions: [],
  };

  const sampleQuestion = {
    topic: "System Design",
    subtopic: "Rate Limiting",
    questionType: "Technical",
    difficulty: "Hard",
    questionText: "How would you design a distributed, fault-tolerant rate limiting service handling 100,000 requests per second across multiple data centers?",
    expectedKeyPoints: [
      "Token bucket or sliding window counter algorithm",
      "Distributed Redis cluster with Lua scripts or CRDTs for atomic increment",
      "Handling network partitions and failing open vs closed to preserve uptime",
      "Local in-memory token caching to reduce Redis latency",
    ],
  };

  // CASE 1: Correct technical answer
  console.log("\n--- TEST CASE 1: Correct Technical Answer ---");
  const case1Ans = "I would implement a sliding window counter algorithm utilizing a distributed Redis cluster. To minimize Redis roundtrips under 100k RPS, nodes maintain local in-memory token caches that synchronize asynchronously in batches. For multi-datacenter consistency, we use localized counters with eventual consistency via Redis replication. During network partitions, the rate limiter fails open to prevent cascading service downtime, while logging alerts to observability dashboards.";
  const res1 = await evaluateAnswerAndGenerateNext({
    session: mockSession,
    currentQuestion: sampleQuestion,
    candidateAnswer: case1Ans,
    timeSpentSeconds: 45,
  });
  const score1 = res1.evaluation?.score;
  assert(score1 >= 7, "CASE 1: Correct technical answer receives meaningful high score", `Score: ${score1}/10`);

  // CASE 2: Correct but incomplete answer (Partial credit allowed)
  console.log("\n--- TEST CASE 2: Correct but Incomplete Answer ---");
  const case2Ans = "We can use a token bucket algorithm with Redis to track user request counts and reject requests when the limit is exceeded.";
  const res2 = await evaluateAnswerAndGenerateNext({
    session: mockSession,
    currentQuestion: sampleQuestion,
    candidateAnswer: case2Ans,
    timeSpentSeconds: 20,
  });
  const score2 = res2.evaluation?.score;
  assert(score2 >= 2 && score2 <= 6, "CASE 2: Correct but incomplete answer receives partial credit", `Score: ${score2}/10`);

  // CASE 3: Completely unrelated answer
  console.log("\n--- TEST CASE 3: Completely Unrelated Answer ---");
  const case3Ans = "To bake a chocolate cake, you need flour, sugar, cocoa powder, baking soda, and eggs. Mix dry ingredients first, then add wet ingredients and bake at 350 degrees.";
  const res3 = await evaluateAnswerAndGenerateNext({
    session: mockSession,
    currentQuestion: sampleQuestion,
    candidateAnswer: case3Ans,
    timeSpentSeconds: 15,
  });
  const score3 = res3.evaluation?.score || (res3.isValidAnswer === false ? 0 : 0);
  assert(score3 === 0, "CASE 3: Completely unrelated answer receives strict ZERO score", `Score: ${score3}/10`);

  // CASE 4: Keyboard smash / gibberish
  console.log("\n--- TEST CASE 4: Gibberish / Keyboard Smash ---");
  const case4Ans = "asdfghjkl zxcvbnm qwertyuiop asdfghjkl zxcvbnm";
  const res4 = await evaluateAnswerAndGenerateNext({
    session: mockSession,
    currentQuestion: sampleQuestion,
    candidateAnswer: case4Ans,
    timeSpentSeconds: 5,
  });
  const score4 = res4.evaluation?.score || 0;
  assert(score4 === 0, "CASE 4: Gibberish receives strict ZERO score", `Score: ${score4}/10`);

  // CASE 5: Long (250-line) but technically empty text
  console.log("\n--- TEST CASE 5: Long but Technically Empty Text ---");
  const case5Lines = [];
  for (let i = 0; i < 25; i++) {
    case5Lines.push("Software engineering is a very interesting discipline where developers collaborate on projects every day and work hard to write software for users.");
  }
  const case5Ans = case5Lines.join("\n");
  const res5 = await evaluateAnswerAndGenerateNext({
    session: mockSession,
    currentQuestion: sampleQuestion,
    candidateAnswer: case5Ans,
    timeSpentSeconds: 60,
  });
  const score5 = res5.evaluation?.score || 0;
  assert(score5 === 0, "CASE 5: Long (25-line paragraph) generic filler receives strict ZERO score", `Score: ${score5}/10`);

  // CASE 6: Keyword stuffing without understanding
  console.log("\n--- TEST CASE 6: Keyword Stuffing Without Understanding ---");
  const case6Ans = "Redis token bucket latency throughput distributed partition sliding window cache cluster algorithm scale memory cpu load balancer request response.";
  const res6 = await evaluateAnswerAndGenerateNext({
    session: mockSession,
    currentQuestion: sampleQuestion,
    candidateAnswer: case6Ans,
    timeSpentSeconds: 15,
  });
  const score6 = res6.evaluation?.score || 0;
  assert(score6 <= 2, "CASE 6: Keyword list without reasoning receives ZERO or negligible mark", `Score: ${score6}/10`);

  // CASE 7: Technically incorrect assertions
  console.log("\n--- TEST CASE 7: Technically Incorrect Assertions ---");
  const case7Ans = "Rate limiting should be done by storing all user request timestamps in a single flat text file on a single frontend web server hard drive and locking the file with flock on every request.";
  const res7 = await evaluateAnswerAndGenerateNext({
    session: mockSession,
    currentQuestion: sampleQuestion,
    candidateAnswer: case7Ans,
    timeSpentSeconds: 25,
  });
  const score7 = res7.evaluation?.score || 0;
  assert(score7 <= 2, "CASE 7: Fundamentally flawed architecture receives near ZERO", `Score: ${score7}/10`);

  // CASE 8: Technically correct answer with weak communication
  console.log("\n--- TEST CASE 8: Technically Correct with Weak Communication ---");
  const case8Ans = "Token bucket on Redis. Lua scripts to make it atomic. Local cache on machines to not hit Redis every time. If Redis drops, fail open so users aren't blocked.";
  const res8 = await evaluateAnswerAndGenerateNext({
    session: mockSession,
    currentQuestion: sampleQuestion,
    candidateAnswer: case8Ans,
    timeSpentSeconds: 30,
  });
  const score8 = res8.evaluation?.score;
  assert(score8 >= 6, "CASE 8: Correct technical substance with conversational shorthand preserves technical credit", `Score: ${score8}/10`);

  // CASE 9: Spoken transcript with minor conversational filler
  console.log("\n--- TEST CASE 9: Spoken Voice Transcript with Speech Filler ---");
  const case9Ans = "Um, so basically, yeah, I would, uh, use a sliding window counter on a distributed Redis cluster. And, like, we would use Lua scripts for atomic increments. And, you know, if there is a network partition between datacenters, the system should fail open to keep latency low.";
  const res9 = await evaluateAnswerAndGenerateNext({
    session: mockSession,
    currentQuestion: sampleQuestion,
    candidateAnswer: case9Ans,
    timeSpentSeconds: 40,
  });
  const score9 = res9.evaluation?.score;
  assert(score9 >= 7, "CASE 9: Spoken transcript with minor speech filler evaluates technical meaning accurately", `Score: ${score9}/10`);

  console.log("\n==================================================================");
  console.log(`AI EVALUATION SUITE: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================================");

  if (passed === total) {
    console.log("[STATUS] AI EVALUATION REWORK FULLY VERIFIED WORKING!");
  } else {
    process.exit(1);
  }
}

runEvaluationTests();
