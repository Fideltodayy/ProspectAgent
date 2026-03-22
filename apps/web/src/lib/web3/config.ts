import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const wagmiConfig = getDefaultConfig({
  appName: 'ProspectAgent',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'prospect-agent',
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: true,
});

// USDC on Base mainnet
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
// USDC on Base Sepolia (testnet)
export const USDC_ADDRESS_TESTNET = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const;

// Set via env after contract deployment
export const SUBSCRIPTION_CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ADDRESS ?? ''
) as `0x${string}`;

export const IS_TESTNET = process.env.NEXT_PUBLIC_USE_TESTNET === 'true';

export function getUsdcAddress(): `0x${string}` {
  return IS_TESTNET ? USDC_ADDRESS_TESTNET : USDC_ADDRESS;
}
