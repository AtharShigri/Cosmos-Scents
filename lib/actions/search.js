"use server";

import { getAllProducts } from "@/lib/products";
import { generateJson } from "@/lib/gemini";
import { formatCatalogForPrompt } from "@/lib/aiCatalog";

/**
 * Natural-language product search -- "something woody for winter
 * evenings" rather than keyword matching. Same grounded approach as the
 * chatbot: the whole live catalog goes in the prompt, and Gemini is only
 * ever allowed to hand back slugs that actually exist in it, so it can't
 * invent a product. Called from components/AISearchBar.js, which then
 * navigates to /products with the matched slugs in the URL (see
 * app/products/page.js) so the result is a shareable link and doesn't
 * re-call Gemini on every re-render.
 */
export async function aiSearchProducts(prevState, formData) {
  const query = String(formData.get("query") || "").trim().slice(0, 200);
  if (!query) return { error: "Type what you're looking for." };

  let products;
  try {
    products = await getAllProducts();
  } catch (err) {
    console.error("AI search: couldn't load catalog:", err);
    return { error: "Couldn't load the catalog right now -- please try again." };
  }

  if (products.length === 0) {
    return { success: true, query, slugs: [] };
  }

  try {
    const systemInstruction = `You match a shopper's description to real products from a
fragrance brand's catalog. Only ever return a slug that appears in the
catalog below -- never invent one, and never include the catalog's own
formatting (quotes, labels) in your answer.

Respond with JSON only, no markdown, no commentary, in exactly this shape:
{"slugs": ["slug-one", "slug-two"]}

List 0 to 5 slugs, most relevant first. An empty array is the correct
answer if nothing in the catalog genuinely fits the description.

Catalog:
${formatCatalogForPrompt(products)}`;

    const result = await generateJson({ systemInstruction, prompt: query, maxOutputTokens: 150 });
    const rawSlugs = Array.isArray(result?.slugs) ? result.slugs : [];
    const validSlugs = rawSlugs.filter((s) => products.some((p) => p.slug === s));

    return { success: true, query, slugs: validSlugs };
  } catch (err) {
    console.error("AI search error:", err);
    return {
      error: "Search isn't working right now -- please try again, or browse by collection below.",
    };
  }
}
