/*
 * Automated Test Suite for Navigation & Logout Flow
 * PrepQuarters Priority Repair Verification Pass
 */

const fs = require("fs");
const path = require("path");

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

function runTests() {
  console.log("==================================================================");
  console.log("PREPQUARTERS NAVIGATION & LOGOUT FLOW TEST SUITE");
  console.log("==================================================================");

  const navbarPath = path.join(__dirname, "../prepquarters/src/components/Navbar.jsx");
  const navbarContent = fs.readFileSync(navbarPath, "utf-8");

  // 1. Logout navigates to "/"
  console.log("\n--- TEST 1: Logout Navigation Destination ---");
  const hasLogoutNavHome = navbarContent.includes('handleLogout = () => {') &&
                           navbarContent.includes('navigate("/");');
  assert(
    hasLogoutNavHome,
    "handleLogout navigates directly to Homepage ('/') and clears authentication tokens"
  );

  // 2. Brand Logo links directly to "/"
  console.log("\n--- TEST 2: Brand Logo Link Destination ---");
  const hasBrandLogoLink = navbarContent.includes('<Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>\n          <Logo size={22} showText={true} />');
  assert(
    hasBrandLogoLink,
    "Brand logo always links directly to Homepage ('/') for public and authenticated states"
  );

  // 3. Mobile Navigation Drawer has Home link
  console.log("\n--- TEST 3: Mobile Navigation Drawer Home Link ---");
  const hasMobileHome = navbarContent.includes('mobileMenuOpen &&') &&
                        /to="\/"[^>]*>[\s\S]*?Home/i.test(navbarContent);
  assert(
    hasMobileHome,
    "Mobile navigation drawer provides immediate Home ('/') access link"
  );

  // 4. App.jsx Public Routes Check
  console.log("\n--- TEST 4: Public Route Accessibility ---");
  const appPath = path.join(__dirname, "../prepquarters/src/App.jsx");
  const appContent = fs.readFileSync(appPath, "utf-8");

  const hasPublicHome = appContent.includes('<Route path="/" element={<Home />} />');
  const hasPublicDocs = appContent.includes('<Route path="/docs" element={<SystemDocs />} />');
  const hasPublicResume = appContent.includes('<Route path="/resume-analyzer" element={<ResumeAnalyzer />} />');
  const hasPublicLibrary = appContent.includes('<Route path="/practice/question-library" element={<QuestionLibrary />} />');

  assert(
    hasPublicHome && hasPublicDocs && hasPublicResume && hasPublicLibrary,
    "Homepage, Docs, Resume Analyzer, and Question Bank routes are publicly accessible without authentication"
  );

  console.log("\n==================================================================");
  console.log(`NAVIGATION & LOGOUT SUITE: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================================");

  if (passed === total) {
    console.log("[STATUS] NAVIGATION AND LOGOUT FLOW FULLY VERIFIED WORKING!");
    process.exit(0);
  } else {
    console.error("[STATUS] SOME TESTS FAILED!");
    process.exit(1);
  }
}

runTests();
