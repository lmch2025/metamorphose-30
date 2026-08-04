import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Optimisation images : on utilise nos propres WebP précompressés (dans /public/images)
  // plutôt que l'optimiseur Next.js (qui ajoute de la latence en dev).
  images: {
    // On sert directement nos WebP via <picture>, on désactive l'optimiseur Next
    unoptimized: true,
    // Formats modernes uniquement
    formats: ["image/webp"],
  },
  // En-têtes de cache long pour les images statiques (immuables)
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache plus court pour les chunks JS (revalidation possible)
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
