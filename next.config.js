/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ⚙️ No uses experimental.appDir (ya está activado por defecto desde Next 13+)
  output: "standalone", // ✅ Facilita despliegues en Vercel o servidores

  images: {
    domains: [
      "lh3.googleusercontent.com",
      "secure.gravatar.com",
      "avatars.githubusercontent.com",
    ],
  },
};

export default nextConfig;
