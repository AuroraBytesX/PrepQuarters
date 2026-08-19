/*
 * Transcription Service (STT)
 * PrepQuarters Core Speech-to-Text Pipeline
 * Powered by Groq Whisper (whisper-large-v3 / whisper-large-v3-turbo),
 * OpenAI Whisper, and Deepgram Nova-2.
 */

const { cleanDisallowedChars } = require("./SanitizationHelper");

/**
 * Transcribes an audio buffer into text using the configured speech-to-text provider.
 * 
 * @param {Object} options
 * @param {Buffer} options.buffer Audio file buffer
 * @param {string} options.mimetype MIME type (e.g. 'audio/webm', 'audio/wav', 'audio/mp4')
 * @param {string} options.filename Original filename
 * @returns {Promise<{ success: boolean, transcript: string, provider: string, latencyMs?: number, message?: string }>}
 */
async function transcribeAudio({ buffer, mimetype = "audio/webm", filename = "recording.webm" }) {
  if (!buffer || buffer.length === 0) {
    console.warn("[STT_ERROR] Empty audio buffer received");
    return {
      success: false,
      transcript: "",
      provider: "none",
      latencyMs: 0,
      message: "Empty audio buffer received. Please speak for at least 1-2 seconds.",
    };
  }

  // 1. Groq Whisper (Ultra-fast cloud Whisper large-v3)
  const groqKey = (process.env.GROQ_API_KEY || "").trim();
  let lastProviderError = "";

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
          latencyMs: elapsedMs,
        };
      } else {
        lastProviderError = result.message || "Groq Whisper returned empty transcript.";
        console.warn(`[STT_ERROR] Groq Whisper response error:`, lastProviderError);
      }
    } catch (err) {
      lastProviderError = err.message || "Network error contacting Groq Whisper.";
      console.warn("[STT_ERROR] Groq Whisper request error:", lastProviderError);
    }
  }

  // 2. OpenAI Whisper Fallback
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
          latencyMs: elapsedMs,
        };
      } else {
        lastProviderError = result.message || "OpenAI Whisper returned empty transcript.";
        console.warn(`[STT_ERROR] OpenAI Whisper response error:`, lastProviderError);
      }
    } catch (err) {
      lastProviderError = err.message || "Network error contacting OpenAI Whisper.";
      console.warn("[STT_ERROR] OpenAI Whisper request error:", lastProviderError);
    }
  }

  // 3. Deepgram Nova-2 Fallback
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
          latencyMs: elapsedMs,
        };
      } else {
        lastProviderError = result.message || "Deepgram returned empty transcript.";
      }
    } catch (err) {
      lastProviderError = err.message || "Network error contacting Deepgram.";
      console.warn("[STT_ERROR] Deepgram request error:", lastProviderError);
    }
  }

  if (groqKey || openaiKey || deepgramKey) {
    return {
      success: false,
      transcript: "",
      provider: "failed",
      latencyMs: 0,
      message: lastProviderError || "Speech transcription service was unable to process the audio. Please try speaking again or use typed input.",
    };
  }

  console.warn("[STT_ERROR] No external STT API key configured in server/.env");
  return {
    success: false,
    transcript: "",
    provider: "none",
    latencyMs: 0,
    message: "No STT API key configured. Please set GROQ_API_KEY in server/.env (free at https://console.groq.com).",
  };
}

/**
 * Transcribe via Groq Whisper API using native Node fetch and FormData
 */
async function transcribeWithGroq(buffer, filename, mimetype, apiKey) {
  const cleanMime = (mimetype || "audio/webm").split(";")[0].trim();
  const cleanFilename = filename && filename.includes(".") ? filename : "recording.webm";

  const formData = new FormData();
  formData.append("model", "whisper-large-v3");
  formData.append("language", "en");
  formData.append("response_format", "json");
  formData.append("file", new Blob([buffer], { type: cleanMime }), cleanFilename);

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
    fallbackFormData.append("file", new Blob([buffer], { type: cleanMime }), cleanFilename);

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
    message: json.error?.message || `Groq Whisper returned status ${res.status}`,
  };
}

/**
 * Transcribe via OpenAI Whisper API using native Node fetch and FormData
 */
async function transcribeWithOpenAI(buffer, filename, mimetype, apiKey) {
  const cleanMime = (mimetype || "audio/webm").split(";")[0].trim();
  const cleanFilename = filename && filename.includes(".") ? filename : "recording.webm";

  const formData = new FormData();
  formData.append("model", "whisper-1");
  formData.append("language", "en");
  formData.append("response_format", "json");
  formData.append("file", new Blob([buffer], { type: cleanMime }), cleanFilename);

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
    message: json.error?.message || `OpenAI Whisper returned status ${res.status}`,
  };
}

/**
 * Transcribe via Deepgram Nova-2 API
 */
async function transcribeWithDeepgram(buffer, mimetype, apiKey) {
  const cleanMime = (mimetype || "audio/webm").split(";")[0].trim();
  const res = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&language=en", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": cleanMime,
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
    message: json.err_msg || `Deepgram returned status ${res.status}`,
  };
}

module.exports = {
  transcribeAudio,
};
