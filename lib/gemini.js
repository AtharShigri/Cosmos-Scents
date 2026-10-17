/**
 * Thin wrapper around the Gemini API's generateContent REST endpoint --
 * no SDK dependency, just fetch(). Used by the storefront chatbot
 * (lib/actions/chat.js).
 *
 * Model choice: defaults to gemini-2.5-flash, a stable (non-preview),
 * inexpensive model well-suited to short grounded Q&A like this. It's
 * overridable via GEMINI_MODEL in .env.local without touching code, in
 * case you want to try a newer Flash model later -- I picked the stable
 * one on purpose since I can't test against your live API key from here.
 */
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
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
  const url = `${API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

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
    throw new Error(`Gemini API error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  if (!text.trim()) {
    // Most commonly a safety-filter block (finishReason: SAFETY) -- treat
    // it the same as any other failure rather than returning empty text.
    const finishReason = data?.candidates?.[0]?.finishReason;
    throw new Error(`Gemini returned no text (finishReason: ${finishReason ?? "unknown"}).`);
  }

  return text.trim();
}
