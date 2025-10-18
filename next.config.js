/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Existing fallbacks
        '@react-native-async-storage/async-storage': false,
        'react-native': false,
        // iExec fallbacks
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      };
    }
    
    // Optimize wagmi/viem imports
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Handle ESM modules for iExec
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config;
  },
  // Disable React strict mode to prevent double renders
  reactStrictMode: false,
};

module.exports = nextConfig;
