import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // share cards read the Anton font and public/assets from disk
  outputFileTracingIncludes: { "/[lang]/**/opengraph-image": ["./src/assets/fonts/**", "./public/assets/**"] },
};

export default nextConfig;
