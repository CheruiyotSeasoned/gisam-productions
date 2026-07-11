/** @type {import('next').NextConfig} */

// Deployed on Vercel (standard Next.js build). The app is fully client-rendered
// and reads all data from the PHP API at NEXT_PUBLIC_API_URL.
//
// To instead produce a static bundle for a plain static host (e.g. cPanel/Netlify),
// set STATIC_EXPORT=true at build time — it emits an `out/` folder.
const staticExport = process.env.STATIC_EXPORT === "true";

const nextConfig = {
  ...(staticExport ? { output: "export" } : {}),
  ...(process.env.NEXT_BUILD_DIR ? { distDir: process.env.NEXT_BUILD_DIR } : {}),
  trailingSlash: true,
  images: {
    // Images (logos, uploads) come from the backend/CMS via plain <img>; skip the
    // optimizer so no remote host config is required.
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
  },
};

export default nextConfig;
