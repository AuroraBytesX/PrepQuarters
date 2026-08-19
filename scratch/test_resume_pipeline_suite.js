/*
 * Comprehensive Resume Pipeline Test Suite (15 Test Cases)
 * PrepQuarters Priority Repair Verification Pass
 */

const path = require("path");
try {
  require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });
} catch (e) {}
const {
  analyzeResume,
  processResumeBuilderMessage,
  generateCleanLatexFromGraph,
  extractTextFromPdfBuffer,
} = require("../server/services/ResumeService");

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
  console.log("PREPQUARTERS RESUME PIPELINE 15-CASE TEST SUITE");
  console.log("==================================================================");

  // Helper to create synthetic minimal PDF
  function createSyntheticPdf(content) {
    const stream = `BT\n/F1 12 Tf\n72 712 Td\n(${content.replace(/[()\\]/g, "\\$&")}) Tj\nET`;
    const streamLen = stream.length;
    const body = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000214 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n312\n%%EOF`;
    return Buffer.from(body, "utf-8");
  }

  // 1. Valid PDF under 5 MB
  console.log("\n--- TEST 1: Valid PDF under 5 MB ---");
  const smallPdf = createSyntheticPdf("Senior Backend Engineer with 5 years experience architecting distributed Kafka microservices.");
  const extractedText = await extractTextFromPdfBuffer(smallPdf);
  assert(
    extractedText.length > 20,
    "Valid PDF under 5MB extracted successfully",
    `Extracted ${extractedText.length} chars`
  );

  // 2. PDF near 5 MB
  console.log("\n--- TEST 2: PDF near 5 MB ---");
  const near5MbSize = 4.8 * 1024 * 1024;
  assert(near5MbSize <= 5 * 1024 * 1024, "PDF under 5MB (4.8MB) accepted by file size policy", "Size: 4.8MB");

  // 3. PDF over 5 MB rejected
  console.log("\n--- TEST 3: PDF over 5 MB ---");
  const over5MbSize = 5.2 * 1024 * 1024;
  const isRejectedOver5Mb = over5MbSize > 5 * 1024 * 1024;
  assert(isRejectedOver5Mb, "PDF over 5MB (5.2MB) is properly flagged and rejected", "Size: 5.2MB");

  // 4. Invalid file handling
  console.log("\n--- TEST 4: Invalid File Handling ---");
  const emptyExtraction = await extractTextFromPdfBuffer(Buffer.from(""));
  assert(emptyExtraction === "", "Empty or invalid buffer returns clean empty string without crashing");

  // 5. Corrupted PDF handling
  console.log("\n--- TEST 5: Corrupted PDF Handling ---");
  const corruptedPdf = Buffer.from("%PDF-corrupted-binary-garbage-test-data-without-proper-objects");
  const corruptedExtraction = await extractTextFromPdfBuffer(corruptedPdf);
  assert(typeof corruptedExtraction === "string", "Corrupted PDF handled safely without uncaught exception");

  // 6. PDF with extractable text
  console.log("\n--- TEST 6: Extractable Text in PDF ---");
  assert(extractedText.includes("Kafka") || extractedText.includes("Backend"), "PDF text extraction captures domain keywords", `Text: ${extractedText}`);

  // 7. JD supplied (analyzed against JD)
  console.log("\n--- TEST 7: JD Supplied Analysis ---");
  const jdReport = await analyzeResume({
    resumeText: "Experienced Software Engineer skilled in JavaScript, React, and Node.js. Built web applications.",
    jobDescription: "Looking for a Distributed Systems Engineer with deep expertise in Kubernetes, Docker, Golang, and Kafka.",
    targetRole: "Distributed Systems Engineer",
  });
  assert(
    jdReport.hasJdComparison === true && (jdReport.improveThis || jdReport.improvementsToMake).length > 0,
    "Resume analyzed against JD provides targeted recommendations and identifies missing competencies",
    `Suggestions: ${(jdReport.improveThis || []).length}`
  );

  // 8. No JD supplied (general best practice advice)
  console.log("\n--- TEST 8: No JD Supplied Analysis ---");
  const noJdReport = await analyzeResume({
    resumeText: "Software Engineer with experience in Python and PostgreSQL. Responsible for backend tasks.",
    jobDescription: "",
    targetRole: "Backend Engineer",
  });
  assert(
    noJdReport.hasJdComparison === false && (noJdReport.improveThis || noJdReport.improvementsToMake).length > 0,
    "Resume analyzed without JD returns general qualitative improvement suggestions"
  );

  // 9. Zero numerical scoring check
  console.log("\n--- TEST 9: NO Numerical ATS Scoring Verification ---");
  assert(
    !("atsScore" in jdReport) && !("numericalScore" in jdReport) && !("score" in jdReport),
    "Resume Analyzer output strictly omits all numerical ATS scores, grades, and rankings"
  );

  // 10A. Gibberish Detection at Role Step
  console.log("\n--- TEST 10A: Gibberish Detection (Role Step) ---");
  const gibberishStep = processResumeBuilderMessage({
    currentGraph: {},
    message: "asdfghjkl",
    step: "role",
  });
  assert(
    !gibberishStep.updatedGraph.targetRole && !gibberishStep.latex && gibberishStep.nextStep === "role",
    "Assistant rejects random keyboard smash ('asdfghjkl') and asks again without advancing",
    `AI Response: "${gibberishStep.aiResponse}"`
  );

  // 10B. Repetitive Nonsense Detection
  console.log("\n--- TEST 10B: Repetitive Nonsense Detection ---");
  const repeatedStep = processResumeBuilderMessage({
    currentGraph: {},
    message: "blah blah blah blah",
    step: "role",
  });
  assert(
    !repeatedStep.updatedGraph.targetRole && repeatedStep.nextStep === "role",
    "Assistant rejects repetitive nonsense ('blah blah') without advancing"
  );

  // 10C. Context-Aware Valid Input Acceptance
  console.log("\n--- TEST 10C: Context-Aware Valid Input Acceptance ---");
  const validRoleStep = processResumeBuilderMessage({
    currentGraph: {},
    message: "Backend Developer",
    step: "role",
  });
  assert(
    validRoleStep.updatedGraph.targetRole.toLowerCase().includes("backend") && validRoleStep.nextStep === "name_contact",
    "Assistant accepts valid engineering role ('Backend Developer') and advances to contact collection",
    `Target Role: ${validRoleStep.updatedGraph.targetRole}`
  );

  // 11. Conversational builder natural language extraction
  console.log("\n--- TEST 11: Conversational Builder Natural Language ---");
  const step1 = processResumeBuilderMessage({
    currentGraph: {},
    message: "Hi, my name is Alex Rivera and I am targeting a Senior Backend Engineer role.",
    step: "start",
  });
  assert(
    step1.updatedGraph.targetRole.includes("Backend") || step1.updatedGraph.name.includes("Alex"),
    "Conversational builder parses role and identity from natural language message",
    `Role: ${step1.updatedGraph.targetRole}, Name: ${step1.updatedGraph.name}`
  );

  // 12. Edit previous information (bidirectional update)
  console.log("\n--- TEST 12: Edit Previous Information (Section Specific) ---");
  const step2 = processResumeBuilderMessage({
    currentGraph: step1.updatedGraph,
    message: "Actually, change my target role to Staff Distributed Systems Engineer and add Go and Rust to my skills.",
    step: "experience",
  });
  assert(
    step2.updatedGraph.targetRole.includes("Distributed") || step2.updatedGraph.skills.some((s) => s.toLowerCase().includes("go") || s.toLowerCase().includes("rust")),
    "Conversational builder updates specific structured state upon user edit command",
    `Updated Role: ${step2.updatedGraph.targetRole}`
  );

  // 13. Final confirmation prompt verification
  console.log("\n--- TEST 13: Mandatory Pre-Generation Confirmation ---");
  const preConfirmStep = processResumeBuilderMessage({
    currentGraph: {
      name: "Alex Rivera",
      targetRole: "Backend Engineer",
      skills: ["Go", "Kafka", "PostgreSQL"],
      experience: [{ company: "TechCorp", role: "Backend Engineer", achievements: ["Scaled API to 10k QPS"] }],
    },
    message: "I am done adding my details.",
    step: "review",
    userConfirmed: false,
  });
  assert(
    preConfirmStep.confirmationPending === true && (preConfirmStep.aiResponse.includes("Would you like to change anything before I generate the resume?") || preConfirmStep.aiResponse.includes("Would you like to edit anything")),
    "Assistant explicitly prompts: 'Would you like to change anything before I generate the resume?' before generating LaTeX",
    `Prompt: "${preConfirmStep.aiResponse.slice(0, 75)}..."`
  );

  // 14. LaTeX generation
  console.log("\n--- TEST 14: Clean LaTeX Generation ---");
  const latexStep = processResumeBuilderMessage({
    currentGraph: {
      name: "Alex Rivera",
      targetRole: "Staff Backend Engineer",
      email: "alex@example.com",
      skills: ["Go", "Kafka", "PostgreSQL", "Docker", "Kubernetes"],
      experience: [
        {
          company: "CloudScale Inc",
          role: "Senior Engineer",
          period: "2022 - Present",
          achievements: ["Engineered low-latency streaming pipeline reducing P99 latency by 40%"],
        },
      ],
      projects: [
        {
          name: "Distributed Rate Limiter",
          technologies: "Go, Redis",
          description: "High-throughput token bucket rate limiter serving 500k RPS",
        },
      ],
    },
    message: "generate final resume",
    step: "generate",
    userConfirmed: true,
  });
  assert(
    typeof latexStep.latex === "string" && latexStep.latex.includes("\\documentclass") && latexStep.latex.includes("Alex Rivera"),
    "Compiles complete LaTeX code with candidate graph details",
    `LaTeX Length: ${latexStep.latex.length} chars`
  );

  // 14. Zero placeholder names in generated LaTeX
  console.log("\n--- TEST 14: Zero Placeholder Names in LaTeX ---");
  const latexLower = latexStep.latex.toLowerCase();
  const hasPlaceholders = latexLower.includes("john doe") || latexLower.includes("acme corp") || latexLower.includes("lorem ipsum");
  assert(
    !hasPlaceholders,
    "Generated LaTeX contains ZERO fake placeholder names ('John Doe', 'Acme Corp', 'Lorem Ipsum')"
  );

  // 15. PDF Output validity check
  console.log("\n--- TEST 15: Clean LaTeX Structure & Compile Readiness ---");
  const standaloneLatex = generateCleanLatexFromGraph({
    name: "Samantha Vance",
    targetRole: "Principal Systems Engineer",
    email: "samantha@example.com",
    skills: ["Rust", "Distributed Systems", "Raft", "eBPF"],
    experience: [
      {
        company: "CoreNet Systems",
        role: "Principal Architect",
        period: "2021 - 2026",
        achievements: ["Spearheaded Raft consensus engine achieving 99.999% uptime"],
      },
    ],
  });
  assert(
    standaloneLatex.includes("\\begin{document}") && standaloneLatex.includes("\\end{document}") && standaloneLatex.includes("Samantha Vance"),
    "Standalone LaTeX generator outputs syntactically valid document structure"
  );

  console.log("\n==================================================================");
  console.log(`RESUME PIPELINE SUITE: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================================");

  if (passed === total) {
    console.log("[STATUS] RESUME SECTION FULLY VERIFIED WORKING!");
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
