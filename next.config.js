/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  },
  // Increase the timeout for API routes if needed
  experimental: {
    serverActions: {
      timeout: 120, // 2 minutes
    },
  },
};

module.exports = nextConfig; 