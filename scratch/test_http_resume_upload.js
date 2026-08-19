const path = require("path");
const http = require("http");
const zlib = require("zlib");
require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });
const express = require(path.join(__dirname, "../server/node_modules/express"));
const cors = require(path.join(__dirname, "../server/node_modules/cors"));
const resumeRouter = require("../server/routes/resume");

// Helper to create a PDF buffer
function createSamplePdfBuffer() {
  const content = `BT /F1 12 Tf 72 712 Td (Jordan Lee - Staff Infrastructure Engineer) Tj ET
BT /F1 10 Tf 72 690 Td (Summary: 7 years scaling distributed databases and Kubernetes clusters) Tj ET
BT /F1 10 Tf 72 670 Td (Experience: Staff SRE at CloudScale - Maintained 99.999% uptime across 40 microservices) Tj ET
BT /F1 10 Tf 72 650 Td (Skills: Golang, Rust, Python, Docker, Kubernetes, Terraform, AWS, Prometheus, Linux) Tj ET
BT /F1 10 Tf 72 630 Td (Education: B.S. Computer Engineering) Tj ET`;

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

async function testHttpResumeUpload() {
  console.log("=================================================");
  console.log("TESTING HTTP MULTIPART PDF UPLOAD TO /api/resume/analyze");
  console.log("=================================================");

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/resume", resumeRouter);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log("[SERVER_RUNNING] Test server listening on port 5099");

  const pdfBuffer = createSamplePdfBuffer();
  const boundary = "----WebKitFormBoundary" + Math.random().toString(36).substring(2);

  // Build raw multipart body
  const bodyParts = [];
  bodyParts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="resumeFile"; filename="jordan_lee_resume.pdf"\r\nContent-Type: application/pdf\r\n\r\n`));
  bodyParts.push(pdfBuffer);
  bodyParts.push(Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="targetRole"\r\n\r\nStaff Infrastructure Engineer\r\n`));
  bodyParts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="jobDescription"\r\n\r\n\r\n`)); // Empty JD (Optional)
  bodyParts.push(Buffer.from(`--${boundary}--\r\n`));

  const multipartBody = Buffer.concat(bodyParts);

  const response = await fetch("http://127.0.0.1:5099/api/resume/analyze", {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      "Content-Length": String(multipartBody.length),
    },
    body: multipartBody,
  });

  const statusCode = response.status;
  const json = await response.json();
  console.log("[HTTP_STATUS_CODE]:", statusCode);
  console.log("[HTTP_RESPONSE_JSON]:", JSON.stringify(json, null, 2));

  server.close();

  if (statusCode === 200 && json.success === true && json.report && json.report.overallScore > 50) {
    console.log("\n[TEST_PASSED] HTTP multipart PDF upload -> text extraction -> ATS analysis SUCCEEDED WITH 200 OK!");
  } else {
    console.error("\n[TEST_FAILED] HTTP multipart upload failed with status:", statusCode, json);
    process.exit(1);
  }
}

testHttpResumeUpload();
