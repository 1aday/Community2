/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2gjqh9j26unp0.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'd1hbpr09pwz0sk.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '**.linkedin.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
      // Add any other domains that might serve profile pictures
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ws: false,
      }
    }
    return config
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    timeoutMs: 60000, // 60 seconds
  },
  experimental: {
    serverActions: {
      timeout: 60 // 60 seconds
    }
  }
}

module.exports = nextConfig 