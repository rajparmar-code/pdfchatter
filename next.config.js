/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse (via pdfjs-dist) resolves worker/font assets from node_modules
  // at runtime. If webpack bundles it into the route's server chunk, that
  // resolution breaks ("Setting up fake worker failed: Cannot find module
  // '.../pdf.worker.mjs'"). Keeping it external makes Next.js require() it
  // directly from node_modules instead, which preserves that resolution
  // both in `next dev`/`next start` and in Vercel's build output.
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist'],
}

module.exports = nextConfig
