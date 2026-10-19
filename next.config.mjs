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
  // Admin product photos now upload to Vercel Blob (lib/blob.js), which
  // serves them from this wildcard host -- next/image refuses to
  // optimize an image from a host that isn't listed here.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Default is 1MB, which the raw multipart body of a single admin
      // photo upload blows past immediately (this is what "Body exceeded
      // 1 MB limit" on /admin/products/new was). blob.js already caps
      // each file at 8MB; this just needs enough headroom for a few of
      // those in one submit plus multipart overhead.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
