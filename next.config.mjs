/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Cache Components (Next 16's new opt-in prerendering model) is left off on purpose:
  // it requires wrapping every dynamic read (cookies, DB queries, auth) in Suspense
  // boundaries or 'use cache' directives. This app is mostly dynamic (cart, checkout,
  // admin, auth), so the classic request-time rendering model is the safer, faster
  // path to a working build under a tight deadline.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Once real product photos exist, add their host(s) here (e.g. an S3
  // bucket or Cloudinary domain) so next/image is allowed to optimize
  // them -- until then every product falls back to the placeholder art,
  // so this list stays empty.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
