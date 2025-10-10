/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    appDir: true, // ✅ Asegura que App Router se use correctamente
  },

  output: "standalone", // ✅ Evita problemas de prerender y facilita despliegue en Vercel

  images: {
    domains: [
      "lh3.googleusercontent.com",
      "secure.gravatar.com",
      "avatars.githubusercontent.com",
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "http://157.180.118.67:4000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
