/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["sharp", "dxf"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },

  webpack: (config, { dev }) => {
    if (dev) {
      // Desabilita cache de filesystem em dev para evitar chunks obsoletos
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
