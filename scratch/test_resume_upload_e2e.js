const path = require("path");
const zlib = require("zlib");
require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });

function createSamplePdfBuffer() {
  const content = `BT /F1 12 Tf 72 712 Td (Sarah Connor - Principal Systems Engineer) Tj ET
BT /F1 10 Tf 72 690 Td (Summary: 8+ years designing scalable distributed backends with Go, Rust, Python, and Docker) Tj ET
BT /F1 10 Tf 72 670 Td (Experience: Senior Backend Engineer at Cyberdyne Systems - Designed high-throughput microservices) Tj ET
BT /F1 10 Tf 72 650 Td (Skills: Go, Python, Kubernetes, Kafka, PostgreSQL, Redis, AWS, CI/CD, Distributed Systems) Tj ET
BT /F1 10 Tf 72 630 Td (Projects: Built distributed cache layer handling 250,000 RPS with sub-5ms P99 latency) Tj ET
BT /F1 10 Tf 72 610 Td (Education: B.S. in Computer Science) Tj ET`;

  const compressed = zlib.deflateSync(Buffer.from(content, "utf-8"));
  const len = compressed.length;

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length ${len} /Filter /FlateDecode >>
stream
${compressed.toString("binary")}
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000115 00000 n 
0000000200 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
${300 + len}
%%EOF`;

  return Buffer.from(pdf, "binary");
}

async function testResumeUploadDirect() {
  const pdfBuffer = createSamplePdfBuffer();
  console.log("[PDF_CREATED] Sample PDF Buffer size:", pdfBuffer.length, "bytes");

  const { extractTextFromPdfBuffer, analyzeResume } = require("../server/services/ResumeService");

  // Step 1: Test PDF text extraction
  const extracted = await extractTextFromPdfBuffer(pdfBuffer);
  console.log("[EXTRACTED_TEXT]\n", extracted);

  if (!extracted || extracted.length < 20) {
    console.error("[TEST_FAILED] PDF text extraction returned empty or too short text.");
    process.exit(1);
  }

  // Step 2: Test analyzeResume with NO Job Description (JD is optional)
  const report = analyzeResume({
    resumeText: extracted,
    jobDescription: "", // Optional
    targetRole: "Software Engineer",
  });

  console.log("\n[ATS_REPORT_GENERATED]");
  console.log("- Overall Score:", report.overallScore);
  console.log("- ATS Compatibility:", report.atsCompatibilityScore);
  console.log("- Matched Keywords:", report.foundKeywords);
  console.log("- Formatting Risks:", report.formattingRisks);
  console.log("- Prioritized Improvements:", report.prioritizedImprovements?.length);

  if (report.overallScore > 50 && report.foundKeywords.length > 0) {
    console.log("\n[TEST_PASSED] Resume Analyzer PDF upload and analysis pipeline verified successfully!");
  } else {
    console.error("[TEST_FAILED] ATS Report incomplete.");
    process.exit(1);
  }
}

testResumeUploadDirect();
