/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "lh3.googleusercontent.com", // Google avatars
      "secure.gravatar.com",
      "avatars.githubusercontent.com"
      // añade otros si necesitas
    ],
  },
};

module.exports = nextConfig;
