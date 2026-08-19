const zlib = require("zlib");

function extractTextFromPdfBuffer(buffer) {
  try {
    const raw = buffer.toString("binary");
    let extractedText = "";

    // 1. Search for FlateDecode streams
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    while ((match = streamRegex.exec(raw)) !== null) {
      const streamData = Buffer.from(match[1], "binary");
      let decompressed = "";
      try {
        decompressed = zlib.inflateSync(streamData).toString("utf-8");
      } catch (e) {
        try {
          decompressed = zlib.inflateRawSync(streamData).toString("utf-8");
        } catch (e2) {
          decompressed = streamData.toString("utf-8");
        }
      }

      if (decompressed) {
        // Extract text inside Tj and TJ operators: (text) Tj or [(t)(e)(x)(t)] TJ
        const textObjRegex = /BT[\s\S]*?ET/g;
        let textObjMatch;
        while ((textObjMatch = textObjRegex.exec(decompressed)) !== null) {
          const block = textObjMatch[0];
          // Match all strings inside parentheses: (Some text here)
          const strRegex = /\((.*?)\)/g;
          let strMatch;
          const blockWords = [];
          while ((strMatch = strRegex.exec(block)) !== null) {
            // unescape standard PDF escapes: \( \) \\
            const cleaned = strMatch[1]
              .replace(/\\([()\\])/g, "$1")
              .replace(/\\r/g, " ")
              .replace(/\\n/g, " ")
              .replace(/\\t/g, " ");
            if (cleaned.trim()) {
              blockWords.push(cleaned);
            }
          }
          if (blockWords.length > 0) {
            extractedText += blockWords.join(" ") + "\n";
          }
        }
      }
    }

    // 2. Also search uncompressed plain text outside streams
    const uncompressedStrs = raw.match(/\(([^()]{3,})\)\s*(?:Tj|'|")/g);
    if (uncompressedStrs && extractedText.length < 50) {
      uncompressedStrs.forEach((s) => {
        const clean = s.replace(/^\(/, "").replace(/\)\s*(?:Tj|'|")$/, "");
        extractedText += clean + "\n";
      });
    }

    return extractedText.trim();
  } catch (err) {
    console.error("PDF Extraction error:", err);
    return "";
  }
}

// Generate a sample minimal valid PDF in buffer to test
function createSamplePdfBuffer() {
  const content = `BT /F1 12 Tf 72 712 Td (Jane Doe) Tj ET
BT /F1 10 Tf 72 690 Td (Senior Software Engineer - Python, Go, Docker, Kubernetes) Tj ET
BT /F1 10 Tf 72 670 Td (Experience: Built distributed streaming systems at Acme Corp) Tj ET
BT /F1 10 Tf 72 650 Td (Education: B.S. in Computer Science) Tj ET`;

  const compressedStream = zlib.deflateSync(Buffer.from(content, "utf-8"));
  const streamLen = compressedStream.length;

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
<< /Length ${streamLen} /Filter /FlateDecode >>
stream
${compressedStream.toString("binary")}
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
${300 + streamLen}
%%EOF`;

  return Buffer.from(pdf, "binary");
}

const samplePdf = createSamplePdfBuffer();
console.log("Created sample PDF buffer:", samplePdf.length, "bytes");
const extracted = extractTextFromPdfBuffer(samplePdf);
console.log("Extracted text from PDF:\n---\n" + extracted + "\n---");
