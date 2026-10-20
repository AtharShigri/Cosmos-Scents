/**
 * Shared catalog formatting for the two Gemini-backed features that need
 * to hand back a product *slug* -- AI search (lib/actions/search.js) and
 * "you might also like" recommendations (lib/recommendations.js). Same
 * "stuff the whole catalog in the prompt" approach as the chatbot
 * (lib/actions/chat.js's buildSystemInstruction), just including the
 * slug explicitly since these two features match back to a real product
 * rather than just describing one in a sentence.
 */
export function formatCatalogForPrompt(products) {
  return products
    .map((p) => {
      const notes = p.scentNotes?.length ? p.scentNotes.join(", ") : "not specified";
      const collection = p.category?.name || "Uncategorized";
      const stockNote = p.stock > 0 ? "" : " (out of stock)";
      return `- slug: "${p.slug}" | ${p.name} | ${collection} | Rs ${p.price.toLocaleString()}${stockNote} | notes: ${notes}${
        p.tagline ? ` | "${p.tagline}"` : ""
      }`;
    })
    .join("\n");
}
