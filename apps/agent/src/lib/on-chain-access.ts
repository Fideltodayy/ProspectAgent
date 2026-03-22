/**
 * On-chain access verification.
 *
 * Before processing any monitoring job, the agent checks the company's
 * subscription status directly on the Base L2 smart contract.
 * This is the source of truth — not the database.
 *
 * Why on-chain? It's trustless. Even if our DB says "active", if the
 * on-chain subscription has lapsed, the agent won't run. This is the
 * "Agents That Pay" theme in action — payment and service delivery
 * are cryptographically linked.
 */

import { createPublicClient, http, type Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';

const IS_TESTNET = process.env.USE_TESTNET === 'true';

const publicClient = createPublicClient({
  chain: IS_TESTNET ? baseSepolia : base,
  transport: http(IS_TESTNET ? 'https://sepolia.base.org' : 'https://mainnet.base.org'),
});

const SUBSCRIPTION_ABI = [
  {
    name: 'hasAccess',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'subscriber', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

const contractAddress = (process.env.SUBSCRIPTION_CONTRACT_ADDRESS ?? '') as Address;

/**
 * Returns true if the wallet address has an active trial or paid subscription on-chain.
 * The agent calls this before processing each company's monitoring job.
 */
export async function hasOnChainAccess(walletAddress: string): Promise<boolean> {
  if (!contractAddress) {
    // Contract not deployed yet — fall back to DB-only check during development
    console.warn('[on-chain] SUBSCRIPTION_CONTRACT_ADDRESS not set, skipping on-chain check');
    return true;
  }

  try {
    const active = await publicClient.readContract({
      address: contractAddress,
      abi: SUBSCRIPTION_ABI,
      functionName: 'hasAccess',
      args: [walletAddress as Address],
    });

    return active;
  } catch (err) {
    console.error('[on-chain] hasAccess check failed:', err);
    // Fail open in case of RPC issues — log and continue
    return true;
  }
}
