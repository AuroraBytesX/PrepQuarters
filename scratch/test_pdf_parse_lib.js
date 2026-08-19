const pdfParse = require("pdf-parse");
const fs = require("fs");

async function testPdfParse() {
  console.log("pdfParse function available:", typeof pdfParse);
}

testPdfParse();
