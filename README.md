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
   - `RESEND_API_KEY` -- from https://resend.com/api-keys. Only needed for
     customer order-status emails; everything else works without it (an
     order without a customer email just skips the email either way).

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
  hero (not a boxed section below it, and not literally 100vh -- it's
  `92vh` capped at `820px` so the next section visibly peeks in at the
  bottom of the first viewport, so it's clear the page keeps going).
  It's a cinema-reel / coverflow slider: the active photo is a large
  square card popped front-and-center, with the previous/next photo
  visibly showing behind it to each side, scaled down and dimmed -- only
  those three are ever in the DOM. Cards are square (`.hero-slide` in
  `app/globals.css`) to match the real photos' actual ~1:1 ratio, and the
  peek offset is a plain CSS custom property in `globals.css` (Tailwind's
  arbitrary-property bracket syntax for a `--custom-prop` didn't reliably
  generate -- that's what caused the first version to render one
  full-bleed image with no visible peek at all). Real transform motion
  (translate + scale, not just a crossfade), autoplay every 5.5s, pauses
  on hover. Left/right arrows only fade in while hovering the hero --
  there's intentionally no dot/indicator bar. The hero copy (logo/big
  heading/CTA) sits on a dark gradient scrim over the photos, using
  `Button`'s `onDark` variant so the CTA stays legible on dark
  photography. If `public/carousel/` is empty, the homepage falls back
  to a plain text-only hero (same copy, original white/paper styling) so
  the page still works with zero photos.
- **Footer**: real contact info (phone, address, Instagram/Facebook/
  LinkedIn), provided 2026-10-19 -- `components/Footer.js`.
- **About / Contact / FAQ pages**: `/about` and `/contact` use Jamil's
  real brand copy and contact details. `/faq` is a first-draft set of
  Q&A based only on what's actually confirmed so far (payment methods,
  local production) -- flagged here because it has NOT been reviewed by
  Jamil; update `app/faq/page.js`'s `FAQS` array once he's seen it,
  especially real shipping times and a real return policy.
- **Reviews**: `models/Review.js` + `lib/reviews.js` / `lib/actions/reviews.js`.
  Anyone can submit a review from a product's page (`components/
  ReviewForm.js`) -- name, a 1-5 star rating, a comment -- but it always
  lands as `status: "pending"` and is invisible everywhere until an admin
  approves it from the moderation queue at `/admin/reviews` (tabs for
  pending/approved/rejected; the sidebar nav shows a pending-count badge).
  Approving/rejecting recalculates that product's cached `ratingAvg`/
  `ratingCount` on the `Product` document (see `recalcProductRating` in
  `lib/reviews.js`) so `/products` can sort by rating without an
  aggregation on every page load. Approved reviews show on the product's
  own page and a handful of the newest ones show in a "What customers are
  saying" section on the homepage (deliberately not in the navbar, per
  Jamil's request). No customer-account system exists, so this is
  intentionally anonymous (no "verified purchase" check) and has no
  rate-limiting/spam protection yet -- fine at this traffic level, worth
  revisiting if that changes.
- **Shop filtering/sorting**: `/products` now has a sort dropdown
  (`components/SortSelect.js`) alongside the existing collection tabs --
  newest (default), price low-to-high, price high-to-low, highest rated
  -- and they compose (`/products?category=<slug>&sort=<key>`). See the
  `SORTS` map in `lib/products.js` if you need to add another sort key.
- **AI search**: `/products` has a natural-language search box
  (`components/AISearchBar.js`) -- "something woody for winter evenings"
  rather than keywords. `lib/actions/search.js` hands the whole live
  catalog to Gemini (same grounded, stuff-the-catalog-in-the-prompt
  approach as the chatbot) and only ever trusts back a product slug that
  actually exists in it. A successful search navigates to
  `/products?search=...&matched=slug-a,slug-b` so the ranked result is a
  shareable URL and Gemini isn't re-called on every re-render or back
  button -- see `getProductsBySlugs` in `lib/products.js`. An active
  search takes over the whole page (category tabs/sort hide); "Clear
  search" goes back to normal browsing. If Gemini errors, the search box
  shows a plain error and nudges back to browsing by collection.
- **AI recommendations**: every product page has a "You might also
  like" section (`lib/recommendations.js`). There's no customer-account
  system or real purchase history, so this is Gemini reasoning over
  scent notes/mood/collection against the live catalog -- if that call
  fails or returns nothing usable, it falls back to a plain
  same-collection pick rather than erroring the page over a "nice to
  have" section.
- **Review sorting**: a product's review list has its own small sort
  control (newest / highest / lowest rated), reusing the same
  `components/SortSelect.js` as the shop's sort -- it's now a generic
  "update this query param" control, not hardcoded to one param name.
- **Collections -- edit/hide**: `/admin/categories` now supports editing
  a collection's name/description in place and hiding/unhiding it
  (`active` field on `Category`, same soft-delete convention as
  `Product.active` -- a hidden collection drops off the public tabs/
  homepage grid, but any product still assigned to it keeps working).
  The slug is fixed once created (not editable) so existing
  `/products?category=<slug>` links never break. Admin pages (the
  product form's collection dropdown) use the new `getCategoriesAdmin()`
  and see hidden collections too; public pages use `getCategories()`,
  which only returns active ones.
- **Order statuses**: expanded from 5 to 7 --
  `pending/confirmed/processing/shipped/delivered/cancelled/returned` --
  a reasonable default fulfillment lifecycle for a small COD/bank-
  transfer brand. Keep `models/Order.js`'s enum,
  `lib/actions/orders.js`'s `VALID_STATUSES`, and `StatusSelect.js`'s
  `STATUSES` in sync if this list changes. `/admin/orders` now has
  status tabs to filter the list.
- **Admin dashboard**: now shows a "Recent orders" list (not just
  counts) and a "Reviews awaiting approval" tile linking to
  `/admin/reviews`, alongside the existing stats and low-stock list.
- **Order-status emails**: `lib/email.js`, via Resend. When an admin
  changes an order's status (`updateOrderStatus` in
  `lib/actions/orders.js`), it sends a short email to that order's
  customer -- but only if the order actually has one (`customer.email`
  is the optional field on the checkout form, now labeled "we'll send
  order updates here" so shoppers know why it's there). No
  `RESEND_API_KEY`, or no email on the order, both just skip the email
  (a `console.warn`/early return, nothing thrown) -- sending it is
  always best-effort and can never block the actual status update,
  which has already happened by the time the email is attempted.
  Defaults to Resend's shared `onboarding@resend.dev` test address,
  which works without verifying a domain but looks like a test address
  in the inbox -- set `RESEND_FROM_EMAIL` once a real domain is verified
  in the Resend dashboard. There's no customer-account system, so this
  is the only notification channel for now; see the comment on
  `STATUS_COPY` in `lib/email.js` if the per-status wording needs to
  change.
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
