/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@prospect-agent/shared'],
  webpack: (config) => {
    // WalletConnect uses pino-pretty optionally — stub it out in the browser bundle
    config.resolve.fallback = { ...config.resolve.fallback, 'pino-pretty': false };
    return config;
  },
};

export default nextConfig;
