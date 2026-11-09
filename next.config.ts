import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site is served through the DDEV router at *.ddev.site.
  allowedDevOrigins: ["*.ddev.site"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.ddev.site"],
    },
  },
  // Scores live in a JSON file and follow a name cookie, so pages stay dynamic.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
