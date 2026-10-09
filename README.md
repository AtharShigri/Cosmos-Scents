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

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000. The homepage is a Day 1 placeholder;
   http://localhost:3000/style-guide is the internal design reference --
   every color, type size, button, and card the site uses traces back to
   that page.

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

## Scripts

- `npm run dev` -- start the dev server
- `npm run build` -- production build
- `npm run start` -- run a production build
- `npm run lint` -- ESLint
