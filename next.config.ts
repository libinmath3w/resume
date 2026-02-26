import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  turbopack: {},
  webpack: (config) => {
    // Add support for importing shader files
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });
    
    return config;
  },
  // Add security headers for the proxy functionality
  async headers() {
    return [
      {
        source: '/infinite',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'; frame-src * data:; default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
          },
        ],
      },
      {
        source: '/api/infinite',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
        ],
      }
    ];
  },
  // Add CORS and rewrites for specific embedded content
  async rewrites() {
    return [
      {
        source: '/embed/youtube/:id',
        destination: 'https://www.youtube.com/embed/:id'
      },
      {
        source: '/embed/vimeo/:id',
        destination: 'https://player.vimeo.com/video/:id'
      }
    ];
  },
};

export default nextConfig;
