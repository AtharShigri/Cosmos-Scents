/**
 * Thin wrapper around the Gemini API's generateContent REST endpoint --
 * no SDK dependency, just fetch(). Used by the storefront chatbot
 * (lib/actions/chat.js) and search / recommendation grounding.
 *
 * Resilience: Google AI Studio's free tier occasionally serves 503
 * ("model currently experiencing high demand") or 429 (daily free tier
 * quota hit on a specific model). We maintain an ordered candidate list
 * so if the primary model is busy or hits capacity, it automatically
 * falls back to an available sibling flash model without crashing the chat.
 */
const DEFAULT_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
].filter(Boolean);

// Unique models in priority order
const CANDIDATE_MODELS = Array.from(new Set(DEFAULT_MODELS));

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY is not set. Copy .env.example to .env.local and fill it in " +
        "(see README.md -- get a key at https://aistudio.google.com/apikey)."
    );
  }
  return key;
}

/**
 * @param {object} params
 * @param {string} params.systemInstruction -- grounding context + rules
 * @param {{role: "user"|"assistant", content: string}[]} params.history -- prior turns
 * @param {string} params.userMessage -- the new message to answer
 * @returns {Promise<string>} the model's reply text
 */
export async function generateChatReply({ systemInstruction, history, userMessage }) {
  const apiKey = getApiKey();

  const mappedHistory = history.map((m) => ({
    // Gemini calls the assistant turn "model", not "assistant".
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Gemini rejects any request whose contents array doesn't start with a
  // "user" turn. The caller is expected to only pass real prior turns
  // (never a local-only greeting), but this guard makes that a hard
  // guarantee instead of a convention -- drop any leading "model" turns
  // rather than send a request that's guaranteed to fail.
  while (mappedHistory.length && mappedHistory[0].role === "model") {
    mappedHistory.shift();
  }

  const contents = [...mappedHistory, { role: "user", parts: [{ text: userMessage }] }];

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 400,
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        // 503 (high demand), 429 (quota), or 404 (deprecated model): failover
        if (res.status === 503 || res.status === 429 || res.status === 404) {
          console.warn(`[Gemini] ${model} returned ${res.status}. Falling back to next candidate...`);
          lastError = new Error(`Gemini API error ${res.status}: ${body.slice(0, 300)}`);
          continue;
        }
        throw new Error(`Gemini API error ${res.status}: ${body.slice(0, 300)}`);
      }

      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

      if (!text.trim()) {
        const finishReason = data?.candidates?.[0]?.finishReason;
        throw new Error(`Gemini returned no text (finishReason: ${finishReason ?? "unknown"}).`);
      }

      return text.trim();
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("All candidate Gemini models failed to respond.");
}

/**
 * One-shot (no conversation history) call for structured JSON tasks.
 * Includes automatic candidate model fallback on 503/429/404.
 *
 * @param {object} params
 * @param {string} params.systemInstruction
 * @param {string} params.prompt
 * @param {number} [params.maxOutputTokens]
 * @returns {Promise<any>} the parsed JSON value
 */
export async function generateJson({ systemInstruction, prompt, maxOutputTokens = 300 }) {
  const apiKey = getApiKey();
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        if (res.status === 503 || res.status === 429 || res.status === 404) {
          console.warn(`[Gemini] ${model} returned ${res.status}. Falling back to next candidate...`);
          lastError = new Error(`Gemini API error ${res.status}: ${body.slice(0, 300)}`);
          continue;
        }
        throw new Error(`Gemini API error ${res.status}: ${body.slice(0, 300)}`);
      }

      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

      if (!text.trim()) {
        const finishReason = data?.candidates?.[0]?.finishReason;
        throw new Error(`Gemini returned no text (finishReason: ${finishReason ?? "unknown"}).`);
      }

      let cleaned = text.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/```\s*$/, "").trim();
      }

      try {
        return JSON.parse(cleaned);
      } catch {
        throw new Error(`Gemini returned invalid JSON: ${cleaned.slice(0, 200)}`);
      }
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error("All candidate Gemini models failed to respond.");
}
