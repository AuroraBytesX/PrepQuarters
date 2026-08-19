const path = require("path");
require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });
const { transcribeAudio } = require("../server/services/TranscriptionService");

// Generate a valid 1-second silence WAV file
function createWavHeader(sampleRate = 16000, numChannels = 1, bitsPerSample = 16, numSamples = 16000) {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = numSamples * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt sub-chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Fill PCM with a gentle 440Hz sine wave (1 second tone)
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin((2 * Math.PI * 440 * i) / sampleRate) * 0.3 * 32767;
    buffer.writeInt16LE(Math.floor(sample), 44 + i * 2);
  }

  return buffer;
}

async function testRealAudio() {
  const wavBuffer = createWavHeader(16000, 1, 16, 16000);
  console.log("Created WAV audio buffer:", wavBuffer.length, "bytes");

  const result = await transcribeAudio({
    buffer: wavBuffer,
    mimetype: "audio/wav",
    filename: "speech_sample.wav"
  });

  console.log("Real Audio Transcription Result:", JSON.stringify(result, null, 2));
}

testRealAudio();
