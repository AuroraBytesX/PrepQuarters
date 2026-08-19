/*
 * Unified AI Provider Router & Abstraction Layer
 * PrepQuarters Engineering Platform
 * Supports Dual Modes:
 * 1. My API (Platform Infrastructure with 40 req/min rate limit)
 * 2. Bring Your Own API (BYOK: OpenAI, Anthropic, xAI)
 */

const { cleanDisallowedChars } = require("./SanitizationHelper");

// Platform Rate Limiting: 40 requests per minute for "My API"
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 40;
const rateLimitTracker = new Map(); // userId / IP -> { count: number, resetAt: number }

function checkPlatformRateLimit(identityKey) {
  const now = Date.now();
  const entry = rateLimitTracker.get(identityKey) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  entry.count += 1;
  rateLimitTracker.set(identityKey, entry);

  const isAllowed = entry.count <= RATE_LIMIT_MAX_REQUESTS;
  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count);
  const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);

  return {
    allowed: isAllowed,
    limit: RATE_LIMIT_MAX_REQUESTS,
    remaining,
    resetSeconds,
  };
}

/**
 * Resolves the appropriate model name for the given provider.
 * Gracefully resolves requested models or falls back to supported defaults.
 */
function resolveModelForProvider(provider, requestedModel) {
  const normalizedProvider = (provider || "platform").toLowerCase();
  const req = (requestedModel || "").trim();

  switch (normalizedProvider) {
    case "openai":
      if (req && (req.includes("gpt-4") || req.includes("o1") || req.includes("o3"))) return req;
      return "gpt-4o-mini";

    case "anthropic":
      if (req && req.includes("claude-3")) return req;
      return "claude-3-5-haiku-20241022";

    case "xai":
      if (req && req.includes("grok")) return req;
      return "grok-2-latest";

    case "platform":
    case "nvidia":
    default:
      if (req && (req.includes("llama") || req.includes("qwen") || req.includes("deepseek"))) return req;
      return process.env.NVIDIA_NIM_MODEL || "meta/llama-3.3-70b-instruct";
  }
}

/**
 * Executes chat completion across the selected AI provider.
 * @param {Object} params
 * @param {Array<{role: string, content: string}>} params.messages
 * @param {Object} [params.options]
 * @param {string} [params.options.temperature=0.3]
 * @param {number} [params.options.max_tokens=1500]
 * @param {boolean} [params.options.jsonMode=true]
 * @param {Object} [params.providerConfig] - { mode: "my_api" | "byok", provider: string, apiKey?: string, model?: string }
 * @param {string} [params.userIdentifier] - User ID or IP for rate limiting
 * @returns {Promise<{success: boolean, text?: string, json?: any, error?: string, provider: string, model: string}>}
 */
async function callAiChatCompletion({
  messages = [],
  options = {},
  providerConfig = {},
  userIdentifier = "anonymous_client",
}) {
  const mode = providerConfig.mode === "byok" ? "byok" : "my_api";
  const provider = (providerConfig.provider || (mode === "byok" ? "openai" : "platform")).toLowerCase();
  const requestedModel = providerConfig.model || "default";
  const resolvedModel = resolveModelForProvider(provider, requestedModel);

  // 1. Enforce Platform Rate Limit (40 req/min) for "My API"
  if (mode === "my_api") {
    const rateCheck = checkPlatformRateLimit(userIdentifier);
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: `Platform rate limit reached (40 requests/minute). Please retry in ${rateCheck.resetSeconds} seconds or connect your own API key.`,
        isRateLimited: true,
        retryAfterSeconds: rateCheck.resetSeconds,
        provider: "platform",
        model: resolvedModel,
      };
    }
  }

  // 2. Dispatch to specific provider handler
  try {
    if (mode === "byok") {
      if (!providerConfig.apiKey || !providerConfig.apiKey.trim()) {
        return {
          success: false,
          error: `Please provide a valid API key for ${provider.toUpperCase()} or switch to My API mode.`,
          isConfigError: true,
          provider,
          model: resolvedModel,
        };
      }

      if (provider === "openai") {
        return await callOpenAiApi(messages, options, providerConfig.apiKey.trim(), resolvedModel);
      } else if (provider === "anthropic") {
        return await callAnthropicApi(messages, options, providerConfig.apiKey.trim(), resolvedModel);
      } else if (provider === "xai") {
        return await callXaiApi(messages, options, providerConfig.apiKey.trim(), resolvedModel);
      }
    }

    // Default Platform Execution (NVIDIA NIM / Open Platform Router)
    return await callPlatformNimApi(messages, options, resolvedModel);
  } catch (err) {
    console.error(`[AI_ROUTER_ERROR] Provider ${provider} failure:`, err.message);
    return {
      success: false,
      error: `AI generation notice: ${cleanDisallowedChars(err.message)}`,
      provider,
      model: resolvedModel,
    };
  }
}

/* =======================================================================
   PROVIDER HANDLERS
======================================================================= */

async function callPlatformNimApi(messages, options, model) {
  const nimKey = process.env.NVIDIA_NIM_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  let apiKey = nimKey;
  let baseUrl = (process.env.NVIDIA_NIM_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/+$/, "");
  let resolvedModel = model;

  if (!apiKey || !apiKey.trim()) {
    if (groqKey && groqKey.trim()) {
      apiKey = groqKey.trim();
      baseUrl = "https://api.groq.com/openai/v1";
      resolvedModel = "llama-3.3-70b-versatile";
    } else {
      return {
        success: false,
        error: "Platform AI inference key is not configured.",
        isConfigError: true,
        provider: "platform",
        model,
      };
    }
  }

  const payload = {
    model: resolvedModel,
    messages,
    temperature: typeof options.temperature === "number" ? options.temperature : 0.3,
    max_tokens: typeof options.max_tokens === "number" ? options.max_tokens : 1500,
  };

  if (options.jsonMode) {
    payload.response_format = { type: "json_object" };
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      success: false,
      error: `Platform provider responded with HTTP ${response.status}: ${cleanDisallowedChars(errorText)}`,
      provider: "platform",
      model,
    };
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || "";
  let json = null;

  if (options.jsonMode && rawText) {
    try {
      json = JSON.parse(rawText.replace(/```json/gi, "").replace(/```/g, "").trim());
    } catch (e) {
      // Fallback parser if JSON was slightly formatted
    }
  }

  return {
    success: true,
    text: cleanDisallowedChars(rawText),
    json,
    provider: "platform",
    model,
  };
}

async function callOpenAiApi(messages, options, apiKey, model) {
  const payload = {
    model,
    messages,
    temperature: typeof options.temperature === "number" ? options.temperature : 0.3,
    max_tokens: typeof options.max_tokens === "number" ? options.max_tokens : 1500,
  };

  if (options.jsonMode) {
    payload.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    return {
      success: false,
      error: `OpenAI returned status ${response.status}: ${cleanDisallowedChars(errText)}`,
      provider: "openai",
      model,
    };
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || "";
  let json = null;
  if (options.jsonMode && rawText) {
    try {
      json = JSON.parse(rawText.replace(/```json/gi, "").replace(/```/g, "").trim());
    } catch (e) {}
  }

  return {
    success: true,
    text: cleanDisallowedChars(rawText),
    json,
    provider: "openai",
    model,
  };
}

async function callAnthropicApi(messages, options, apiKey, model) {
  const systemMsg = messages.find((m) => m.role === "system")?.content || "";
  const conversationMsgs = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

  const payload = {
    model,
    max_tokens: typeof options.max_tokens === "number" ? options.max_tokens : 1500,
    temperature: typeof options.temperature === "number" ? options.temperature : 0.3,
    messages: conversationMsgs.length > 0 ? conversationMsgs : [{ role: "user", content: "Hello" }],
  };

  if (systemMsg) {
    payload.system = systemMsg;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    return {
      success: false,
      error: `Anthropic returned status ${response.status}: ${cleanDisallowedChars(errText)}`,
      provider: "anthropic",
      model,
    };
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text || "";
  let json = null;
  if (options.jsonMode && rawText) {
    try {
      json = JSON.parse(rawText.replace(/```json/gi, "").replace(/```/g, "").trim());
    } catch (e) {}
  }

  return {
    success: true,
    text: cleanDisallowedChars(rawText),
    json,
    provider: "anthropic",
    model,
  };
}

async function callXaiApi(messages, options, apiKey, model) {
  const payload = {
    model,
    messages,
    temperature: typeof options.temperature === "number" ? options.temperature : 0.3,
    max_tokens: typeof options.max_tokens === "number" ? options.max_tokens : 1500,
  };

  if (options.jsonMode) {
    payload.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    return {
      success: false,
      error: `xAI returned status ${response.status}: ${cleanDisallowedChars(errText)}`,
      provider: "xai",
      model,
    };
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || "";
  let json = null;
  if (options.jsonMode && rawText) {
    try {
      json = JSON.parse(rawText.replace(/```json/gi, "").replace(/```/g, "").trim());
    } catch (e) {}
  }

  return {
    success: true,
    text: cleanDisallowedChars(rawText),
    json,
    provider: "xai",
    model,
  };
}

module.exports = {
  callAiChatCompletion,
  checkPlatformRateLimit,
  resolveModelForProvider,
};
