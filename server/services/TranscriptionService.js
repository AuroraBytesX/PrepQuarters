/*
 * Transcription Service (STT)
 * PrepQuarters Core Speech-to-Text Pipeline
 * Powered by Groq Whisper (whisper-large-v3 / whisper-large-v3-turbo),
 * OpenAI Whisper, and Deepgram Nova-2.
 */

/**
 * Transcribes an audio buffer into text using the configured speech-to-text provider.
 * 
 * @param {Object} options
 * @param {Buffer} options.buffer Audio file buffer
 * @param {string} options.mimetype MIME type (e.g. 'audio/webm', 'audio/wav')
 * @param {string} options.filename Original filename
 * @returns {Promise<{ success: boolean, transcript: string, provider: string, durationMs?: number, message?: string }>}
 */
async function transcribeAudio({ buffer, mimetype = "audio/webm", filename = "recording.webm" }) {
  if (!buffer || buffer.length === 0) {
    console.warn("[STT_ERROR] Empty audio buffer received");
    return {
      success: false,
      transcript: "",
      provider: "none",
      message: "Empty audio buffer received.",
    };
  }

  // 1. Groq Whisper (Ultra-fast cloud Whisper large-v3)
  const groqKey = (process.env.GROQ_API_KEY || "").trim();
  if (groqKey) {
    try {
      console.info(`[STT_REQUEST_SENT] Dispatching audio to Groq Whisper (${buffer.length} bytes, ${mimetype})...`);
      const startTime = Date.now();
      const result = await transcribeWithGroq(buffer, filename, mimetype, groqKey);
      const elapsedMs = Date.now() - startTime;

      if (result.success && result.transcript) {
        console.info(`[STT_RESPONSE_RECEIVED] Groq Whisper responded in ${elapsedMs}ms: success=true`);
        return {
          success: true,
          transcript: cleanDisallowedChars(result.transcript),
          provider: "Groq Whisper (whisper-large-v3)",
          durationMs: elapsedMs,
        };
      } else {
        console.warn(`[STT_ERROR] Groq Whisper response error:`, result.message);
      }
    } catch (err) {
      console.warn("[STT_ERROR] Groq Whisper request error:", err.message);
    }
  }

  // 2. OpenAI Whisper
  const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (openaiKey) {
    try {
      console.info(`[STT_REQUEST_SENT] Dispatching audio to OpenAI Whisper (${buffer.length} bytes)...`);
      const startTime = Date.now();
      const result = await transcribeWithOpenAI(buffer, filename, mimetype, openaiKey);
      const elapsedMs = Date.now() - startTime;

      if (result.success && result.transcript) {
        console.info(`[STT_RESPONSE_RECEIVED] OpenAI Whisper responded in ${elapsedMs}ms: success=true`);
        return {
          success: true,
          transcript: cleanDisallowedChars(result.transcript),
          provider: "OpenAI Whisper (whisper-1)",
          durationMs: elapsedMs,
        };
      } else {
        console.warn(`[STT_ERROR] OpenAI Whisper response error:`, result.message);
      }
    } catch (err) {
      console.warn("[STT_ERROR] OpenAI Whisper request error:", err.message);
    }
  }

  // 3. Deepgram Nova-2
  const deepgramKey = (process.env.DEEPGRAM_API_KEY || "").trim();
  if (deepgramKey) {
    try {
      console.info(`[STT_REQUEST_SENT] Dispatching audio to Deepgram Nova-2 (${buffer.length} bytes)...`);
      const startTime = Date.now();
      const result = await transcribeWithDeepgram(buffer, mimetype, deepgramKey);
      const elapsedMs = Date.now() - startTime;

      if (result.success && result.transcript) {
        console.info(`[STT_RESPONSE_RECEIVED] Deepgram responded in ${elapsedMs}ms: success=true`);
        return {
          success: true,
          transcript: cleanDisallowedChars(result.transcript),
          provider: "Deepgram Nova-2",
          durationMs: elapsedMs,
        };
      }
    } catch (err) {
      console.warn("[STT_ERROR] Deepgram request error:", err.message);
    }
  }

  console.warn("[STT_ERROR] No external STT API key configured in server/.env");
  return {
    success: false,
    transcript: "",
    provider: "none",
    message: "No external STT API key configured. Please set GROQ_API_KEY in server/.env (free at https://console.groq.com).",
  };
}

/**
 * Transcribe via Groq Whisper API using native Node fetch and FormData
 */
async function transcribeWithGroq(buffer, filename, mimetype, apiKey) {
  const formData = new FormData();
  formData.append("model", "whisper-large-v3");
  formData.append("language", "en");
  formData.append("response_format", "json");
  formData.append("file", new Blob([buffer], { type: mimetype || "audio/webm" }), filename || "recording.webm");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const json = await res.json();
  if (res.ok && json.text !== undefined) {
    return { success: true, transcript: json.text.trim() };
  }

  // Try fallback to whisper-large-v3-turbo if large-v3 returned an error
  try {
    const fallbackFormData = new FormData();
    fallbackFormData.append("model", "whisper-large-v3-turbo");
    fallbackFormData.append("language", "en");
    fallbackFormData.append("response_format", "json");
    fallbackFormData.append("file", new Blob([buffer], { type: mimetype || "audio/webm" }), filename || "recording.webm");

    const fallbackRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: fallbackFormData,
    });

    const fallbackJson = await fallbackRes.json();
    if (fallbackRes.ok && fallbackJson.text !== undefined) {
      return { success: true, transcript: fallbackJson.text.trim() };
    }
  } catch (fbErr) {}

  return {
    success: false,
    message: json.error?.message || `Groq Whisper failed with status ${res.status}`,
  };
}

/**
 * Transcribe via OpenAI Whisper API using native Node fetch and FormData
 */
async function transcribeWithOpenAI(buffer, filename, mimetype, apiKey) {
  const formData = new FormData();
  formData.append("model", "whisper-1");
  formData.append("language", "en");
  formData.append("response_format", "json");
  formData.append("file", new Blob([buffer], { type: mimetype || "audio/webm" }), filename || "recording.webm");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  const json = await res.json();
  if (res.ok && json.text !== undefined) {
    return { success: true, transcript: json.text.trim() };
  }

  return {
    success: false,
    message: json.error?.message || `OpenAI Whisper failed with status ${res.status}`,
  };
}

/**
 * Transcribe via Deepgram Nova-2 API
 */
async function transcribeWithDeepgram(buffer, mimetype, apiKey) {
  const res = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": mimetype || "audio/webm",
    },
    body: buffer,
  });

  const json = await res.json();
  const transcript = json.results?.channels?.[0]?.alternatives?.[0]?.transcript;
  if (res.ok && transcript !== undefined) {
    return { success: true, transcript: transcript.trim() };
  }

  return {
    success: false,
    message: json.err_msg || `Deepgram failed with status ${res.status}`,
  };
}

function cleanDisallowedChars(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/[\u2014\u2015]/g, " - ")
    .replace(/[\u2013]/g, "-")
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/[\u2600-\u27BF]/g, "");
}

module.exports = {
  transcribeAudio,
};
