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
   - `BLOB_READ_WRITE_TOKEN` -- from a Vercel Blob store (dashboard -> your
     project -> Storage -> Create -> Blob). Only needed for the admin
     "Upload photos" field; everything else works without it.

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

   Open http://localhost:3000 for the homepage and /products for the catalog.

## Notes for whoever picks this up

- **Design direction**: white/paper is the dominant surface, ink (near-black)
  handles text and structure, gold is a sparing point-accent only -- never a
  filled background, gradient, or glow. This is intentional: the previous
  black+gold-dominant version read as "AI generated" to the client, and the
  working theory is that it was the *ratio*, not the colors themselves.
  Keep new UI consistent with the tokens in `app/globals.css` (and how
  `components/Button.js` uses them) rather than introducing new patterns
  per-page. (There used to be a `/style-guide` reference page for this --
  removed once the client flagged it as an obvious dev/test page.)
  **One deliberate exception**: the homepage hero carousel (see below) is a
  full-bleed photography slider with an `--color-ink` backdrop and a dark
  gradient scrim behind the hero copy, so it visually merges with the
  carousel photos instead of sitting on a white band above them. This is
  confined to that one section -- it's not a step back toward a black-
  dominant site, just the one place a dark backdrop is the honest choice
  because it's sitting behind a full-screen photo, not UI chrome.
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
  matcher stops covering its route. The product form's "Upload photos"
  field uploads straight to Vercel Blob storage (`lib/blob.js`) and adds
  the result to the product's image list -- needs `BLOB_READ_WRITE_TOKEN`
  (see env setup above). You can also still paste a path under
  `/products/` or any hosted image URL directly into the "Existing / extra
  image URLs" field; both get combined. One known gap: deleting or
  replacing an image doesn't delete the old file from Blob storage, so a
  product that's had its photo swapped a few times will leave orphaned
  files there -- harmless (low cost, nothing points at them) but worth
  knowing; Jamil can clean them up from the Vercel dashboard if it matters.
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
  past chats. Model defaults to `gemini-3.8-flash` (`lib/gemini.js`),
  overridable via `GEMINI_MODEL` in `.env.local`.
- **Homepage carousel / hero**: drop an image named `carousel-N.jpg` (or
  `.jpeg`/`.png`/`.webp`) into `public/carousel/` to add or change a slide
  -- `lib/carousel.js` reads that folder at request time and sorts by the
  trailing number, so no code change is needed. When there's at least one
  image, `components/Carousel.js` itself **is** the full-screen homepage
  hero (not a boxed section below it) -- a "peek" slider that shows the
  active photo centered and large with a sliver of the previous/next
  photo visible at each edge, real transform motion (translate + scale,
  not just a crossfade), autoplay every 5.5s, pauses on hover. Left/right
  arrows only fade in while hovering the hero -- there's intentionally no
  dot/indicator bar. The hero copy (logo/heading/CTA) sits on a dark
  gradient scrim over the photo, using `Button`'s `onDark` variant so the
  CTA stays legible on dark photography. If `public/carousel/` is empty,
  the homepage falls back to a plain text-only hero (same copy, original
  white/paper styling) so the page still works with zero photos.
- **Footer**: real contact info (phone, address, Instagram/Facebook/
  LinkedIn), provided 2026-10-19 -- `components/Footer.js`.
- **About / Contact / FAQ pages**: `/about` and `/contact` use Jamil's
  real brand copy and contact details. `/faq` is a first-draft set of
  Q&A based only on what's actually confirmed so far (payment methods,
  local production) -- flagged here because it has NOT been reviewed by
  Jamil; update `app/faq/page.js`'s `FAQS` array once he's seen it,
  especially real shipping times and a real return policy.
- **Image aspect ratio**: product cards and the product detail page use
  `aspect-[2/3]` -- matches the real product photos' actual ratio. The
  original `aspect-[3/4]` was visibly cropping every photo (this is what
  "zoomed/halved" images looked like); don't change this back without
  checking new photos' actual dimensions first.

- `npm run dev` -- start the dev server
- `npm run build` -- production build
- `npm run start` -- run a production build
- `npm run lint` -- ESLint
- `npm run seed` -- populate the real catalog (categories/products) in MongoDB
