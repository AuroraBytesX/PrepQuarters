const path = require("path");
require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });
const { transcribeAudio } = require("../server/services/TranscriptionService");

async function testGroqKey() {
  console.log("GROQ_API_KEY loaded:", process.env.GROQ_API_KEY ? "YES (length: " + process.env.GROQ_API_KEY.length + ")" : "NO");
  
  // Create a minimal webm audio header buffer to test API response
  const dummyBuffer = Buffer.from([0x1A, 0x45, 0xDF, 0xA3]); // EBML header
  
  try {
    const result = await transcribeAudio({
      buffer: dummyBuffer,
      mimetype: "audio/webm",
      filename: "test.webm"
    });
    console.log("Transcribe test result:", result);
  } catch (err) {
    console.error("Transcribe test error:", err);
  }
}

testGroqKey();
