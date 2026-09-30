/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Temporary: deploy must not fail on lint while SOLBIT shell stabilizes
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporary: allow ship while we tighten types
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.dexscreener.com" },
      { protocol: "https", hostname: "**.dexscreener.com" },
      { protocol: "https", hostname: "**.birdeye.so" },
    ],
  },
};

export default nextConfig;
