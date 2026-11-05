import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category"; // registers the "Category" model for populate()
import { generateJson } from "@/lib/gemini";
import { formatCatalogForPrompt } from "@/lib/aiCatalog";

// Plain serializable objects only -- Server Components can't pass
// Mongoose documents (or their ObjectIds) straight to Client Components.
function toPlainProduct(doc) {
  const obj = doc.toObject({ flattenObjectIds: true });
  return {
    ...obj,
    _id: String(obj._id),
    category: obj.category
      ? { ...obj.category, _id: String(obj.category._id) }
      : null,
    createdAt: obj.createdAt?.toISOString(),
    updatedAt: obj.updatedAt?.toISOString(),
  };
}

export async function getFeaturedProducts() {
  await dbConnect();
  const docs = await Product.find({ active: true, featured: true })
    .sort({ createdAt: -1 })
    .populate("category")
    .limit(6);
  return docs.map(toPlainProduct);
}

// Keys match the <select> in components/SortSelect.js / app/products/page.js.
const SORTS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating_desc: { ratingAvg: -1, ratingCount: -1 },
};

// `categorySlug` is optional -- omit it (or pass "all") to get everything.
// `sort` is optional -- one of the keys in SORTS above, defaults to newest.
export async function getAllProducts(categorySlug, sort) {
  await dbConnect();
  const filter = { active: true };

  if (categorySlug && categorySlug !== "all") {
    const category = await Category.findOne({ slug: categorySlug });
    // An unknown slug should show "no products", not "all products".
    filter.category = category ? category._id : null;
  }

  const docs = await Product.find(filter)
    .sort(SORTS[sort] || SORTS.newest)
    .populate("category");
  return docs.map(toPlainProduct);
}

// Fetches active products by slug, preserving the given order -- used by
// /products when showing AI search results (lib/actions/search.js hands
// back a ranked slug list, and this keeps that ranking rather than
// falling back to whatever order MongoDB returns documents in).
export async function getProductsBySlugs(slugs) {
  if (!slugs?.length) return [];
  await dbConnect();
  const docs = await Product.find({ slug: { $in: slugs }, active: true }).populate("category");
  const bySlug = new Map(docs.map((doc) => [doc.slug, doc]));
  return slugs.map((slug) => bySlug.get(slug)).filter(Boolean).map(toPlainProduct);
}

// Searches products using Gemini AI semantic matching (handling typos,
// spaces like "sia serfo", natural language, or scent notes), with a
// resilient multi-token / collapsed-text fallback.
export async function searchProducts(query, matchedSlugs) {
  if (matchedSlugs && matchedSlugs.length > 0) {
    return getProductsBySlugs(matchedSlugs);
  }
  const clean = String(query || "").trim().slice(0, 200);
  if (!clean) return [];

  await dbConnect();
  const allActiveDocs = await Product.find({ active: true }).populate("category");
  const plainAll = allActiveDocs.map(toPlainProduct);
  if (plainAll.length === 0) return [];

  // 1. Try Gemini AI semantic matching
  try {
    const systemInstruction = `You match a shopper's query (which may include typos, spaces, natural language, or notes like "sia serfo", "something woody", "chogri", "fresh floral") to real products from the fragrance catalog below.
Only ever return a slug that appears in the catalog -- never invent one.
Respond with JSON only, in exactly this shape:
{"slugs": ["slug-one", "slug-two"]}
List 0 to 5 slugs, most relevant first.
Catalog:
${formatCatalogForPrompt(plainAll)}`;

    const result = await generateJson({ systemInstruction, prompt: clean, maxOutputTokens: 150 });
    const rawSlugs = Array.isArray(result?.slugs) ? result.slugs : [];
    const validSlugs = rawSlugs.filter((s) => plainAll.some((p) => p.slug === s));

    if (validSlugs.length > 0) {
      const bySlug = new Map(plainAll.map((p) => [p.slug, p]));
      return validSlugs.map((s) => bySlug.get(s)).filter(Boolean);
    }
  } catch (aiErr) {
    console.warn("AI search error, falling back to multi-token match:", aiErr?.message || aiErr);
  }

  // 2. Fallback: Fuzzy collapsed + multi-token matching
  // "sia serfo" collapsed to "siaserfo" matches "siaserofo"
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const collapsed = clean.replace(/[\s\-_.]+/g, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const tokens = clean.split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  const directRegex = new RegExp(escaped, "i");
  const collapsedRegex = collapsed ? new RegExp(collapsed, "i") : directRegex;
  const tokenRegexes = tokens.map((t) => new RegExp(t, "i"));

  return plainAll.filter((p) => {
    const haystack = `${p.name} ${p.slug} ${p.tagline || ""} ${p.description || ""} ${(p.scentNotes || []).join(" ")}`;
    const collapsedHaystack = haystack.replace(/[\s\-_.]+/g, "");

    // Exact or collapsed match
    if (directRegex.test(haystack) || collapsedRegex.test(collapsedHaystack)) {
      return true;
    }
    // Token matches
    return tokenRegexes.some((r) => r.test(haystack));
  });
}

export async function getProductBySlug(slug) {
  await dbConnect();
  const doc = await Product.findOne({ slug, active: true }).populate("category");
  return doc ? toPlainProduct(doc) : null;
}

// Admin-only: includes inactive products, no filtering.
export async function getAllProductsAdmin() {
  await dbConnect();
  const docs = await Product.find().sort({ createdAt: -1 }).populate("category");
  return docs.map(toPlainProduct);
}

// Admin-only: fetch by id (not slug) for the edit form, inactive included.
export async function getProductByIdAdmin(id) {
  await dbConnect();
  const doc = await Product.findById(id).populate("category");
  return doc ? toPlainProduct(doc) : null;
}

function toPlainCategory(doc) {
  return {
    _id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    active: doc.active,
  };
}

// Public: only collections that are currently visible (category tabs,
// homepage "Shop by collection", the chatbot's grounding context).
export async function getCategories() {
  await dbConnect();
  const docs = await Category.find({ active: true }).sort({ name: 1 });
  return docs.map(toPlainCategory);
}

// Admin-only: every collection, including hidden ones -- so a hidden
// collection stays visible/manageable in the admin UI and a product
// that's still assigned to one doesn't lose its dropdown option.
export async function getCategoriesAdmin() {
  await dbConnect();
  const docs = await Category.find().sort({ name: 1 });
  return docs.map(toPlainCategory);
}
