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

3. (Optional, recommended) populate placeholder products so the catalog
   isn't empty:

   ```bash
   npm run seed
   ```

   Safe to re-run any time -- it upserts by slug instead of duplicating.
   Swap the data in `scripts/seed.js` for Jamil's real products once he
   sends names, prices, and photos.

4. Run the dev server:

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
- **Placeholder assets**: `components/Logo.js` (text wordmark) and
  `components/BottlePlaceholder.js` (line-art SVG) are both built to be
  swapped for real client assets in one line once they're delivered.
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
- **Homepage brand-story copy is a placeholder** -- written to hold the
  layout together, not Jamil's actual words. Replace it with his real story
  once he provides one; don't ship the placeholder copy as final content.

## Scripts

- `npm run dev` -- start the dev server
- `npm run build` -- production build
- `npm run start` -- run a production build
- `npm run lint` -- ESLint
- `npm run seed` -- populate placeholder categories/products in MongoDB
