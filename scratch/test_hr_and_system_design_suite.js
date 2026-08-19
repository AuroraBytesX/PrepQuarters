/*
 * Automated Test Suite for HR / Behavioral & System Design Modality Isolation
 * PrepQuarters Priority Repair Verification Pass
 */

const path = require("path");
try {
  require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });
} catch (e) {}
const {
  generateInitialQuestion,
  evaluateAnswerAndGenerateNext,
} = require("../server/services/InterviewService");

let passed = 0;
let total = 0;

function assert(condition, message, details = "") {
  total++;
  if (condition) {
    passed++;
    console.log(`[PASS] Test ${total}: ${message} ${details ? `(${details})` : ""}`);
  } else {
    console.error(`[FAIL] Test ${total}: ${message} ${details ? `(${details})` : ""}`);
  }
}

async function runTests() {
  console.log("==================================================================");
  console.log("PREPQUARTERS HR & SYSTEM DESIGN MODALITY TEST SUITE");
  console.log("==================================================================");

  // 1. HR Mode Opening Question Generation
  console.log("\n--- TEST 1: HR / Behavioral Opening Question ---");
  const hrQ = await generateInitialQuestion({
    role: "Backend Engineer",
    domain: "Software Engineering",
    difficulty: "Medium",
    interviewType: "HR / Behavioral",
  });

  const isHrNonTechnical = !hrQ.questionText.toLowerCase().includes("leetcode") &&
                           !hrQ.questionText.toLowerCase().includes("write a function") &&
                           !hrQ.questionText.toLowerCase().includes("time complexity o(");

  assert(
    hrQ.questionType === "Behavioral" && isHrNonTechnical,
    "HR Mode generates non-technical workplace situational scenario",
    `Topic: ${hrQ.topic}, Question: "${hrQ.questionText.slice(0, 60)}..."`
  );

  // 2. HR Mode Behavioral Evaluation (STAR Framework without coding requirements)
  console.log("\n--- TEST 2: HR Behavioral Answer Evaluation ---");
  const hrEval = await evaluateAnswerAndGenerateNext({
    session: {
      domain: "HR & Leadership",
      role: "Engineering Manager",
      interviewType: "HR / Behavioral",
      totalQuestionsPlanned: 3,
      currentQuestionIndex: 0,
      questions: [],
    },
    currentQuestion: {
      topic: "Conflict Resolution",
      questionType: "Behavioral",
      questionText: "Tell me about a time you strongly disagreed with a colleague on an important technical decision. How did you resolve it?",
      expectedKeyPoints: ["Objective framing", "Active listening", "Constructive compromise or commit"],
    },
    candidateAnswer: "In my previous project, a senior engineer and I disagreed on whether to migrate our database to NoSQL. I scheduled a private discussion where we documented our performance benchmarks and maintenance costs. We agreed to build a two-week prototype. Based on the latency metrics, we decided to remain on PostgreSQL with connection pooling. This maintained team trust and delivered the project two weeks ahead of deadline.",
  });

  assert(
    hrEval.evaluation.score >= 7,
    "HR Behavioral answer evaluated on STAR reasoning and awarded high score without coding syntax",
    `Score: ${hrEval.evaluation.score}/10, Feedback: ${hrEval.evaluation.technicalAccuracy}`
  );

  // 3. HR Mode Zero Score on Irrelevant / Empty Text
  console.log("\n--- TEST 3: HR Zero Score on Irrelevant Answer ---");
  const hrZero = await evaluateAnswerAndGenerateNext({
    session: {
      domain: "HR & Leadership",
      role: "Team Lead",
      interviewType: "HR / Behavioral",
      totalQuestionsPlanned: 3,
      currentQuestionIndex: 0,
      questions: [],
    },
    currentQuestion: {
      topic: "Teamwork & Accountability",
      questionType: "Behavioral",
      questionText: "How do you handle a teammate repeatedly missing deadlines?",
      expectedKeyPoints: ["Empathetic 1-on-1", "Identifying blockers", "Transparent timeline management"],
    },
    candidateAnswer: "asdkjh qwerty keyboard mash pizza burger chocolate",
  });

  assert(
    hrZero.evaluation.score === 0,
    "HR Mode awards strict ZERO score for gibberish/irrelevant text",
    `Score: ${hrZero.evaluation.score}/10`
  );

  // 4. System Design Opening Question Generation (Architecture Reasoning - NO CODING)
  console.log("\n--- TEST 4: System Design Architecture Question ---");
  const sdQ = await generateInitialQuestion({
    role: "Distributed Systems Architect",
    domain: "Software Engineering",
    difficulty: "Hard",
    interviewType: "System Design",
  });

  const isSdDesignOriented = !sdQ.questionText.toLowerCase().includes("write code") &&
                             !sdQ.questionText.toLowerCase().includes("write a function") &&
                             (sdQ.questionType === "System Design" || sdQ.questionType === "Technical");

  assert(
    isSdDesignOriented && (sdQ.expectedKeyPoints.length >= 2),
    "System Design mode generates high-level architecture scenario testing design thinking",
    `Topic: ${sdQ.topic}, Question: "${sdQ.questionText.slice(0, 60)}..."`
  );

  // 5. System Design Domain Adaptation: FinTech
  console.log("\n--- TEST 5: System Design Domain Adaptation (FinTech) ---");
  const finQ = await generateInitialQuestion({
    role: "FinTech Platform Engineer",
    domain: "FinTech",
    difficulty: "Hard",
    interviewType: "System Design",
  });

  const isFinAdapted = finQ.questionText.toLowerCase().includes("ledger") ||
                       finQ.questionText.toLowerCase().includes("transaction") ||
                       finQ.questionText.toLowerCase().includes("payment") ||
                       finQ.questionText.toLowerCase().includes("financial") ||
                       finQ.questionText.toLowerCase().includes("audit");

  assert(
    isFinAdapted,
    "System Design adapts scenario to FinTech ledger/transaction domain",
    `Topic: ${finQ.topic}, Subtopic: ${finQ.subtopic}`
  );

  // 6. System Design Domain Adaptation: Healthcare
  console.log("\n--- TEST 6: System Design Domain Adaptation (Healthcare) ---");
  const healthQ = await generateInitialQuestion({
    role: "Healthcare Systems Engineer",
    domain: "Healthcare",
    difficulty: "Hard",
    interviewType: "System Design",
  });

  const isHealthAdapted = healthQ.questionText.toLowerCase().includes("hipaa") ||
                          healthQ.questionText.toLowerCase().includes("telemetry") ||
                          healthQ.questionText.toLowerCase().includes("patient") ||
                          healthQ.questionText.toLowerCase().includes("medical") ||
                          healthQ.questionText.toLowerCase().includes("encryption");

  assert(
    isHealthAdapted,
    "System Design adapts scenario to Healthcare/HIPAA telemetry domain",
    `Topic: ${healthQ.topic}, Subtopic: ${healthQ.subtopic}`
  );

  console.log("\n==================================================================");
  console.log(`HR & SYSTEM DESIGN TEST SUITE: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================================");

  if (passed === total) {
    console.log("[STATUS] HR & SYSTEM DESIGN MODALITY ISOLATION FULLY VERIFIED WORKING!");
    process.exit(0);
  } else {
    console.error("[STATUS] SOME TESTS FAILED!");
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
