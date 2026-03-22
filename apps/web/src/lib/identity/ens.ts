/**
 * ENS brand identity verification.
 *
 * Businesses can optionally link their ENS name to their ProspectAgent profile.
 * This lets the agent surface an on-chain verified badge on their prospect replies
 * and proves brand authenticity — especially useful for known web3 brands.
 *
 * How it works:
 *  1. Company enters their ENS name (e.g. "acmeinc.eth") in the dashboard
 *  2. We resolve it to an address and check it matches their connected wallet
 *  3. If it matches, we mark them as ENS-verified in the DB
 *  4. The agent appends a subtle verification note to the company profile context
 *     so generated replies can reference the brand's on-chain identity if relevant
 */

import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

// ENS is on Ethereum mainnet — need a mainnet client for resolution
const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http('https://cloudflare-eth.com'),
});

export interface EnsVerification {
  verified: boolean;
  ensName?: string;
  resolvedAddress?: string;
  avatar?: string | null;
  twitterHandle?: string | null;
}

/**
 * Verify that an ENS name resolves to the given wallet address.
 * Also fetches avatar and Twitter handle from ENS text records.
 */
export async function verifyEnsName(
  ensName: string,
  walletAddress: string
): Promise<EnsVerification> {
  try {
    const normalized = normalize(ensName);

    const [resolvedAddress, avatar, twitterHandle] = await Promise.all([
      mainnetClient.getEnsAddress({ name: normalized }),
      mainnetClient.getEnsAvatar({ name: normalized }).catch(() => null),
      mainnetClient
        .getEnsText({ name: normalized, key: 'com.twitter' })
        .catch(() => null),
    ]);

    if (!resolvedAddress) {
      return { verified: false };
    }

    const verified = resolvedAddress.toLowerCase() === walletAddress.toLowerCase();

    return {
      verified,
      ensName: normalized,
      resolvedAddress,
      avatar,
      twitterHandle,
    };
  } catch {
    return { verified: false };
  }
}

/**
 * Reverse-lookup: given a wallet address, find the primary ENS name.
 * Used to auto-suggest the ENS name during onboarding.
 */
export async function lookupEnsName(walletAddress: string): Promise<string | null> {
  try {
    return await mainnetClient.getEnsName({ address: walletAddress as `0x${string}` });
  } catch {
    return null;
  }
}
