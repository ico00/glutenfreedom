/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Poboljšanja sigurnosti
  poweredByHeader: false, // Ukloni X-Powered-By header
  // Performance optimizacije
  compress: true, // Gzip compression
  swcMinify: true, // SWC minification (brže od Terser)
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Disable image optimization for Fly.io (causes 400 errors)
    // Images will be served directly from public folder
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Headers se dodaju kroz middleware
};

export default nextConfig;

