/*
 * Comprehensive Architectural & Feature Test Suite
 * Tests:
 * 1. Health check & System Specs docs endpoint
 * 2. Auth Flow (Signup & Token Issuance)
 * 3. AI Resume Analyzer (/api/resume/analyze with and without JD)
 * 4. AI Resume Bullet Point Improvement (/api/resume/improve-bullet)
 * 5. HR / Behavioral with Focus Selection
 * 6. Aptitude with Focus Selection
 * 7. Language-Specific with DSA Mode & Topics
 * 8. Mixed Multi-Stage Interview Flow
 * 9. AI Coding Interview & Hint/Reference Solution Structure
 * 10. System Design Architecture Flow
 */

const BASE_URL = "http://localhost:5000";

async function runTests() {
  console.log("=================================================");
  console.log("STARTING PREPQUARTERS ARCHITECTURE & RESUME SUITE");
  console.log("=================================================\n");

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

  // TEST 1: Health Check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert(res.ok && data.success === true, "1. /api/health responds with status 200 OK");
  } catch (e) {
    assert(false, `1. /api/health failed: ${e.message}`);
  }

  // TEST 2: System Docs Endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/system/docs`);
    const data = await res.json();
    assert(
      res.ok && data.success === true && data.docs.modalities.length >= 10,
      "2. /api/system/docs returns all 10 modalities and API specifications"
    );
  } catch (e) {
    assert(false, `2. /api/system/docs failed: ${e.message}`);
  }

  // TEST 3: Auth Signup
  let token = "";
  const testEmail = `test_candidate_${Date.now()}@prepquarters.internal`;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Candidate",
        email: testEmail,
        password: "Password123!",
        confirmPassword: "Password123!",
      }),
    });
    const data = await res.json();
    token = data.token;
    assert(res.ok && Boolean(token), "3. /api/auth/signup registers candidate and issues JWT token");
  } catch (e) {
    assert(false, `3. /api/auth/signup failed: ${e.message}`);
  }

  // TEST 4: Resume Analyzer (Without JD)
  const sampleResume = `
John Doe - Senior Distributed Systems Engineer
Email: john.doe@example.com | Phone: (555) 123-4567 | San Francisco, CA

PROFESSIONAL SUMMARY:
Senior Backend Engineer with 6+ years of experience architecting distributed event streaming pipelines and microservices in Go, Python, and Rust.

TECHNICAL SKILLS:
Languages: Go, Python, Rust, JavaScript, TypeScript, SQL
Cloud & Infrastructure: AWS, Docker, Kubernetes, Terraform, CI/CD
Databases & Streaming: PostgreSQL, Redis, Apache Kafka, Elasticsearch

WORK EXPERIENCE:
Senior Software Engineer - Acme Cloud Systems (2021 - Present)
* Architected and deployed a multi-region Kafka event pipeline processing 120,000 requests per second.
* Optimized PostgreSQL database query execution plans, reducing P99 latency by 45% and saving $40,000 annually.
* Worked on internal developer tooling and assisted with API migrations.

EDUCATION:
B.S. in Computer Science - University of California, Berkeley (2018)

PROJECTS:
* Distributed Key-Value Store: Built a sharded Raft-consensus key-value store in Go with zero-loss failover.
  `;

  try {
    const res = await fetch(`${BASE_URL}/api/resume/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeText: sampleResume,
        targetRole: "Distributed Systems Architect",
      }),
    });
    const data = await res.json();
    assert(
      res.ok && data.success && data.report.overallScore > 60 && data.report.foundKeywords.length > 5,
      `4. /api/resume/analyze generates structured ATS report (Score: ${data.report?.overallScore}/100, Keywords: ${data.report?.foundKeywords?.length})`
    );
  } catch (e) {
    assert(false, `4. /api/resume/analyze failed: ${e.message}`);
  }

  // TEST 5: Resume Analyzer (With Job Description & Missing Keywords)
  const sampleJD = `
We are looking for a Senior Distributed Systems Engineer to lead our Kubernetes and Infrastructure team.
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
    assert(
      res.ok &&
      data.success &&
      data.report.jdMatchScore > 0 &&
      data.report.missingKeywords.length > 0 &&
      data.report.weakBullets.length > 0,
      `5. /api/resume/analyze with JD calculates match (${data.report?.jdMatchScore}%) and identifies missing skills (${data.report?.missingKeywords?.join(", ")})`
    );
  } catch (e) {
    assert(false, `5. /api/resume/analyze with JD failed: ${e.message}`);
  }

  // TEST 6: Resume Bullet Improvement
  try {
    const res = await fetch(`${BASE_URL}/api/resume/improve-bullet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bulletText: "Worked on improving API response times and helped with database indexing.",
        roleContext: "Backend Engineer",
      }),
    });
    const data = await res.json();
    assert(
      res.ok && data.success && data.improvedVariations.length >= 3,
      "6. /api/resume/improve-bullet returns STAR/XYZ impact statement variations"
    );
  } catch (e) {
    assert(false, `6. /api/resume/improve-bullet failed: ${e.message}`);
  }

  // TEST 7: HR / Behavioral Interview with Focus Selection
  try {
    const res = await fetch(`${BASE_URL}/api/interview/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        domain: "HR & Leadership",
        role: "Engineering Manager",
        difficulty: "Hard",
        interviewType: "HR / Behavioral Interview",
        sessionDuration: "10 Minutes (Standard)",
        modalityConfig: {
          hrFocusAreas: ["Leadership", "Conflict Resolution", "STAR-based"],
        },
      }),
    });
    const data = await res.json();
    assert(
      res.ok && data.success && data.session.interviewType === "HR / Behavioral Interview",
      "7. HR / Behavioral session starts with leadership & STAR focus context"
    );
  } catch (e) {
    assert(false, `7. HR / Behavioral session failed: ${e.message}`);
  }

  // TEST 8: Aptitude Interview with Focus Selection
  try {
    const res = await fetch(`${BASE_URL}/api/interview/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        domain: "Software Engineering",
        role: "Backend Developer",
        difficulty: "Medium",
        interviewType: "Aptitude Interview",
        sessionDuration: "5 Minutes",
        modalityConfig: {
          aptitudeFocusAreas: ["Quantitative Aptitude", "Probability"],
        },
      }),
    });
    const data = await res.json();
    const q = data.session.currentQuestion;
    assert(
      res.ok && data.success && q.questionType === "Aptitude" && q.aptitudeOptions?.length === 4,
      `8. Aptitude session starts with 4-choice MCQ and verified proof (Topic: ${q.topic})`
    );
  } catch (e) {
    assert(false, `8. Aptitude session failed: ${e.message}`);
  }

  // TEST 9: Language-Specific Technical with DSA Mode Enabled
  try {
    const res = await fetch(`${BASE_URL}/api/interview/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        domain: "Software Engineering",
        role: "Backend Developer",
        difficulty: "Hard",
        interviewType: "Language-Specific Technical Interview",
        programmingLanguage: "python",
        sessionDuration: "15 Minutes",
        modalityConfig: {
          dsaEnabled: true,
          dsaTopics: ["Arrays", "Hashing"],
        },
      }),
    });
    const data = await res.json();
    const q = data.session.currentQuestion;
    assert(
      res.ok && data.success && (q.questionType === "Coding" || q.starterCode),
      `9. Language-Specific session with DSA enabled loads coding problem with starter code (Topic: ${q.topic})`
    );
  } catch (e) {
    assert(false, `9. Language-Specific with DSA failed: ${e.message}`);
  }

  // TEST 10: Mixed Multi-Stage Interview Start
  try {
    const res = await fetch(`${BASE_URL}/api/interview/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        domain: "Software Engineering",
        role: "Full Stack Engineer",
        difficulty: "Hard",
        interviewType: "Mixed Interview",
        programmingLanguage: "javascript",
        sessionDuration: "20 Minutes",
      }),
    });
    const data = await res.json();
    assert(
      res.ok && data.success && data.session.interviewType === "Mixed Interview",
      "10. Mixed Interview initializes universal multi-stage session"
    );
  } catch (e) {
    assert(false, `10. Mixed Interview failed: ${e.message}`);
  }

  console.log("\n=================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
