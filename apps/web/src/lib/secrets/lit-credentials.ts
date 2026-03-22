/**
 * Lit Protocol integration — encrypts company Twitter API credentials.
 *
 * Access condition: only the ProspectAgent wallet address can decrypt,
 * AND only while the company's wallet holds an active on-chain subscription.
 *
 * This means:
 *  1. Credentials are never stored plaintext in the database
 *  2. Even if the DB is compromised, credentials are useless without Lit
 *  3. When a subscription lapses, the agent literally cannot decrypt — hard cutoff
 */

import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { LitNetwork } from '@lit-protocol/constants';

export interface TwitterCredentials {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
  bearerToken: string;
}

let litClient: LitJsSdk.LitNodeClient | null = null;

async function getClient(): Promise<LitJsSdk.LitNodeClient> {
  if (!litClient) {
    litClient = new LitJsSdk.LitNodeClient({ litNetwork: LitNetwork.DatilDev });
    await litClient.connect();
  }
  return litClient;
}

/**
 * Build Lit access control conditions.
 * Decryption is allowed only if:
 *  - The caller is the ProspectAgent wallet, AND
 *  - The company's subscriber wallet has an active on-chain subscription
 */
function buildAccessConditions(
  subscriberWallet: string,
  subscriptionContractAddress: string,
  agentWallet: string
): object[] {
  return [
    // Condition 1: caller must be the agent wallet
    {
      conditionType: 'evmBasic',
      contractAddress: '',
      standardContractType: '',
      chain: 'base',
      method: '',
      parameters: [':userAddress'],
      returnValueTest: { comparator: '=', value: agentWallet.toLowerCase() },
    },
    { operator: 'and' },
    // Condition 2: subscriber wallet must have active on-chain subscription
    {
      conditionType: 'evmContract',
      contractAddress: subscriptionContractAddress,
      functionName: 'hasAccess',
      functionParams: [subscriberWallet],
      functionAbi: {
        name: 'hasAccess',
        type: 'function',
        stateMutability: 'view',
        inputs: [{ name: 'subscriber', type: 'address' }],
        outputs: [{ name: '', type: 'bool' }],
      },
      chain: 'base',
      returnValueTest: { key: '', comparator: '=', value: 'true' },
    },
  ];
}

/**
 * Encrypt Twitter credentials for a company using Lit Protocol.
 * Call this when a company saves their Twitter API keys.
 * Store the returned { ciphertext, dataToEncryptHash } in the DB — never the raw keys.
 */
export async function encryptCredentials(
  credentials: TwitterCredentials,
  subscriberWallet: string,
  subscriptionContractAddress: string,
  agentWallet: string
): Promise<{ ciphertext: string; dataToEncryptHash: string }> {
  const client = await getClient();

  const plaintext = JSON.stringify(credentials);
  const accessControlConditions = buildAccessConditions(
    subscriberWallet,
    subscriptionContractAddress,
    agentWallet
  );

  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    { dataToEncrypt: plaintext, accessControlConditions } as Parameters<typeof LitJsSdk.encryptString>[0],
    client
  );

  return { ciphertext, dataToEncryptHash };
}

/**
 * Decrypt Twitter credentials for a company.
 * Called by the agent service when it needs to post a reply.
 * Requires a valid agent session signature — only succeeds if subscription is active.
 */
export async function decryptCredentials(
  ciphertext: string,
  dataToEncryptHash: string,
  subscriberWallet: string,
  subscriptionContractAddress: string,
  agentWallet: string,
  agentSessionSigs: object
): Promise<TwitterCredentials> {
  const client = await getClient();

  const accessControlConditions = buildAccessConditions(
    subscriberWallet,
    subscriptionContractAddress,
    agentWallet
  );

  const decrypted = await LitJsSdk.decryptToString(
    {
      ciphertext,
      dataToEncryptHash,
      accessControlConditions,
      sessionSigs: agentSessionSigs,
      chain: 'base',
    } as Parameters<typeof LitJsSdk.decryptToString>[0],
    client
  );

  return JSON.parse(decrypted) as TwitterCredentials;
}
