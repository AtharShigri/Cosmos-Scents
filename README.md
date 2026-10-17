# Cosmos Scents

Gilgit-Baltistan's first local fragrance brand -- AI-powered storefront
rebuild. Next.js (App Router) + Tailwind CSS v4 + MongoDB + Gemini.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template and fill in real values:

   ```bash
   cp .env.example .env.local
   ```

   - `MONGODB_URI` -- from MongoDB Atlas ("Connect" -> "Drivers", or the
     "Download .env file" button). Paste just the connection string here.
   - `GEMINI_API_KEY` -- from https://aistudio.google.com/apikey
   - `JWT_SECRET` -- any long random string, e.g.
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

   `.env.local` is already git-ignored -- it will never be committed.

3. Populate the catalog (real products, confirmed by Jamil 2026-10-13):

   ```bash
   npm run seed
   ```

   Safe to re-run any time -- it upserts by slug instead of duplicating,
   and it also removes the old Day 2 dev placeholders (Desert Oud etc.)
   if they're still in your database. Prices are still a flat Rs 7,000
   placeholder across the board (Jamil confirmed the real range is
   Rs 5,000-7,000, but not per-product prices yet) -- called out in a
   comment at the top of `scripts/seed.js` so it's easy to find and fix.
   The Essence de Skardu / Essence de Hunza grouping there is confirmed
   as-is for now.

4. Create an admin account so you can log into `/admin`:

   ```bash
   node scripts/create-admin.js you@example.com "some-password"
   ```

   Safe to re-run with the same email to reset that admin's password.
   There's no public signup page on purpose.

5. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 for the homepage, /products for the catalog,
   and /style-guide for the internal design reference -- every color, type
   size, button, and card the site uses traces back to that page.

## Notes for whoever picks this up

- **Design direction**: white/paper is the dominant surface, ink (near-black)
  handles text and structure, gold is a sparing point-accent only -- never a
  filled background, gradient, or glow. This is intentional: the previous
  black+gold-dominant version read as "AI generated" to the client, and the
  working theory is that it was the *ratio*, not the colors themselves.
  Keep new UI consistent with `/style-guide` rather than introducing new
  patterns per-page.
- **Fonts**: Fraunces (headings) + Inter (body), via `next/font/google`.
  Fraunces was chosen specifically over Playfair Display, which is the most
  common "elegant brand" default in AI site generators.
- **Cache Components**: Next.js 16's `cacheComponents` / `partialPrefetching`
  flags are deliberately left **off** in `next.config.mjs` (see the comment
  there). Turning them on later requires wrapping dynamic data access in
  `'use cache'` / `<Suspense>` -- out of scope for this project's timeline.
- **Logo**: the real logo file (`public/brand/logo.jpg` /
  `logo-cropped.jpg`) has a solid black background baked into the JPEG --
  no transparent version exists yet. Using it in the header would put a
  black rectangle on the white/bright design, so `components/Logo.js`
  still renders the text wordmark for now. Ask Jamil's designer for a
  transparent PNG/SVG export, then swap `Logo.js` over to an `<Image>`.
  The real logo is fine to use as-is somewhere with an intentionally dark
  background (e.g. a future dark footer band).
- **Product photos**: real, in `public/products/`. `components/
  BottlePlaceholder.js` (line-art SVG) is still used as the fallback for
  any product with an empty `images` array, so it's safe to keep around.
- **Build note**: if `npm run build` or `npm run dev` ever can't reach
  `fonts.googleapis.com` (e.g. behind a restrictive proxy/sandbox), that's a
  network issue in that environment, not a code bug -- the app otherwise
  builds and lints clean.
- **Data layer**: `lib/db.js` is a cached Mongoose connection helper;
  `models/` has `Product`, `Category`, `Order`, `User`. Pages that read the
  database (`/`, `/products`, `/products/[slug]`) are marked
  `export const dynamic = "force-dynamic"` so they're rendered per-request
  instead of at build time -- this matters because Cache Components is off
  (see above), and because a build machine may not have DB credentials or
  network access to Atlas.
- **Homepage brand-story copy** is now Jamil's real text (provided
  2026-10-13: mission, Shigar Valley origin, Essence de Skardu / Essence
  de Hunza collections). If he sends more (full history, founder story,
  etc.) there's room to expand this section.
- **Category filtering**: `/products?category=<slug>` filters by
  collection; `/products` tabs are generated from whatever's in the
  `Category` collection, so a new collection just needs a new `Category`
  document -- no code change.
- **Admin dashboard**: `/admin` -- manage products (add/edit/hide),
  collections, and orders (view + update status), plus a stats overview
  (revenue, pending orders, low stock). No public signup; create accounts
  with `scripts/create-admin.js` (see Getting started above). Auth is a
  signed JWT in an httpOnly cookie, checked both in `proxy.js` (Next 16's
  renamed `middleware.js` -- same mechanism) and again inside every
  mutating Server Function via `lib/requireAdmin.js`, per Next's own
  guidance that a Server Function can end up reachable even if a proxy
  matcher stops covering its route. There's no image uploader yet --
  adding a product's photo means pasting a path under `/products/` (if
  you've added the file there yourself) or a hosted image URL into the
  "Image URLs" field.
- **Chatbot ("Ask Cosmos")**: a floating widget (`components/ChatWidget.js`)
  on every public page (hidden on `/admin`, same pattern as `Header.js`).
  Answers product questions and makes recommendations, grounded in the
  live catalog -- `lib/actions/chat.js` pulls every active product fresh
  from MongoDB on each message and hands the whole thing to Gemini as
  context, so it can't invent a product, price, or scent note that isn't
  actually in the database. The catalog's small enough that this "stuff
  the whole thing in the prompt" approach is simpler and more reliable
  than a real vector-search setup -- revisit if the catalog grows past a
  few dozen products. Conversation history lives in the browser tab only
  (plain `useState`, resets on refresh) -- no `Conversation` model, by
  design, to keep this simple; easy to add later if Jamil wants to review
  past chats. Model defaults to `gemini-2.5-flash` (`lib/gemini.js`),
  overridable via `GEMINI_MODEL` in `.env.local`.

## Scripts

- `npm run dev` -- start the dev server
- `npm run build` -- production build
- `npm run start` -- run a production build
- `npm run lint` -- ESLint
- `npm run seed` -- populate the real catalog (categories/products) in MongoDB
