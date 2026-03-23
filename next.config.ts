import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        perf_hooks: false,
        os: false,
        child_process: false,
        worker_threads: false,
        cluster: false,
        readline: false,
      };
    }
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

export default nextConfig;
