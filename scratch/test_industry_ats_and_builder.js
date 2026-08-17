/*
 * Industry-Standard ATS Assessment, LaTeX Builder & Nonsense Penalty Test Suite
 */

const BASE_URL = "http://localhost:5000";

async function runTests() {
  console.log("===============================================================");
  console.log("=== STARTING ATS READINESS, BUILDER & EVALUATION AUDIT SUITE ===");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Health check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert(res.ok && data.success, "1. /api/health returns 200 OK");
  } catch (e) {
    assert(false, `1. /api/health failed: ${e.message}`);
  }

  // 2. Auth signup
  let token = "";
  const testEmail = `candidate_ats_${Date.now()}@prepquarters.internal`;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test ATS Candidate",
        email: testEmail,
        password: "Password123!",
        confirmPassword: "Password123!",
      }),
    });
    const data = await res.json();
    token = data.token;
    assert(res.ok && Boolean(token), "2. Candidate authenticated and issued JWT");
  } catch (e) {
    assert(false, `2. Auth failed: ${e.message}`);
  }

  // 3. Explainable Multi-Category ATS Readiness Scoring
  const sampleResume = `
Jane Doe | jane.doe@email.com | +1 (555) 019-2834 | San Francisco, CA | linkedin.com/in/janedoe

PROFESSIONAL SUMMARY:
Senior Backend Engineer with 6+ years of experience designing and scaling distributed systems, real-time event streaming pipelines, and microservices in Go, Python, and Rust.

TECHNICAL SKILLS:
Languages: Go, Python, Rust, TypeScript, SQL
Frameworks: FastAPI, Node.js, Express, React
Cloud & DevOps: AWS, Docker, Kubernetes, Terraform, CI/CD
Databases: PostgreSQL, Redis, Apache Kafka, Elasticsearch

WORK EXPERIENCE:
Senior Software Engineer - Acme Cloud Infrastructure (2021 - Present)
* Architected distributed Kafka streaming pipeline handling 120,000 requests per second across 3 multi-region clusters.
* Optimized PostgreSQL database query execution plans, reducing P99 latency by 45% and saving $40,000 in monthly infrastructure costs.
* Worked on internal backend tools and assisted with database migrations.

EDUCATION:
B.S. in Computer Science - University of California, Berkeley (2019)

PROJECTS:
* Sharded Raft Key-Value Store: Built a distributed key-value store in Go with zero-downtime leader election.
  `;

  const sampleJD = `
We are seeking a Staff Infrastructure Engineer to lead our Kubernetes and Cloud Platform.
Requirements:
* 5+ years building backend microservices with Go or Python
* Strong proficiency with Kubernetes (K8s), Terraform, and AWS Lambda
* Deep understanding of Snowflake, BigQuery, and Machine Learning pipelines
* Experience with Prometheus and Grafana Observability
  `;

  try {
    const res = await fetch(`${BASE_URL}/api/resume/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeText: sampleResume,
        jobDescription: sampleJD,
        targetRole: "Distributed Systems Architect",
      }),
    });
    const data = await res.json();
    const r = data.report;
    assert(
      res.ok &&
      r.overallScore >= 70 &&
      r.categoryScores?.parsingCompatibility?.score >= 80 &&
      r.categoryScores?.documentStructure?.score >= 80 &&
      r.categoryScores?.keywordRelevance?.score >= 80 &&
      r.categoryScores?.jdAlignment?.score > 0 &&
      r.prioritizedImprovements?.some((p) => p.priority === "CRITICAL" || p.priority === "HIGH"),
      `3. Explainable ATS readiness generated (Overall: ${r?.overallScore}/100, Parsing: ${r?.categoryScores?.parsingCompatibility?.score}, JD: ${r?.categoryScores?.jdAlignment?.score}, Priorities: ${r?.prioritizedImprovements?.length})`
    );
  } catch (e) {
    assert(false, `3. ATS analysis failed: ${e.message}`);
  }

  // 4. Conversational Resume Builder Assistant
  try {
    const res = await fetch(`${BASE_URL}/api/resume/build/chat-assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userMessage: "Senior Backend Developer",
        step: "role",
      }),
    });
    const data = await res.json();
    assert(
      res.ok && data.success && data.nextStep === "contact" && data.updatedResume?.targetRole === "Senior Backend Developer",
      `4. Conversational Builder successfully guides role step -> nextStep: ${data.nextStep}`
    );
  } catch (e) {
    assert(false, `4. Builder chat assist failed: ${e.message}`);
  }

  // 5. Compile-Ready LaTeX Resume Export
  try {
    const res = await fetch(`${BASE_URL}/api/resume/build/generate-latex`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeData: {
          name: "Jane Doe",
          email: "jane.doe@email.com",
          phone: "+1 (555) 019-2834",
          location: "San Francisco, CA",
          linkedin: "linkedin.com/in/janedoe",
          github: "github.com/janedoe",
          targetRole: "Senior Backend Engineer",
          summary: "Senior Backend Engineer specializing in high-throughput distributed systems.",
          skills: {
            languages: ["Go", "Python", "Rust", "SQL"],
            frameworks: ["FastAPI", "Node.js", "Docker"],
            databases: ["PostgreSQL", "Redis", "Kafka"],
            tools: ["AWS", "Kubernetes", "CI/CD"],
          },
          experience: [
            {
              title: "Senior Backend Engineer",
              company: "Acme Cloud Infrastructure",
              location: "San Francisco, CA",
              dateRange: "2021 - Present",
              bullets: [
                "Architected distributed Kafka streaming pipeline handling 120,000 requests per second.",
                "Optimized PostgreSQL query execution plans, reducing P99 latency by 45%.",
              ],
            },
          ],
        },
      }),
    });
    const data = await res.json();
    assert(
      res.ok && data.success && data.latex.includes("\\documentclass") && data.latex.includes("\\section{Technical Skills}"),
      "5. Compile-ready LaTeX resume generated with valid documentclass and section tags"
    );
  } catch (e) {
    assert(false, `5. LaTeX generation failed: ${e.message}`);
  }

  // 6. Nonsense / Gibberish Answer Evaluation Quality Test
  try {
    // Start session
    const startRes = await fetch(`${BASE_URL}/api/interview/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        domain: "Software Engineering",
        role: "Backend Developer",
        difficulty: "Hard",
        interviewType: "Technical Interview",
        sessionDuration: "10 Minutes (Standard)",
      }),
    });
    const startData = await startRes.json();
    const sessionId = startData.session._id;

    // Submit pure gibberish
    const ansRes = await fetch(`${BASE_URL}/api/interview/${sessionId}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        answer: "blah blah blah asdfghjkl xyz completely unrelated gibberish potato banana 12345",
      }),
    });
    const ansData = await ansRes.json();
    const score = ansData.evaluation?.score;
    assert(
      ansRes.ok && (score <= 3 || ansData.isValidAnswer === false),
      `6. Nonsense / gibberish answer appropriately penalized with low score (Score: ${score}/10, Valid: ${ansData.isValidAnswer})`
    );
  } catch (e) {
    assert(false, `6. Nonsense evaluation test failed: ${e.message}`);
  }

  console.log("\n===============================================================");
  console.log(`=== AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  console.log("===============================================================\n");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runTests();
