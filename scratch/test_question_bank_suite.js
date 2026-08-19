const path = require("path");
require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });

const { getQuestions, fetchCodeforcesProblems } = require("../server/services/QuestionBankService");

async function runQuestionBankTests() {
  console.log("==================================================================");
  console.log("PREPQUARTERS QUESTION BANK TEST SUITE");
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

  // TEST 1: Fetch Codeforces Problems
  console.log("\n--- TEST 1: Sourced Problem Ingestion ---");
  const sourced = await fetchCodeforcesProblems();
  assert(Array.isArray(sourced) && sourced.length > 0, "Fetch Codeforces problems returns normalized array", `Count: ${sourced.length}`);

  // TEST 2: Problem Schema Compliance
  console.log("\n--- TEST 2: Problem Schema Completeness ---");
  const firstProblem = sourced[0] || {};
  const hasRequiredFields = Boolean(
    firstProblem.id &&
    firstProblem.title &&
    firstProblem.topic &&
    firstProblem.difficulty &&
    firstProblem.questionText &&
    firstProblem.problemStatement &&
    firstProblem.questionType &&
    Array.isArray(firstProblem.tags)
  );
  assert(hasRequiredFields, "Sourced problem contains all required fields (questionText, problemStatement, etc.)", `ID: ${firstProblem.id}, Title: ${firstProblem.title}`);

  // TEST 3: Sourced Distribution Ratio
  console.log("\n--- TEST 3: Sourced vs Curated Distribution Target ---");
  const resAll = await getQuestions({ page: 1, limit: 20 });
  assert(resAll.success && resAll.questions.length > 0, "getQuestions returns paginated question set", `Returned: ${resAll.questions.length}, Total: ${resAll.total}`);
  assert(resAll.sourcedPercentage >= 50, "Sourced percentage meets target distribution", `Sourced: ${resAll.sourcedPercentage}%`);

  // TEST 4: Search Filter
  console.log("\n--- TEST 4: Search Filter ---");
  const resSearch = await getQuestions({ search: "array", limit: 10 });
  const searchMatches = resSearch.questions.every((q) =>
    q.title.toLowerCase().includes("array") ||
    q.topic.toLowerCase().includes("array") ||
    (q.tags && q.tags.some((t) => t.toLowerCase().includes("array"))) ||
    (q.questionText && q.questionText.toLowerCase().includes("array"))
  );
  assert(resSearch.success && searchMatches, "Search filter accurately scopes results to query", `Found: ${resSearch.questions.length}`);

  // TEST 5: Difficulty Filter
  console.log("\n--- TEST 5: Difficulty Filter ---");
  const resHard = await getQuestions({ difficulty: "Hard", limit: 10 });
  const allHard = resHard.questions.every((q) => q.difficulty === "Hard");
  assert(resHard.success && allHard, "Difficulty filter strictly returns requested difficulty level", `Count: ${resHard.questions.length}`);

  // TEST 6: Pagination Boundaries
  console.log("\n--- TEST 6: Pagination Boundaries ---");
  const page1 = await getQuestions({ page: 1, limit: 5 });
  const page2 = await getQuestions({ page: 2, limit: 5 });
  const isDistinct = page1.questions[0]?.id !== page2.questions[0]?.id;
  assert(isDistinct, "Pagination serves distinct problem subsets across pages", `Page 1 ID: ${page1.questions[0]?.id}, Page 2 ID: ${page2.questions[0]?.id}`);

  // TEST 7: Expanded DSA Coverage (Trees, Graphs, DP, Linked Lists)
  console.log("\n--- TEST 7: Expanded DSA Coverage ---");
  const resTree = await getQuestions({ search: "binary", limit: 5 });
  const resGraph = await getQuestions({ search: "island", limit: 5 });
  const resDp = await getQuestions({ search: "coin", limit: 5 });
  const resList = await getQuestions({ search: "linked", limit: 5 });
  const hasExpanded = resTree.questions.length > 0 && resGraph.questions.length > 0 && resDp.questions.length > 0 && resList.questions.length > 0;
  assert(hasExpanded, "Question Bank covers expanded DSA topics (Trees, Graphs, DP, Linked Lists)", `Found all expanded categories`);

  // TEST 8: Question Type Filter (Behavioral & System Design)
  console.log("\n--- TEST 8: Question Type Filter (Behavioral & System Design) ---");
  const resBehav = await getQuestions({ questionType: "Behavioral", limit: 5 });
  const resSd = await getQuestions({ questionType: "System Design", limit: 5 });
  const hasTypeFilter = resBehav.questions.length > 0 && resSd.questions.length > 0;
  assert(hasTypeFilter, "Question Bank correctly filters by Behavioral and System Design question types", `Behavioral: ${resBehav.questions.length}, SD: ${resSd.questions.length}`);

  console.log("\n==================================================================");
  console.log(`QUESTION BANK SUITE: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================================");

  if (passed === total) {
    console.log("[STATUS] QUESTION BANK INTEGRATION FULLY VERIFIED WORKING!");
  } else {
    process.exit(1);
  }
}

runQuestionBankTests();
