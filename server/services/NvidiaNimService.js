/*
 * NVIDIA NIM Server-Side LLM Service
 * PrepQuarters AI Interview Engine
 * Connects to NVIDIA NIM endpoints via OpenAI-compatible REST API.
 */

const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_MODEL = "meta/llama-3.3-70b-instruct";
const REQUEST_TIMEOUT_MS = 35000;

/**
 * Checks whether NVIDIA NIM is configured with an active API key.
 */
function isNimConfigured() {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  return Boolean(apiKey && apiKey.trim().length > 0);
}

/**
 * Calls NVIDIA NIM chat completion endpoint.
 * @param {Array<{role: string, content: string}>} messages - Chat messages
 * @param {Object} options - Generation options
 * @param {number} [options.temperature=0.3] - Temperature
 * @param {number} [options.max_tokens=1500] - Max tokens
 * @param {boolean} [options.jsonMode=true] - Attempt JSON formatting
 * @returns {Promise<{success: boolean, text?: string, json?: any, error?: string}>}
 */
async function callNimChatCompletion(messages, options = {}) {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  const baseUrl = (process.env.NVIDIA_NIM_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const model = process.env.NVIDIA_NIM_MODEL || DEFAULT_MODEL;

  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      error: "NVIDIA_NIM_API_KEY is not configured in environment variables.",
      isConfigError: true,
    };
  }

  const endpoint = `${baseUrl}/chat/completions`;
  const temperature = typeof options.temperature === "number" ? options.temperature : 0.3;
  const max_tokens = typeof options.max_tokens === "number" ? options.max_tokens : 1500;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const payload = {
      model,
      messages,
      temperature,
      max_tokens,
      top_p: 0.9,
    };

    if (options.jsonMode) {
      payload.response_format = { type: "json_object" };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`NVIDIA NIM API error (${response.status}):`, errorBody);
      return {
        success: false,
        error: `NVIDIA NIM API responded with status ${response.status}: ${errorBody}`,
        statusCode: response.status,
      };
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    if (!rawContent) {
      return {
        success: false,
        error: "NVIDIA NIM returned an empty response.",
      };
    }

    // Try parsing as JSON if jsonMode is requested
    if (options.jsonMode) {
      const parsed = cleanAndParseJson(rawContent);
      if (parsed) {
        return {
          success: true,
          text: rawContent,
          json: parsed,
          model: data.model || model,
        };
      }
    }

    return {
      success: true,
      text: rawContent,
      model: data.model || model,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      return {
        success: false,
        error: `NVIDIA NIM request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`,
        isTimeout: true,
      };
    }

    console.error("NVIDIA NIM invocation exception:", err.message);
    return {
      success: false,
      error: err.message || "Failed to communicate with NVIDIA NIM API.",
    };
  }
}

/**
 * Robust helper to extract and parse JSON from LLM output.
 * Handles markdown ```json fences, stray characters, and escaped quotes.
 */
function cleanAndParseJson(text) {
  if (!text || typeof text !== "string") return null;

  try {
    return JSON.parse(text.trim());
  } catch (e) {
    // Continue to cleanup strategies
  }

  // Strategy 1: Extract block within ```json ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {
      // Continue
    }
  }

  // Strategy 2: Extract between first { and last }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonSubstring = text.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonSubstring);
    } catch (e) {
      // Continue
    }
  }

  return null;
}

module.exports = {
  isNimConfigured,
  callNimChatCompletion,
  cleanAndParseJson,
};
