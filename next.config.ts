import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
  /* config options here */
};

export default nextConfig;
