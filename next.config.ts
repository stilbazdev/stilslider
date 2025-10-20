/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // CORS headers ekle
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization' }
        ],
      },
    ];
  },

  // Image domain'lerini ekle
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },

  // WordPress içerikleri için rewrite
  async rewrites() {
    return [
      {
        source: '/wp-content/:path*',
        destination: 'http://localhost/ruzgar/wp-content/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost/ruzgar/wp-content/uploads/:path*',
      },
    ];
  },

  // Webpack config for three.js
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}

export default nextConfig