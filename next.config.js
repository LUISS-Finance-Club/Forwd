/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'react-native': false,
      };
    }
    // Optimize wagmi/viem imports
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  // Disable React strict mode to prevent double renders
  reactStrictMode: false,
};

module.exports = nextConfig;
