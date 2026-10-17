"use server";

import { getAllProducts } from "@/lib/products";
import { generateChatReply } from "@/lib/gemini";

// Jamil's real brand copy (same text as the homepage's "Our story" section --
// kept in sync by hand since it's short; if the homepage copy changes,
// update it here too).
const BRAND_CONTEXT = `You are the shopping assistant for Cosmos Scents, Gilgit-Baltistan's
first local fragrance brand, born in the heart of Shigar Valley. The brand's
mission is to celebrate the unique essence of Gilgit-Baltistan through
exquisite fragrances, bringing the heritage of its valleys to the world
through premium, handcrafted products. The catalog is organized into two
collections: Essence de Skardu and Essence de Hunza.`;

// The catalog is small (a handful of products), so there's no need for a
// vector search / embeddings setup -- the whole thing comfortably fits in
// the prompt as grounding context every time. This is "RAG" in the loose
// sense (retrieval from the live DB, not from training data) without the
// infrastructure a bigger catalog would need. Revisit if the catalog grows
// past, say, a few dozen products.
function buildSystemInstruction(products) {
  const catalogLines = products
    .map((p) => {
      const notes = p.scentNotes?.length ? p.scentNotes.join(", ") : "not specified";
      const collection = p.category?.name || "Uncategorized";
      const stockNote = p.stock > 0 ? "" : " (currently out of stock)";
      return `- ${p.name} -- ${collection}, Rs ${p.price.toLocaleString()}, ${p.size}.${stockNote} Notes: ${notes}.${p.tagline ? ` "${p.tagline}"` : ""}`;
    })
    .join("\n");

  return `${BRAND_CONTEXT}

Here is the FULL, CURRENT product catalog. This is the only source of
truth -- never invent a product, price, scent note, or collection that
isn't listed here, and never quote a different price than what's listed:

${catalogLines}

How to answer:
- Keep replies short -- 2 to 4 sentences, warm and natural, not salesy.
- If someone describes a mood or occasion (e.g. "something light for
  summer" or "a gift for my dad"), recommend 1-2 products from the list
  above and say briefly why they fit.
- If a question is unrelated to Cosmos Scents or fragrance, politely
  decline and steer back to the brand -- don't answer general questions.
- If you don't know something (e.g. shipping times, ingredients not
  listed above), say so honestly rather than guessing.
- Don't mention that you're an AI model, Gemini, or how you were built.`;
}

const MAX_HISTORY_MESSAGES = 10;

/**
 * @param {{role: "user"|"assistant", content: string}[]} history
 * @param {string} userMessage
 * @returns {Promise<{reply: string} | {error: string}>}
 */
export async function sendChatMessage(history, userMessage) {
  const trimmed = String(userMessage ?? "").trim().slice(0, 500);
  if (!trimmed) {
    return { error: "Type something first." };
  }

  try {
    const products = await getAllProducts();
    const systemInstruction = buildSystemInstruction(products);
    const recentHistory = Array.isArray(history) ? history.slice(-MAX_HISTORY_MESSAGES) : [];

    const reply = await generateChatReply({
      systemInstruction,
      history: recentHistory,
      userMessage: trimmed,
    });

    return { reply };
  } catch (err) {
    console.error("Chat error:", err);
    return {
      error:
        "Sorry, I'm having trouble responding right now -- please try again in a moment.",
    };
  }
}
