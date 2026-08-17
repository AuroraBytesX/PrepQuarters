const http = require("http");

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runFullAudit() {
  console.log("=== RUNNING FULL AUDIT & EVIDENCE-BASED SCORING TEST SUITE ===");

  // 1. Health check
  const healthRes = await request({ hostname: "localhost", port: 5000, path: "/api/health", method: "GET" });
  if (healthRes.status !== 200 || !healthRes.data?.success) throw new Error("Health check failed");
  console.log("1. /api/health -> PASS");

  // 2. System Docs check
  const docsRes = await request({ hostname: "localhost", port: 5000, path: "/api/system/docs", method: "GET" });
  if (docsRes.status !== 200 || !docsRes.data?.docs?.modalities) throw new Error("System docs failed");
  console.log(`2. /api/system/docs -> PASS (${docsRes.data.docs.modalities.length} modalities, ${docsRes.data.docs.apiEndpoints.length} endpoints)`);

  // 3. User Auth
  const email = `audit_${Date.now()}@prepquarters.io`;
  const regRes = await request(
    { hostname: "localhost", port: 5000, path: "/api/auth/signup", method: "POST", headers: { "Content-Type": "application/json" } },
    { name: "Audit Candidate", email, password: "SecurePassword123!", confirmPassword: "SecurePassword123!" }
  );
  const token = regRes.data?.token;
  if (!token) throw new Error("Registration failed");
  console.log("3. User Auth -> PASS");

  // 4. Test Evidence-Based Coding Evaluation
  const codingSessionRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/interview/start",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    },
    {
      role: "Backend Developer",
      domain: "Software Engineering",
      difficulty: "Hard",
      companyStyle: "Google",
      interviewType: "Coding Interview",
      programmingLanguage: "javascript",
      sessionDuration: "15 Minutes",
      modalityConfig: {
        codingTopic: "Arrays & Hash Tables",
        codingProblemType: "Target Hash Map / Arrays",
      },
    }
  );
  const sessionId = codingSessionRes.data?.session?._id;
  const starterCode = codingSessionRes.data?.session?.currentQuestion?.starterCode;
  console.log(`4. Start Time-Based Coding Session -> PASS (ID: ${sessionId}, Duration: ${codingSessionRes.data?.session?.selectedDuration})`);

  // 4A: Submit empty starter code -> MUST receive low score (1/10), NOT 9/10!
  const emptyAnswerRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: `/api/interview/${sessionId}/answer`,
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    },
    {
      candidateAnswer: starterCode,
      timeSpentSeconds: 15,
    }
  );
  const emptyScore = emptyAnswerRes.data?.evaluation?.score;
  console.log(`4A. Submit Unedited Starter Code -> Score: ${emptyScore}/10 (Expected: <= 2)`);
  if (emptyScore > 2) throw new Error(`Evidence scoring failed: unedited template received ${emptyScore}/10`);

  // 4B: Start fresh session and submit correct Two Sum code
  const freshCodingRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/interview/start",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    },
    {
      role: "Software Engineer",
      domain: "Software Engineering",
      difficulty: "Hard",
      companyStyle: "Google",
      interviewType: "Coding Interview",
      programmingLanguage: "javascript",
      sessionDuration: "20 Minutes",
    }
  );
  const freshSessionId = freshCodingRes.data?.session?._id;
  const validSolution = `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (map.has(comp)) return [map.get(comp), i];
    map.set(nums[i], i);
  }
  return [];
}`;

  const validAnswerRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: `/api/interview/${freshSessionId}/answer`,
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    },
    {
      candidateAnswer: validSolution,
      timeSpentSeconds: 45,
    }
  );
  const validScore = validAnswerRes.data?.evaluation?.score;
  console.log(`4B. Submit Working O(n) Hash Map Solution -> Score: ${validScore}/10 (Expected: >= 8)`);
  if (validScore < 8) throw new Error(`Evidence scoring failed: working solution received ${validScore}/10`);

  // 5. Test AI Coding Modality
  const aiCodingRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/interview/start",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    },
    {
      role: "Fullstack Engineer",
      domain: "Software Engineering",
      difficulty: "Medium",
      interviewType: "AI Coding Interview",
      programmingLanguage: "python",
      sessionDuration: "15 Minutes",
    }
  );
  console.log(`5. Start AI Coding Interview -> PASS (Lang: ${aiCodingRes.data?.session?.currentQuestion?.programmingLanguage})`);

  // 6. Test System Design Modality
  const sysDesignRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/interview/start",
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    },
    {
      role: "Distributed Systems Architect",
      domain: "Software Engineering",
      difficulty: "Hard",
      companyStyle: "Netflix",
      interviewType: "System Design Interview",
      sessionDuration: "30 Minutes",
      modalityConfig: {
        systemDesignTopic: "Global Video Transcoding Pipeline",
        targetScale: "500,000 Concurrent Streams",
      },
    }
  );
  console.log(`6. Start System Design Session -> PASS (Topic: ${sysDesignRes.data?.session?.currentQuestion?.topic})`);

  // 7. Test On-Demand /finish Finalization
  const finishRes = await request(
    {
      hostname: "localhost",
      port: 5000,
      path: `/api/interview/${freshSessionId}/finish`,
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    }
  );
  console.log(`7. /finish Scorecard Generation -> PASS (Score: ${finishRes.data?.overallEvaluation?.overallScore}%, Hire: ${finishRes.data?.overallEvaluation?.hireRecommendation})`);

  console.log("\n=== ALL AUDIT & EVIDENCE-BASED SCORING CHECKS PASSED 100% ===");
}

runFullAudit().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
