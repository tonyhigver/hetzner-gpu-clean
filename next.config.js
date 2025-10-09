/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: [
      "lh3.googleusercontent.com",
      "secure.gravatar.com",
      "avatars.githubusercontent.com"
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
