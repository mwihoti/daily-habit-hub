import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { avalanche, avalancheFuji } from 'wagmi/chains';
import { http } from 'wagmi';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '04ca51fe9423d73dcd48f654060a7751'; // Fallback to a default for dev if possible, but user should get their own

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID && typeof window !== 'undefined') {
  console.warn('Daily Habit Hub: NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing. Mobile wallet connection will fail. Get one at https://cloud.walletconnect.com');
}

export const config = getDefaultConfig({
  appName: 'Daily Habit Hub',
  projectId: projectId,
  chains: [avalanche, avalancheFuji],
  transports: {
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
  },
  ssr: true,
});
