/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: [
      "lh3.googleusercontent.com", // Google avatars
      "secure.gravatar.com",
      "avatars.githubusercontent.com"
      // 🔹 Agrega aquí otros dominios de imágenes si los necesitas
    ],
  },

  // 🔹 Proxy interno para evitar CORS y Mixed Content
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*", // Todo lo que empiece por /api/proxy
        destination: "http://157.180.118.67:4000/api/:path*", // Se reenvía al backend en Hetzner
      },
    ];
  },
};

export default nextConfig;
