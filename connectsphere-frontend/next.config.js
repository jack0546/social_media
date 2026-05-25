/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'ui-avatars.com'],
  },
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;