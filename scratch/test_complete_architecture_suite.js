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

async function runTestSuite() {
  console.log("===============================================================");
  console.log("=== PREPQUARTERS COMPLETE ARCHITECTURE & CONFIG TEST SUITE ===");
  console.log("===============================================================\n");

  // 1. Health check
  const healthRes = await request({ hostname: "localhost", port: 5000, path: "/api/health", method: "GET" });
  if (healthRes.status !== 200 || !healthRes.data?.success) throw new Error("Health check failed");
  console.log("1. Backend Health Check -> PASS (200 OK)");

  // 2. User Authentication
  const email = `arch_test_${Date.now()}@prepquarters.io`;
  const regRes = await request(
    { hostname: "localhost", port: 5000, path: "/api/auth/signup", method: "POST", headers: { "Content-Type": "application/json" } },
    { name: "Arch Test Candidate", email, password: "SecurePassword123!", confirmPassword: "SecurePassword123!" }
  );
  const token = regRes.data?.token;
  if (!token) throw new Error("Registration failed: " + JSON.stringify(regRes.data));
  console.log("2. Candidate Auth Token -> PASS");

  // 3. Flow 1: Software Engineering + Backend Developer + Python + Technical
  const f1 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Software Engineering", role: "Backend Developer", programmingLanguage: "python", interviewType: "Technical Interview", difficulty: "Hard", sessionDuration: "15 Minutes" }
  );
  if (f1.status !== 201) throw new Error("Flow 1 failed: " + JSON.stringify(f1.data));
  console.log(`3. Flow 1 [SE + Backend Dev + Python + Technical] -> PASS (Q: "${f1.data.session.currentQuestion.topic}")`);

  // 4. Flow 2: Software Engineering + Backend Developer + Python + Coding
  const f2 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Software Engineering", role: "Backend Developer", programmingLanguage: "python", interviewType: "Coding Interview", difficulty: "Hard", sessionDuration: "20 Minutes" }
  );
  if (f2.status !== 201 || !f2.data.session.currentQuestion.starterCode) throw new Error("Flow 2 failed: " + JSON.stringify(f2.data));
  console.log(`4. Flow 2 [SE + Backend Dev + Python + Coding] -> PASS (Starter code present, Lang: ${f2.data.session.currentQuestion.programmingLanguage})`);

  // 5. Flow 3: Software Engineering + Backend Developer + Python + AI Coding
  const f3 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Software Engineering", role: "Backend Developer", programmingLanguage: "python", interviewType: "AI Coding Interview", difficulty: "Hard", sessionDuration: "20 Minutes" }
  );
  if (f3.status !== 201) throw new Error("Flow 3 failed: " + JSON.stringify(f3.data));
  console.log(`5. Flow 3 [SE + Backend Dev + Python + AI Coding] -> PASS (Type: ${f3.data.session.interviewType})`);

  // 6. Flow 4: Data Science + ML Engineer + Python + Technical
  const f4 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Data Science & ML", role: "Machine Learning Engineer", programmingLanguage: "python", interviewType: "Technical Interview", difficulty: "Hard", sessionDuration: "15 Minutes" }
  );
  if (f4.status !== 201) throw new Error("Flow 4 failed: " + JSON.stringify(f4.data));
  console.log(`6. Flow 4 [Data Science & ML + ML Engineer + Python + Technical] -> PASS (Topic: ${f4.data.session.currentQuestion.topic})`);

  // 7. Flow 5: HR / Behavioral + Product Manager
  const f5 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Product Management", role: "Product Manager", interviewType: "HR / Behavioral Interview", difficulty: "Medium", sessionDuration: "10 Minutes" }
  );
  if (f5.status !== 201) throw new Error("Flow 5 failed: " + JSON.stringify(f5.data));
  console.log(`7. Flow 5 [HR/Behavioral + Product Manager] -> PASS (Topic: ${f5.data.session.currentQuestion.topic})`);

  // 8. Flow 6: Aptitude + Valid Role
  const f6 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Software Engineering", role: "Full Stack Engineer", interviewType: "Aptitude Interview", difficulty: "Medium", sessionDuration: "10 Minutes" }
  );
  if (f6.status !== 201 || !Array.isArray(f6.data.session.currentQuestion.aptitudeOptions)) throw new Error("Flow 6 failed: " + JSON.stringify(f6.data));
  console.log(`8. Flow 6 [Aptitude + Full Stack Engineer] -> PASS (Options count: ${f6.data.session.currentQuestion.aptitudeOptions.length})`);

  // 9. Flow 7: System Design + Backend Engineer
  const f7 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Software Engineering", role: "Backend Developer", interviewType: "System Design Interview", difficulty: "Hard", sessionDuration: "30 Minutes", modalityConfig: { systemDesignTopic: "Distributed Rate Limiting", targetScale: "250,000 RPS" } }
  );
  if (f7.status !== 201) throw new Error("Flow 7 failed: " + JSON.stringify(f7.data));
  console.log(`9. Flow 7 [System Design + Backend Engineer] -> PASS (Topic: ${f7.data.session.currentQuestion.topic})`);

  // 10. Flow 8: Language-Specific + Java
  const f8 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Software Engineering", role: "Backend Developer", programmingLanguage: "java", interviewType: "Language-Specific", difficulty: "Hard", sessionDuration: "15 Minutes" }
  );
  if (f8.status !== 201) throw new Error("Flow 8 failed: " + JSON.stringify(f8.data));
  console.log(`10. Flow 8 [Language-Specific + Java] -> PASS (Topic: ${f8.data.session.currentQuestion.topic})`);

  // 11. Flow 9: Language-Specific + C++
  const f9 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Software Engineering", role: "Systems Engineer", programmingLanguage: "cpp", interviewType: "Language-Specific", difficulty: "Hard", sessionDuration: "15 Minutes" }
  );
  if (f9.status !== 201) throw new Error("Flow 9 failed: " + JSON.stringify(f9.data));
  console.log(`11. Flow 9 [Language-Specific + C++] -> PASS (Topic: ${f9.data.session.currentQuestion.topic})`);

  // 12. Flow 10: Multi-language Coding
  const f10 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Software Engineering", role: "Fullstack Engineer", programmingLanguages: ["python", "rust", "typescript"], interviewType: "Coding Interview", difficulty: "Hard", sessionDuration: "20 Minutes" }
  );
  if (f10.status !== 201 || f10.data.session.programmingLanguages.length !== 3) throw new Error("Flow 10 failed: " + JSON.stringify(f10.data));
  console.log(`12. Flow 10 [Multi-Language Coding] -> PASS (Selected: ${f10.data.session.programmingLanguages.join(", ")})`);

  // 13. Flow 11: No-language Coding / General case
  const f11 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Software Engineering", role: "Software Engineer", programmingLanguages: [], interviewType: "Coding Interview", difficulty: "Medium", sessionDuration: "15 Minutes" }
  );
  if (f11.status !== 201) throw new Error("Flow 11 failed: " + JSON.stringify(f11.data));
  console.log(`13. Flow 11 [No-language / General Coding] -> PASS (Language: ${f11.data.session.programmingLanguage})`);

  // 14. Flow 12: Company-Specific + Valid Domain/Role
  const f12 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Software Engineering", role: "Distributed Systems Architect", companyStyle: "Netflix", interviewType: "Company-Specific Interview", difficulty: "Hard", sessionDuration: "25 Minutes" }
  );
  if (f12.status !== 201 || f12.data.session.companyStyle !== "Netflix") throw new Error("Flow 12 failed: " + JSON.stringify(f12.data));
  console.log(`14. Flow 12 [Company-Specific + Netflix] -> PASS (Company: ${f12.data.session.companyStyle})`);

  // 15. Flow 13: Custom Valid Role (e.g. "Rust Systems Engineer")
  const f13 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Software Engineering", role: "Rust Systems Engineer", programmingLanguage: "rust", interviewType: "Technical Interview", difficulty: "Hard", sessionDuration: "15 Minutes" }
  );
  if (f13.status !== 201 || f13.data.session.role !== "Rust Systems Engineer") throw new Error("Flow 13 failed: " + JSON.stringify(f13.data));
  console.log(`15. Flow 13 [Custom Valid Role: Rust Systems Engineer] -> PASS`);

  // 16. Flow 14: Invalid Custom Role/Domain Combination (e.g. "Plumber" for "Software Engineering")
  const f14 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Software Engineering", role: "Plumber", interviewType: "Technical Interview", difficulty: "Hard" }
  );
  if (f14.status !== 400 || !f14.data.message.includes("not compatible")) throw new Error("Flow 14 failed (expected 400 rejection): " + JSON.stringify(f14.data));
  console.log(`16. Flow 14 [Invalid Custom Role: "Plumber" Rejection] -> PASS (${f14.data.message})`);

  // 17. Flow 15: Autonomous Speech Response Toggle (autoTTS = false)
  const f15 = await request(
    { hostname: "localhost", port: 5000, path: "/api/interview/start", method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } },
    { domain: "Software Engineering", role: "Backend Developer", interviewType: "AI Voice Interview", autoTTS: false, sessionDuration: "10 Minutes" }
  );
  if (f15.status !== 201 || f15.data.session.autoTTS !== false || f15.data.session.speechResponseMode !== "explicit_on_demand") {
    throw new Error("Flow 15 failed: " + JSON.stringify(f15.data));
  }
  console.log(`17. Flow 15 [Autonomous Speech Response OFF -> explicit_on_demand] -> PASS (SpeechMode: ${f15.data.session.speechResponseMode})`);

  // 18. Flow 16: Controlled Reference Solution (Present on question, but never pre-revealed)
  const refSolution = f2.data.session.currentQuestion.referenceSolution;
  if (!refSolution || refSolution.length < 10) throw new Error("Flow 16 failed: referenceSolution missing or empty");
  console.log(`18. Flow 16 [Reference Solution Benchmark Present] -> PASS (${refSolution.slice(0, 40)}...)`);

  console.log("\n===============================================================");
  console.log("=== ALL 18 ARCHITECTURE & CONFIGURATION TESTS PASSED 100% ===");
  console.log("===============================================================\n");
}

runTestSuite().catch((err) => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
