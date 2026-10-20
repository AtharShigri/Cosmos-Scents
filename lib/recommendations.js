import { getAllProducts } from "@/lib/products";
import { generateJson } from "@/lib/gemini";
import { formatCatalogForPrompt } from "@/lib/aiCatalog";

/**
 * "You might also like" for a product page. There's no customer-account
 * system and no purchase history to drive a real recommendation engine,
 * so this is Gemini reasoning over scent notes/mood/collection against
 * the live catalog -- the same grounded, can't-invent-a-product approach
 * as the chatbot and AI search. If that call fails or comes back empty
 * (rate limit, missing API key, model hiccup), it falls back to a
 * simple same-collection pick rather than showing nothing or erroring
 * the whole product page over a "nice to have" section.
 */
export async function getAiRecommendations(product, limit = 3) {
  const catalog = await getAllProducts().catch(() => []);
  const others = catalog.filter((p) => p.slug !== product.slug);
  if (others.length === 0) return [];

  try {
    const systemInstruction = `You suggest products a shopper might also like, based on
scent notes, mood, and collection -- reasoning over the catalog, not real
purchase history (there isn't any). Only return slugs that appear in the
catalog below, never the product they're currently viewing, never an
invented slug.

Respond with JSON only, no markdown, no commentary, in exactly this shape:
{"slugs": ["slug-one", "slug-two"]}

List up to ${limit} slugs, most relevant first.

Catalog (excludes the product currently being viewed):
${formatCatalogForPrompt(others)}`;

    const prompt = `The shopper is looking at "${product.name}" (${
      product.tagline || product.description
    }). Scent notes: ${
      product.scentNotes?.length ? product.scentNotes.join(", ") : "not specified"
    }. What else might they like?`;

    const result = await generateJson({ systemInstruction, prompt, maxOutputTokens: 150 });
    const slugs = Array.isArray(result?.slugs) ? result.slugs.slice(0, limit) : [];
    const bySlug = new Map(others.map((p) => [p.slug, p]));
    const picked = slugs.map((s) => bySlug.get(s)).filter(Boolean);
    if (picked.length > 0) return picked;
  } catch (err) {
    console.error("AI recommendation error:", err);
  }

  // Fallback: same collection first, then anything else, most recent first
  // (others is already sorted newest-first from getAllProducts).
  const sameCollection = others.filter(
    (p) => p.category?._id && p.category._id === product.category?._id
  );
  const rest = others.filter(
    (p) => !p.category?._id || p.category._id !== product.category?._id
  );
  return [...sameCollection, ...rest].slice(0, limit);
}
